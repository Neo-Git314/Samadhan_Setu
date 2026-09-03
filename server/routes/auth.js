import { Router } from 'express';
import { getMe, login, register } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected user endpoint
router.get('/me', auth, getMe);

export default router;
