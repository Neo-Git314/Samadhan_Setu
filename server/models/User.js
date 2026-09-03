import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: ['citizen', 'university', 'industry', 'admin'],
      default: 'citizen',
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    organization: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Explicit index on role (email index created by unique: true)
userSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model('User', userSchema);
