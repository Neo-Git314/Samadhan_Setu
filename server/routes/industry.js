import { Router } from 'express';
import { createIndustryPartner, getIndustryPartners } from '../controllers/industryController.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// List all industry partners
router.get('/', auth, getIndustryPartners);

// Admin creates industry partner profile
router.post('/', auth, requireRole(['admin']), createIndustryPartner);

export default router;
