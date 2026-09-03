import { Router } from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

// TODO: Add notification preference and mark-as-read routes.
const router = Router();

router.get('/', auth, getNotifications);

export default router;
