import { Router } from 'express';
import { getIndustryPartners } from '../controllers/industryController.js';
import { auth } from '../middleware/auth.js';

// TODO: Add industry invitation and engagement management routes.
const router = Router();

router.get('/', auth, getIndustryPartners);

export default router;
