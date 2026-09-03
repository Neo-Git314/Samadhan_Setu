import { Router } from 'express';
import { getProjects } from '../controllers/projectController.js';
import { auth } from '../middleware/auth.js';

// TODO: Add project creation, review, and collaboration routes.
const router = Router();

router.get('/', auth, getProjects);

export default router;
