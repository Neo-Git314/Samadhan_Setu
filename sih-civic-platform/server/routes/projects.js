import { Router } from 'express';
import {
  getProjectById,
  getProjects,
  inviteIndustry,
  respondIndustryInvitation,
  updateMilestones,
  updateTeam
} from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// List projects (supports ?industryPartnerId=me)
router.get('/', auth, getProjects);

// Fetch single project by id
router.get('/:id', auth, getProjectById);

// University updates milestones
router.patch('/:id/milestones', auth, requireRole(['university', 'admin']), updateMilestones);

// University manages project team
router.patch('/:id/team', auth, requireRole(['university', 'admin']), updateTeam);

// University invites industry partner
router.post('/:id/invite-industry', auth, requireRole(['university', 'admin']), inviteIndustry);

// Industry partner accepts or declines invitation
router.patch('/:id/industry-response', auth, requireRole(['industry']), respondIndustryInvitation);

export default router;
