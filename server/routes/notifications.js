import { Router } from 'express';
import { getNotifications, markNotificationAsRead } from '../controllers/notificationController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// List current user's notifications (supports ?unreadOnly=true)
router.get('/', auth, getNotifications);

// Mark notification as read
router.patch('/:id/read', auth, markNotificationAsRead);

export default router;
