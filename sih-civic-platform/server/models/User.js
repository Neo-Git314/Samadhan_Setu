import mongoose from 'mongoose';

// TODO: Extend user schema with secure auth and profile lifecycle fields.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['citizen', 'university', 'industry', 'admin'], default: 'citizen' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
