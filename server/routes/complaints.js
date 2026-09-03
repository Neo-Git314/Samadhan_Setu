import { Router } from 'express';
import {
  createComplaint,
  getComplaintById,
  getComplaintDuplicates,
  getComplaints,
  updateComplaintStatus
} from '../controllers/complaintController.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { upload } from '../middleware/upload.js';

const router = Router();

// Citizens create complaints with optional image uploads (max 5)
router.post('/', auth, requireRole(['citizen']), upload.array('images', 5), createComplaint);

// List complaints with role-based access & query filters
router.get('/', auth, getComplaints);

// Fetch complaint duplicates tree
router.get('/:id/duplicates', auth, getComplaintDuplicates);

// Single complaint detail
router.get('/:id', auth, getComplaintById);

// Admin updates complaint status
router.patch('/:id/status', auth, requireRole(['admin']), updateComplaintStatus);

export default router;
