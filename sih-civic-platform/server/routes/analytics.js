import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { auth } from '../middleware/auth.js';

// TODO: Add scoped analytics endpoints for each platform role.
const router = Router();

router.get('/', auth, getAnalytics);

export default router;
