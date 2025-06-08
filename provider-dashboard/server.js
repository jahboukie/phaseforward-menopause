const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const authRoutes = require('./routes/auth');
const patientsRoutes = require('./routes/patients');
const communicationsRoutes = require('./routes/communications');
const practiceRoutes = require('./routes/practice');
const insightsRoutes = require('./routes/insights');
const reportsRoutes = require('./routes/reports');
const billingRoutes = require('./routes/billing');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PROVIDER_DASHBOARD_PORT || 3004;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Provider-ID']
}));

// Rate limiting for provider endpoints
const providerLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(providerLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// Authentication routes
app.use('/auth', authRoutes);

// Protected routes (require provider authentication)
app.use('/patients', patientsRoutes);
app.use('/communications', communicationsRoutes);
app.use('/practice', practiceRoutes);
app.use('/insights', insightsRoutes);
app.use('/reports', reportsRoutes);
app.use('/billing', billingRoutes);

// Provider Dashboard overview endpoint
app.get('/dashboard', (req, res) => {
  res.json({
    service: 'Provider Dashboard',
    version: '1.0.0',
    description: 'Healthcare provider insights and analytics platform',
    capabilities: {
      patientManagement: 'Manage patient relationships and consent',
      crossAppInsights: 'View patient data across all ecosystem apps',
      relationshipAnalytics: 'Analyze relationship dynamics and health correlations',
      clinicalReports: 'Generate comprehensive clinical reports',
      billingIntegration: 'Subscription and billing management',
      complianceTools: 'HIPAA-compliant data handling and reporting'
    },
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        profile: 'GET /auth/profile'
      },
      patients: {
        list: 'GET /patients',
        details: 'GET /patients/:patientId',
        onboarding: 'POST /patients/:patientId/onboarding',
        consent: 'POST /patients/:patientId/consent'
      },
      communications: {
        patientComms: 'GET /communications/patient/:patientId',
        send: 'POST /communications/send',
        schedule: 'POST /communications/schedule',
        stats: 'GET /communications/stats'
      },
      practice: {
        info: 'GET /practice',
        create: 'POST /practice',
        update: 'PUT /practice/:practiceId'
      },
      insights: {
        summary: 'GET /insights/summary',
        patient: 'GET /insights/patient/:patientId',
        correlations: 'GET /insights/correlations',
        trends: 'GET /insights/trends'
      },
      reports: {
        generate: 'POST /reports/generate',
        download: 'GET /reports/:reportId/download',
        list: 'GET /reports'
      },
      billing: {
        subscription: 'GET /billing/subscription',
        usage: 'GET /billing/usage',
        invoices: 'GET /billing/invoices'
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
    service: 'Provider Dashboard'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    service: 'Provider Dashboard'
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
  logger.info(`🏥 Provider Dashboard running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Available endpoints:');
  logger.info('  - POST /auth/login - Provider authentication');
  logger.info('  - GET /patients - Patient management');
  logger.info('  - GET /insights/summary - Clinical insights');
  logger.info('  - POST /reports/generate - Generate reports');
  logger.info('  - GET /health - Health check');
  logger.info('  - GET /dashboard - Service dashboard');
});

module.exports = app;
