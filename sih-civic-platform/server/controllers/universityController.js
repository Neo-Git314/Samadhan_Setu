import University from '../models/University.js';
import Complaint from '../models/Complaint.js';
import Project from '../models/Project.js';
import { getEmbedding } from '../services/aiService.js';
import { notifyUser } from '../services/notificationService.js';

/**
 * GET /api/universities
 * List all universities
 */
export async function getUniversities(_req, res, next) {
  try {
    const universities = await University.find({}).populate('userId', 'name email');
    return res.status(200).json({
      success: true,
      universities
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/universities
 * Role: admin
 * Create university profile and cache researchEmbedding
 */
export async function createUniversity(req, res, next) {
  try {
    const { userId, name, location, disciplines, researchKeywords, incubationFacility, contactEmail } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        message: 'userId and name are required'
      });
    }

    const keywordList = Array.isArray(researchKeywords) ? researchKeywords : [];
    const textToEmbed = keywordList.length > 0
      ? keywordList.join(' ')
      : `${name} ${(Array.isArray(disciplines) ? disciplines : []).join(' ')}`;

    let researchEmbedding = [];
    try {
      researchEmbedding = await getEmbedding(textToEmbed);
    } catch (err) {
      console.error('[University Creation] Failed to generate embedding:', err.message);
    }

    const university = new University({
      userId,
      name: name.trim(),
      location: location || { lat: 0, lng: 0 },
      disciplines: Array.isArray(disciplines) ? disciplines : [],
      researchKeywords: keywordList,
      researchEmbedding,
      incubationFacility: Boolean(incubationFacility),
      contactEmail: contactEmail ? contactEmail.trim().toLowerCase() : ''
    });

    await university.save();

    return res.status(201).json({
      success: true,
      university
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/universities/me
 * Role: university, admin
 * Get current logged-in university's profile
 */
export async function getUniversityProfile(req, res, next) {
  try {
    let university = await University.findOne({ userId: req.user.id });
    if (!university && req.user.role === 'university') {
      // Fallback: search by name or create default profile
      university = await University.findOne({ name: /Birla Institute/i });
      if (!university) {
        university = await University.create({
          userId: req.user.id,
          name: 'Birla Institute of Technology (BIT), Mesra',
          location: { lat: 23.4123, lng: 85.4399 },
          disciplines: ['Water Resources & Sanitation', 'Urban Infrastructure & Mobility', 'Energy & Renewable Systems', 'Environment & Climate Action'],
          researchKeywords: ['hydrology', 'sanitation', 'sensor networks', 'iot monitoring', 'waste management'],
          incubationFacility: true,
          contactEmail: 'university@bitmesra.ac.in'
        });
      }
    }

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      university
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/universities/me
 * Role: university, admin
 * Update current logged-in university's profile and recalculate research embedding
 */
export async function updateUniversityProfile(req, res, next) {
  try {
    const { name, disciplines, researchKeywords, incubationFacility, contactEmail, location } = req.body;

    let university = await University.findOne({ userId: req.user.id });
    if (!university) {
      university = await University.findOne({ name: /Birla Institute/i });
    }

    if (!university) {
      university = new University({
        userId: req.user.id,
        name: name || 'University Innovation Lab',
        location: location || { lat: 23.3648, lng: 85.3346 },
        disciplines: Array.isArray(disciplines) ? disciplines : [],
        researchKeywords: Array.isArray(researchKeywords) ? researchKeywords : [],
        incubationFacility: Boolean(incubationFacility),
        contactEmail: contactEmail || req.user.email
      });
    } else {
      if (name) university.name = name.trim();
      if (disciplines) university.disciplines = Array.isArray(disciplines) ? disciplines : [];
      if (researchKeywords) university.researchKeywords = Array.isArray(researchKeywords) ? researchKeywords : [];
      if (typeof incubationFacility === 'boolean') university.incubationFacility = incubationFacility;
      if (contactEmail) university.contactEmail = contactEmail.trim().toLowerCase();
      if (location) university.location = location;
    }

    // Recompute research embedding
    try {
      const textToEmbed = (university.researchKeywords && university.researchKeywords.length > 0)
        ? university.researchKeywords.join(' ')
        : `${university.name} ${(university.disciplines || []).join(' ')}`;
      const vec = await getEmbedding(textToEmbed);
      if (Array.isArray(vec) && vec.length > 0) {
        university.researchEmbedding = vec;
      }
    } catch (embErr) {
      console.error('[University Profile] Embedding regeneration error:', embErr.message);
    }

    await university.save();

    return res.status(200).json({
      success: true,
      message: 'University profile updated successfully',
      university
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/universities/:id/challenges
 * Role: university, admin
 * Returns matched challenges or all open unassigned challenges when all=true
 * Supports ?tab=assigned (default) vs ?tab=open, excluding routine_municipal
 */
export async function getUniversityChallenges(req, res, next) {
  try {
    let universityId = req.params.id;
    if (universityId === 'me') {
      const uni = (await University.findOne({ userId: req.user.id })) || (await University.findOne({ name: /Birla Institute/i }));
      if (!uni) {
        return res.status(200).json({ success: true, challenges: [], projects: [] });
      }
      universityId = uni._id;
    }

    const tab = req.query.tab || 'assigned';

    if (tab === 'assigned') {
      // 1. Fetch all challenges assigned to this university
      const assignedComplaints = await Complaint.find({
        assignedUniversity: universityId,
        status: { $nin: ['duplicate', 'rejected'] }
      })
        .populate('submittedBy', 'name email phone')
        .sort({ updatedAt: -1, createdAt: -1 });

      // 2. Fetch corresponding Project records
      const projects = await Project.find({ universityId }).populate('complaintId');

      return res.status(200).json({
        success: true,
        challenges: assignedComplaints,
        projects
      });
    }

    // Tab === 'open' (Unassigned open challenges for adoption, excluding routine_municipal)
    const isAll = req.query.all === 'true';
    const openQuery = isAll
      ? {
          assignedUniversity: null,
          status: { $in: ['pending', 'reviewed'] },
          resolutionTrack: { $ne: 'routine_municipal' }
        }
      : {
          assignedUniversity: null,
          resolutionTrack: { $ne: 'routine_municipal' },
          $or: [
            ...(universityId ? [{ 'suggestedUniversities.universityId': universityId }] : []),
            { status: 'pending' }
          ],
          status: { $nin: ['duplicate', 'rejected'] }
        };

    const openComplaints = await Complaint.find(openQuery)
      .populate('submittedBy', 'name email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      challenges: openComplaints,
      projects: []
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/universities/:id/accept/:complaintId
 * Role: university
 * Sets complaint.status = "assigned", complaint.assignedUniversity = id, creates Project with status "proposed"
 */
export async function acceptComplaintChallenge(req, res, next) {
  try {
    let { id: universityId, complaintId } = req.params;

    let university;
    if (universityId === 'me') {
      university = await University.findOne({ userId: req.user.id });
      if (!university) {
        return res.status(404).json({
          success: false,
          message: 'University profile not found for user'
        });
      }
      universityId = university._id;
    } else {
      university = await University.findById(universityId);
    }

    if (!university) {
      return res.status(404).json({
        success: false,
        message: 'University not found'
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    if (complaint.assignedUniversity) {
      return res.status(400).json({
        success: false,
        message: 'Complaint has already been assigned to a university'
      });
    }

    complaint.status = 'assigned';
    complaint.assignedUniversity = universityId;
    await complaint.save();

    // Create the new Project
    const project = new Project({
      complaintId: complaint._id,
      universityId: university._id,
      status: 'proposed',
      team: [],
      milestones: [
        { title: 'Project Proposal & Problem Assessment', dueDate: new Date(Date.now() + 14 * 86400000), status: 'pending' },
        { title: 'Prototype Development', dueDate: new Date(Date.now() + 45 * 86400000), status: 'pending' },
        { title: 'Field Testing & Deployment', dueDate: new Date(Date.now() + 90 * 86400000), status: 'pending' }
      ]
    });

    await project.save();

    // Notify the citizen that university has taken on their complaint
    await notifyUser(
      complaint.submittedBy,
      `Great news! ${university.name} has accepted your civic challenge "${complaint.title}".`,
      'challenge_accepted',
      complaint._id
    );

    return res.status(201).json({
      success: true,
      message: 'Challenge accepted and project initiated',
      complaint,
      project
    });
  } catch (error) {
    next(error);
  }
}
