const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;
