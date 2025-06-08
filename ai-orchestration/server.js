const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const contextRoutes = require('./routes/context');
const recommendationsRoutes = require('./routes/recommendations');
const personasRoutes = require('./routes/personas');
const conversationsRoutes = require('./routes/conversations');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.AI_ORCHESTRATION_PORT || 3003;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-App-Key', 'X-User-ID']
}));

// Rate limiting - more restrictive for AI endpoints
const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50, // Lower limit for AI operations
  message: {
    error: 'Too many AI requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(aiLimiter);

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// API routes
app.use('/context', contextRoutes);
app.use('/recommendations', recommendationsRoutes);
app.use('/personas', personasRoutes);
app.use('/conversations', conversationsRoutes);

// AI Orchestration dashboard endpoint
app.get('/dashboard', (req, res) => {
  res.json({
    service: 'AI Orchestration',
    version: '1.0.0',
    capabilities: {
      contextSharing: 'Share context between AI personas while preserving specialization',
      crossAppRecommendations: 'Generate recommendations for other apps based on user behavior',
      conversationHistory: 'Unified conversation history across all AI personas',
      sentimentAnalysis: 'Real-time sentiment analysis of user interactions',
      personaCoordination: 'Coordinate AI responses without merging personalities'
    },
    endpoints: {
      context: {
        share: 'POST /context/share',
        get: 'GET /context/:userId',
        update: 'PUT /context/:contextId'
      },
      recommendations: {
        generate: 'POST /recommendations/generate',
        crossApp: 'GET /recommendations/cross-app/:userId',
        feedback: 'POST /recommendations/:recommendationId/feedback'
      },
      personas: {
        list: 'GET /personas',
        configure: 'PUT /personas/:appName',
        status: 'GET /personas/:appName/status'
      },
      conversations: {
        history: 'GET /conversations/:userId',
        analyze: 'POST /conversations/analyze',
        sentiment: 'POST /conversations/sentiment'
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
    service: 'AI Orchestration'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    service: 'AI Orchestration'
  });
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
  logger.info(`🤖 AI Orchestration Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Available endpoints:');
  logger.info('  - POST /context/share - Share context between personas');
  logger.info('  - POST /recommendations/generate - Generate cross-app recommendations');
  logger.info('  - GET /conversations/:userId - Get unified conversation history');
  logger.info('  - POST /conversations/analyze - Analyze conversation patterns');
  logger.info('  - GET /health - Health check');
  logger.info('  - GET /dashboard - Service dashboard');
});

module.exports = app;
