import { Router } from 'express';
import { login, register } from '../controllers/authController.js';

// TODO: Add auth validation and secure session handling middleware.
const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;
