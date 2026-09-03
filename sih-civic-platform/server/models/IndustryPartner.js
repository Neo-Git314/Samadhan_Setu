import mongoose from 'mongoose';

// TODO: Track industry partner interests, collaborations, and approvals.
const industryPartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    sector: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('IndustryPartner', industryPartnerSchema);
