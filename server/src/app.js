const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware — CORS must come before helmet
app.use(cors({
  origin: true,  // Allow all origins (reflects request origin)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Import routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api', require('./routes/taskRoutes')); // Matches Task nested routes /programs/:programId/tasks and /tasks/:id
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
