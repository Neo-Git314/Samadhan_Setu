import { Router } from 'express';
import { createComplaint, getComplaintById, getComplaints } from '../controllers/complaintController.js';
import { auth } from '../middleware/auth.js';

// TODO: Add pagination, filtering, and role-specific access controls.
const router = Router();

router.get('/', auth, getComplaints);
router.post('/', auth, createComplaint);
router.get('/:id', auth, getComplaintById);

export default router;
