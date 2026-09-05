import { Router } from 'express';
import {
  acceptComplaintChallenge,
  createUniversity,
  getUniversities,
  getUniversityChallenges,
  getUniversityProfile,
  updateUniversityProfile
} from '../controllers/universityController.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// List all universities
router.get('/', auth, getUniversities);

// Admin creates university profile
router.post('/', auth, requireRole(['admin']), createUniversity);

// Get current logged-in university's profile
router.get('/me', auth, requireRole(['university', 'admin']), getUniversityProfile);

// Update current logged-in university's profile
router.put('/me', auth, requireRole(['university', 'admin']), updateUniversityProfile);

// University views matched challenges
router.get('/:id/challenges', auth, requireRole(['university', 'admin']), getUniversityChallenges);

// University accepts complaint challenge
router.post('/:id/accept/:complaintId', auth, requireRole(['university']), acceptComplaintChallenge);

export default router;
