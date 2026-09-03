import mongoose from 'mongoose';

const industryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Industry partner name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['startup', 'MSME', 'CSR', 'research_lab'],
      default: 'startup'
    },
    sectorFocus: {
      type: [String],
      default: []
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

industryPartnerSchema.index({ userId: 1 });
industryPartnerSchema.index({ name: 1 });

export default mongoose.models.IndustryPartner || mongoose.model('IndustryPartner', industryPartnerSchema);
