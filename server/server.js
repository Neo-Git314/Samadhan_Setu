import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
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

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount modular API routers
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/universities', universitiesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/industry-partners', industryRoutes);
app.use('/api/industry', industryRoutes); // Alias for compatibility
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Centralized Error Handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Database connection and startup only if executed directly
const isMain = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].includes('nodemon'));

if (isMain && process.env.NODE_ENV !== 'test') {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`[Samadhan Setu Server] Running on port ${port}`);
        console.log(`[Samadhan Setu Server] Health Check: http://localhost:${port}/api/health`);
      });
    })
    .catch((error) => {
      console.error('[Samadhan Setu Server] Failed to connect to database:', error.message);
    });
}

export default app;
