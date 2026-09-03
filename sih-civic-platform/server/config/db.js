import mongoose from 'mongoose';

// TODO: Handle retries, telemetry, and shutdown-safe DB lifecycle management.
export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/samadhan_setu';
  await mongoose.connect(mongoUri);
}
