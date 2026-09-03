import mongoose from 'mongoose';

// TODO: Add university capabilities, focus areas, and verification details.
const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profile: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('University', universitySchema);
