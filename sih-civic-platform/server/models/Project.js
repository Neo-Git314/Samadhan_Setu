import mongoose from 'mongoose';

// TODO: Link projects to complaints, teams, milestones, and outcomes.
const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    status: { type: String, default: 'draft' }
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
