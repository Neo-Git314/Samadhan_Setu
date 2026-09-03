import { Router } from 'express';
import { getUniversities } from '../controllers/universityController.js';
import { auth } from '../middleware/auth.js';

// TODO: Add university profile CRUD and challenge endpoints.
const router = Router();

router.get('/', auth, getUniversities);

export default router;
