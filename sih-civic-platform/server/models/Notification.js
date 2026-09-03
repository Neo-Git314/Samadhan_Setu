import mongoose from 'mongoose';

// TODO: Support multi-channel notifications, delivery status, and retries.
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
