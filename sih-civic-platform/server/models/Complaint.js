import mongoose from 'mongoose';

// TODO: Capture complete complaint lifecycle, evidence, and moderation metadata.
const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model('Complaint', complaintSchema);
