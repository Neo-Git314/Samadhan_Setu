import mongoose from 'mongoose';

const universitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'University name is required'],
      trim: true
    },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    },
    disciplines: {
      type: [String],
      default: []
    },
    researchKeywords: {
      type: [String],
      default: []
    },
    researchEmbedding: {
      type: [Number],
      default: []
    },
    incubationFacility: {
      type: Boolean,
      default: false
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

universitySchema.index({ name: 1 });
universitySchema.index({ disciplines: 1 });

export default mongoose.models.University || mongoose.model('University', universitySchema);
