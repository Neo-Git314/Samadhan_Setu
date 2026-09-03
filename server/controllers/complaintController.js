import Complaint from '../models/Complaint.js';
import { uploadBuffer } from '../services/cloudinaryService.js';
import { classifyComplaint, analyzeImage, getEmbedding } from '../services/aiService.js';
import { checkDuplicates } from '../services/dedupService.js';
import { matchUniversities } from '../services/matchingService.js';
import { notifyUser } from '../services/notificationService.js';

/**
 * Background async pipeline for AI classification, image analysis, embedding,
 * deduplication, and university matching.
 */
async function runBackgroundComplaintProcessing(complaintId) {
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return;

    const fullText = `${complaint.title}. ${complaint.description}`;

    // 1. Classification
    try {
      const classResult = await classifyComplaint(fullText);
      if (classResult && classResult.category) {
        complaint.category = classResult.category;
        complaint.categoryConfidence = classResult.confidence || 0;
        complaint.urgency = classResult.urgency || 'medium';
        if (complaint.categoryConfidence < 0.6) {
          complaint.needsReview = true;
        }
      }
    } catch (err) {
      console.error('[AI Processing] Classification error:', err.message);
    }

    // 2. Image Analysis
    try {
      if (complaint.mediaUrls && complaint.mediaUrls.length > 0) {
        const imageResult = await analyzeImage(complaint.mediaUrls[0], complaint.description);
        if (imageResult) {
          complaint.imageAnalysis = {
            caption: imageResult.caption || '',
            tags: imageResult.tags || [],
            relevanceScore: imageResult.relevanceScore || 0
          };
          if (imageResult.relevanceScore < 0.4) {
            complaint.needsReview = true;
          }
        }
      }
    } catch (err) {
      console.error('[AI Processing] Image analysis error:', err.message);
    }

    // 3. Embedding
    try {
      const vector = await getEmbedding(fullText);
      if (Array.isArray(vector) && vector.length > 0) {
        complaint.embedding = vector;
      }
    } catch (err) {
      console.error('[AI Processing] Embedding error:', err.message);
    }

    // Save enriched complaint before dedup and matching
    await complaint.save();

    // 4. Deduplication
    const dedupResult = await checkDuplicates(complaint._id);

    // 5. University Matching (only if not a duplicate)
    if (!dedupResult.isDuplicate) {
      await matchUniversities(complaint._id);
    }
  } catch (error) {
    console.error('[AI Processing] Pipeline execution failure:', error.message);
  }
}

/**
 * POST /api/complaints
 */
export async function createComplaint(req, res, next) {
  try {
    const { title, description, district } = req.body;

    if (!title || !description || !district) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and district are required'
      });
    }

    // Parse location (handles stringified JSON from multipart forms or plain object)
    let parsedLocation = { lat: 0, lng: 0, address: '' };
    if (req.body.location) {
      if (typeof req.body.location === 'string') {
        try {
          parsedLocation = JSON.parse(req.body.location);
        } catch (_e) {
          parsedLocation = { lat: 0, lng: 0, address: req.body.location };
        }
      } else if (typeof req.body.location === 'object') {
        parsedLocation = req.body.location;
      }
    }

    // Handle image uploads to Cloudinary
    const mediaUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const url = await uploadBuffer(file.buffer, 'samadhan_setu/complaints');
          if (url) mediaUrls.push(url);
        } catch (uploadErr) {
          console.error('[Complaint Upload] Cloudinary upload error:', uploadErr.message);
        }
      }
    } else if (req.body.mediaUrls) {
      if (Array.isArray(req.body.mediaUrls)) {
        mediaUrls.push(...req.body.mediaUrls);
      } else if (typeof req.body.mediaUrls === 'string') {
        try {
          const parsed = JSON.parse(req.body.mediaUrls);
          if (Array.isArray(parsed)) mediaUrls.push(...parsed);
          else mediaUrls.push(req.body.mediaUrls);
        } catch (_e) {
          mediaUrls.push(req.body.mediaUrls);
        }
      }
    }

    const complaint = new Complaint({
      submittedBy: req.user.id,
      title: title.trim(),
      description: description.trim(),
      location: {
        lat: Number(parsedLocation.lat) || 0,
        lng: Number(parsedLocation.lng) || 0,
        address: parsedLocation.address || ''
      },
      district: district.trim(),
      mediaUrls,
      status: 'pending'
    });

    await complaint.save();

    // Launch background AI enrichment without blocking HTTP response
    setImmediate(() => {
      runBackgroundComplaintProcessing(complaint._id);
    });

    return res.status(201).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/complaints
 */
export async function getComplaints(req, res, next) {
  try {
    const { status, category, district, page = 1, limit = 20, submittedBy } = req.query;

    const query = {};

    // If submittedBy=me or user is citizen
    if (submittedBy === 'me' || req.user.role === 'citizen') {
      query.submittedBy = req.user.id;
    } else {
      // Must be admin or university
      if (!['admin', 'university'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden: unauthorized role'
        });
      }
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (district) query.district = district;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('submittedBy', 'name email phone')
        .populate('assignedUniversity', 'name location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Complaint.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      complaints
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/complaints/:id
 */
export async function getComplaintById(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone organization')
      .populate('assignedUniversity', 'name location disciplines contactEmail');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    return res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/complaints/:id/duplicates
 */
export async function getComplaintDuplicates(req, res, next) {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Complaints that marked this complaint as their duplicateOf
    const duplicatesOfThis = await Complaint.find({ duplicateOf: complaint._id });

    // The parent complaint if this complaint itself is marked as duplicateOf
    let parentComplaint = null;
    if (complaint.duplicateOf) {
      parentComplaint = await Complaint.findById(complaint.duplicateOf);
    }

    return res.status(200).json({
      success: true,
      complaintId: complaint._id,
      duplicateOf: parentComplaint,
      duplicates: duplicatesOfThis
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/complaints/:id/status
 */
export async function updateComplaintStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'assigned', 'in_progress', 'resolved', 'duplicate'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    await complaint.save();

    // Trigger notification if assigned or resolved
    if ((status === 'assigned' || status === 'resolved') && oldStatus !== status) {
      await notifyUser(
        complaint.submittedBy,
        `Your complaint "${complaint.title}" status has been updated to "${status}".`,
        'complaint_status_updated',
        complaint._id
      );
    }

    return res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    next(error);
  }
}
