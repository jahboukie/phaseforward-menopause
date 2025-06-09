const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const authMiddleware = require('./middleware/auth');
const logger = require('./utils/logger');
const healthRoutes = require('./routes/health');
const proxyRoutes = require('./routes/proxy');

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

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
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// Authentication middleware for all other routes (skip if SSO service not available)
app.use((req, res, next) => {
  // Skip auth middleware if SSO service is not available (for demo purposes)
  if (req.path.startsWith('/health') || req.path.startsWith('/api/status') || req.path.startsWith('/dashboard')) {
    return next();
  }
  return authMiddleware(req, res, next);
});

// Service proxy routes
app.use('/api', proxyRoutes);

// SSO Service Proxy
app.use('/auth', createProxyMiddleware({
  target: `http://${process.env.SSO_SERVICE_HOST || 'localhost'}:${process.env.SSO_SERVICE_PORT || 3001}`,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': ''
  },
  onError: (err, req, res) => {
    logger.error('SSO Service proxy error:', err);
    res.status(503).json({ error: 'SSO Service unavailable' });
  }
}));

// Analytics Engine Proxy
app.use('/analytics', createProxyMiddleware({
  target: `http://${process.env.ANALYTICS_ENGINE_HOST || 'localhost'}:${process.env.ANALYTICS_ENGINE_PORT || 3002}`,
  changeOrigin: true,
  pathRewrite: {
    '^/analytics': ''
  },
  onError: (err, req, res) => {
    logger.error('Analytics Engine proxy error:', err);
    res.status(503).json({ error: 'Analytics Service unavailable' });
  }
}));

// AI Orchestration Proxy
app.use('/ai', createProxyMiddleware({
  target: `http://${process.env.AI_ORCHESTRATION_HOST || 'localhost'}:${process.env.AI_ORCHESTRATION_PORT || 3003}`,
  changeOrigin: true,
  pathRewrite: {
    '^/ai': ''
  },
  onError: (err, req, res) => {
    logger.error('AI Orchestration proxy error:', err);
    res.status(503).json({ error: 'AI Service unavailable' });
  }
}));

// Provider Dashboard Proxy
app.use('/provider', createProxyMiddleware({
  target: `http://${process.env.PROVIDER_DASHBOARD_HOST || 'localhost'}:${process.env.PROVIDER_DASHBOARD_PORT || 3004}`,
  changeOrigin: true,
  pathRewrite: {
    '^/provider': ''
  },
  onError: (err, req, res) => {
    logger.error('Provider Dashboard proxy error:', err);
    res.status(503).json({ error: 'Provider Service unavailable' });
  }
}));

// External App Proxies (for integration)
const externalApps = [
  { path: '/myconfidant', target: process.env.MYCONFIDANT_API_URL },
  { path: '/dralexai', target: process.env.DRALEXAI_API_URL },
  { path: '/soberpal', target: process.env.SOBERPAL_API_URL },
  { path: '/innerarchitect', target: process.env.INNER_ARCHITECT_API_URL },
  { path: '/menotracker', target: process.env.MENO_TRACKER_API_URL },
  { path: '/menopartner', target: process.env.MENO_PARTNER_API_URL },
  { path: '/menocommunity', target: process.env.MENO_COMMUNITY_API_URL }
];

externalApps.forEach(({ path, target }) => {
  if (target) {
    app.use(path, createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: {
        [`^${path}`]: ''
      },
      onError: (err, req, res) => {
        logger.error(`${path} proxy error:`, err);
        res.status(503).json({ error: `${path.substring(1)} service unavailable` });
      }
    }));
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
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
  logger.info(`🚀 API Gateway running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Available services:');
  logger.info('  - SSO Service: /auth');
  logger.info('  - Analytics Engine: /analytics');
  logger.info('  - AI Orchestration: /ai');
  logger.info('  - Provider Dashboard: /provider');
  logger.info('  - Health Check: /health');
});

module.exports = app;
