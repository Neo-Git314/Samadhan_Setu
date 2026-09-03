import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { connectDB } from './config/db.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';
import complaintsRoutes from './routes/complaints.js';
import industryRoutes from './routes/industry.js';
import notificationsRoutes from './routes/notifications.js';
import projectsRoutes from './routes/projects.js';
import universitiesRoutes from './routes/universities.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

// TODO: Harden middleware stack with rate-limits, logging, and observability.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed', error);
    process.exit(1);
  });
