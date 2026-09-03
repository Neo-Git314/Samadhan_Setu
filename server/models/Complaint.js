import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    address: { type: String, default: '' }
  },
  { _id: false }
);

const imageAnalysisSchema = new mongoose.Schema(
  {
    caption: { type: String, default: '' },
    tags: { type: [String], default: [] },
    relevanceScore: { type: Number, default: 0 }
  },
  { _id: false }
);

const suggestedUniversitySchema = new mongoose.Schema(
  {
    universityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true
    },
    score: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'SubmittedBy user ID is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    location: {
      type: locationSchema,
      default: () => ({ lat: 0, lng: 0, address: '' })
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    mediaUrls: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: 'uncategorized',
      trim: true
    },
    categoryConfidence: {
      type: Number,
      default: 0
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'assigned', 'in_progress', 'resolved', 'duplicate'],
      default: 'pending'
    },
    needsReview: {
      type: Boolean,
      default: false
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null
    },
    embedding: {
      type: [Number],
      default: []
    },
    imageAnalysis: {
      type: imageAnalysisSchema,
      default: () => ({ caption: '', tags: [], relevanceScore: 0 })
    },
    suggestedUniversities: {
      type: [suggestedUniversitySchema],
      default: []
    },
    assignedUniversity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Explicit indexes
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ district: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ submittedBy: 1 });
complaintSchema.index({ assignedUniversity: 1 });
complaintSchema.index({ duplicateOf: 1 });

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
