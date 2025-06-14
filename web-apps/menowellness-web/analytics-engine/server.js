const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const logger = require('./utils/logger');
const dataRoutes = require('./routes/data');
const insightsRoutes = require('./routes/insights');
const correlationRoutes = require('./routes/correlation');
const healthRoutes = require('./routes/health');
const { initializeJobs } = require('./services/jobProcessor');
const { startCorrelationAnalysis } = require('./services/correlation');

const app = express();
const PORT = process.env.ANALYTICS_ENGINE_PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Key', 'X-User-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200, // Higher limit for analytics
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// API routes
app.use('/data', dataRoutes);
app.use('/insights', insightsRoutes);
app.use('/correlation', correlationRoutes);

// Analytics dashboard endpoint
app.get('/dashboard', (req, res) => {
  res.json({
    service: 'Analytics Engine',
    version: '1.0.0',
    endpoints: {
      data: {
        ingest: 'POST /data/ingest',
        events: 'GET /data/events',
        users: 'GET /data/users',
        apps: 'GET /data/apps'
      },
      insights: {
        user: 'GET /insights/user/:userId',
        app: 'GET /insights/app/:appName',
        trends: 'GET /insights/trends',
        summary: 'GET /insights/summary'
      },
      correlation: {
        analyze: 'POST /correlation/analyze',
        results: 'GET /correlation/results',
        relationships: 'GET /correlation/relationships'
      }
    },
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    service: 'Analytics Engine'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    service: 'Analytics Engine'
  });
});

// Initialize background jobs
initializeJobs();

// Schedule correlation analysis (runs every hour)
cron.schedule('0 * * * *', () => {
  logger.info('Starting scheduled correlation analysis');
  startCorrelationAnalysis().catch(error => {
    logger.error('Scheduled correlation analysis failed:', error);
  });
});

// Schedule data cleanup (runs daily at 2 AM)
cron.schedule('0 2 * * *', () => {
  logger.info('Starting scheduled data cleanup');
  // Data cleanup logic will be implemented in services
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`📊 Analytics Engine running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Available endpoints:');
  logger.info('  - POST /data/ingest - Data ingestion');
  logger.info('  - GET /insights/summary - Analytics summary');
  logger.info('  - POST /correlation/analyze - Correlation analysis');
  logger.info('  - GET /health - Health check');
  logger.info('  - GET /dashboard - Service dashboard');
});

module.exports = app;
