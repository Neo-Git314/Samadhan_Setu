import { Router } from 'express';
import { getAnalyticsSummary, getAnalyticsTrends } from '../controllers/analyticsController.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// Platform analytics endpoints (admin only)
router.get('/summary', auth, requireRole(['admin']), getAnalyticsSummary);
router.get('/trends', auth, requireRole(['admin']), getAnalyticsTrends);

export default router;
