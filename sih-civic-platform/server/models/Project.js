import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ['student', 'faculty_mentor', 'researcher', 'lead'], default: 'student', required: true }
  },
  { _id: true }
);

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'done'], default: 'pending' }
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true
    },
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true
    },
    industryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IndustryPartner',
      default: null
    },
    team: {
      type: [teamMemberSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['proposed', 'approved', 'in_progress', 'testing', 'completed'],
      default: 'proposed'
    },
    milestones: {
      type: [milestoneSchema],
      default: []
    },
    proposalDoc: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

projectSchema.index({ complaintId: 1 });
projectSchema.index({ universityId: 1 });
projectSchema.index({ industryPartnerId: 1 });
projectSchema.index({ status: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
