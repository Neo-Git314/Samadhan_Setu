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
 * GET /api/universities/:id/challenges
 * Role: university
 * Returns complaints where suggestedUniversities.universityId == id, status != "duplicate", assignedUniversity == null
 */
export async function getUniversityChallenges(req, res, next) {
  try {
    const universityId = req.params.id;

    const complaints = await Complaint.find({
      'suggestedUniversities.universityId': universityId,
      status: { $ne: 'duplicate' },
      assignedUniversity: null
    }).populate('submittedBy', 'name email phone');

    return res.status(200).json({
      success: true,
      challenges: complaints
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
    const { id: universityId, complaintId } = req.params;

    const university = await University.findById(universityId);
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
