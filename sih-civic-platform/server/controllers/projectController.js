import Project from '../models/Project.js';
import IndustryPartner from '../models/IndustryPartner.js';
import Complaint from '../models/Complaint.js';
import University from '../models/University.js';
import { notifyUser } from '../services/notificationService.js';
import { sendMail } from '../services/emailService.js';

/**
 * GET /api/projects/:id
 * Fetch single project populated with complaint, university, and industry partner
 */
export async function getProjectById(req, res, next) {
  try {
    const project = await Project.findById(req.params.id)
      .populate('complaintId')
      .populate('universityId')
      .populate('industryPartnerId');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/projects
 * List projects. If ?industryPartnerId=me, filter for logged-in industry partner.
 */
export async function getProjects(req, res, next) {
  try {
    const query = {};

    if (req.query.industryPartnerId === 'me' || req.user.role === 'industry') {
      const partner = await IndustryPartner.findOne({ userId: req.user.id });
      if (!partner) {
        return res.status(200).json({
          success: true,
          projects: []
        });
      }
      query.industryPartnerId = partner._id;
    } else if (req.query.industryPartnerId) {
      query.industryPartnerId = req.query.industryPartnerId;
    }

    if (req.query.universityId) {
      query.universityId = req.query.universityId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const projects = await Project.find(query)
      .populate('complaintId', 'title description district category status')
      .populate('universityId', 'name contactEmail location')
      .populate('industryPartnerId', 'name contactEmail type')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/projects/:id/milestones
 * Role: university
 * Body: { action: "add" | "update", milestone, milestoneId }
 * If all milestones are "done", update project.status = "completed" and notify citizen
 */
export async function updateMilestones(req, res, next) {
  try {
    const { action, milestone, milestoneId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (action === 'add') {
      if (!milestone || !milestone.title) {
        return res.status(400).json({ success: false, message: 'Milestone title is required' });
      }
      project.milestones.push({
        title: milestone.title,
        dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
        status: milestone.status || 'pending'
      });
    } else if (action === 'update') {
      if (!milestoneId) {
        return res.status(400).json({ success: false, message: 'milestoneId is required for update' });
      }
      const existing = project.milestones.id(milestoneId);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Milestone not found' });
      }
      if (milestone.title !== undefined) existing.title = milestone.title;
      if (milestone.dueDate !== undefined) existing.dueDate = milestone.dueDate;
      if (milestone.status !== undefined) existing.status = milestone.status;
    } else {
      return res.status(400).json({ success: false, message: 'Action must be "add" or "update"' });
    }

    // Check if all milestones are done
    const allDone = project.milestones.length > 0 && project.milestones.every((m) => m.status === 'done');
    if (allDone && project.status !== 'completed') {
      project.status = 'completed';

      // Update linked complaint status to resolved
      const complaint = await Complaint.findById(project.complaintId);
      if (complaint) {
        complaint.status = 'resolved';
        await complaint.save();

        // Notify citizen that complaint is resolved
        await notifyUser(
          complaint.submittedBy,
          `Congratulations! All milestones for project addressing your complaint "${complaint.title}" are completed and resolved!`,
          'complaint_resolved',
          complaint._id
        );
      }
    }

    await project.save();

    return res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/projects/:id/team
 * Role: university
 * Body: { action: "add" | "remove", member, memberId }
 */
export async function updateTeam(req, res, next) {
  try {
    const { action, member, memberId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (action === 'add') {
      if (!member || !member.name || !member.role) {
        return res.status(400).json({
          success: false,
          message: 'Member name and role ("student" | "faculty_mentor") are required'
        });
      }
      project.team.push({
        name: member.name,
        role: member.role
      });
    } else if (action === 'remove') {
      if (!memberId) {
        return res.status(400).json({
          success: false,
          message: 'memberId is required for remove'
        });
      }
      project.team.pull({ _id: memberId });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action must be "add" or "remove"'
      });
    }

    await project.save();

    return res.status(200).json({
      success: true,
      team: project.team
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/projects/:id/invite-industry
 * Role: university
 * Body: { industryPartnerId }
 */
export async function inviteIndustry(req, res, next) {
  try {
    const { industryPartnerId } = req.body;

    if (!industryPartnerId) {
      return res.status(400).json({
        success: false,
        message: 'industryPartnerId is required'
      });
    }

    const project = await Project.findById(req.params.id).populate('complaintId universityId');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const partner = await IndustryPartner.findById(industryPartnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Industry Partner not found'
      });
    }

    project.industryPartnerId = partner._id;
    await project.save();

    // Create in-app notification for the industry user
    await notifyUser(
      partner.userId,
      `You've been invited by ${project.universityId?.name || 'a university'} to collaborate on project solving "${project.complaintId?.title}".`,
      'industry_invitation',
      project._id
    );

    // Send email invitation
    if (partner.contactEmail) {
      await sendMail({
        to: partner.contactEmail,
        subject: "You've been invited to a project on Samadhan Setu",
        text: `Hello ${partner.name},\n\nYou have been invited to collaborate on a civic resolution project: "${project.complaintId?.title}".\nUniversity: ${project.universityId?.name}\nDescription: ${project.complaintId?.description}\n\nPlease log in to review and accept the invitation.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Industry partner invited successfully',
      project
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/projects/:id/industry-response
 * Role: industry
 * Body: { accepted: Boolean }
 */
export async function respondIndustryInvitation(req, res, next) {
  try {
    let accepted = req.body.accepted;
    if (typeof accepted !== 'boolean') {
      if (req.body.decision === 'accept') accepted = true;
      else if (req.body.decision === 'decline') accepted = false;
    }

    if (typeof accepted !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'accepted field (boolean) or decision ("accept" | "decline") is required'
      });
    }

    const project = await Project.findById(req.params.id).populate('universityId complaintId');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const universityUser = await University.findById(project.universityId?._id);

    if (accepted) {
      project.status = 'approved';
      await project.save();

      // Notify university mentor
      if (universityUser && universityUser.userId) {
        await notifyUser(
          universityUser.userId,
          `An industry partner has ACCEPTED the invitation for project "${project.complaintId?.title}".`,
          'industry_invite_accepted',
          project._id
        );
      }
    } else {
      project.industryPartnerId = null;
      await project.save();

      // Notify university mentor
      if (universityUser && universityUser.userId) {
        await notifyUser(
          universityUser.userId,
          `An industry partner has DECLINED the invitation for project "${project.complaintId?.title}".`,
          'industry_invite_declined',
          project._id
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: accepted ? 'Invitation accepted; project approved' : 'Invitation declined',
      project
    });
  } catch (error) {
    next(error);
  }
}
