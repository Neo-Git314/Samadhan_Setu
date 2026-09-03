import { Router } from 'express';
import {
  acceptComplaintChallenge,
  createUniversity,
  getUniversities,
  getUniversityChallenges
} from '../controllers/universityController.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// List all universities
router.get('/', auth, getUniversities);

// Admin creates university profile
router.post('/', auth, requireRole(['admin']), createUniversity);

// University views matched challenges
router.get('/:id/challenges', auth, requireRole(['university', 'admin']), getUniversityChallenges);

// University accepts complaint challenge
router.post('/:id/accept/:complaintId', auth, requireRole(['university']), acceptComplaintChallenge);

export default router;
