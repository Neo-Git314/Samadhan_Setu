import Notification from '../models/Notification.js';

/**
 * Creates an in-app notification for a given user.
 * @param {string|mongoose.Types.ObjectId} userId
 * @param {string} message
 * @param {string} type
 * @param {string|mongoose.Types.ObjectId|null} relatedId
 * @returns {Promise<Notification>}
 */
export async function notifyUser(userId, message, type, relatedId = null) {
  try {
    if (!userId || !message) {
      console.warn('[NotificationService] Missing userId or message for notification');
      return null;
    }

    const notification = await Notification.create({
      userId,
      message,
      type: type || 'general',
      relatedId: relatedId || null
    });

    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
}

export default {
  notifyUser
};
