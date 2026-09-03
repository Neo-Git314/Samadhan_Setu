import Notification from '../models/Notification.js';

/**
 * GET /api/notifications
 * Returns current user's notifications sorted by createdAt: -1
 * Supports ?unreadOnly=true
 */
export async function getNotifications(req, res, next) {
  try {
    const query = { userId: req.user.id };

    if (req.query.unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false
    });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks notification as read
 */
export async function markNotificationAsRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
}
