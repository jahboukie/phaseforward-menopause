#!/usr/bin/env node

/**
 * Corporate Wellness Portal - Enterprise Server
 * Multi-tenant healthcare platform with Dr. Alex AI-grade security
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import connectRedis from 'connect-redis';
import dotenv from 'dotenv';

// Security and middleware imports
import { securityMiddleware } from './middleware/security.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { auditMiddleware } from './middleware/audit.js';
import { authMiddleware } from './middleware/auth.js';

// Route imports
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import employeeRoutes from './routes/employee.js';
import onboardingRoutes from './routes/onboarding.js';
import analyticsRoutes from './routes/analytics.js';
import integrationRoutes from './routes/integration.js';
import adminRoutes from './routes/admin.js';

// Service imports
import { logger } from './utils/logger.js';
import { database } from './utils/database.js';
import { redisClient } from './utils/redis.js';
import { encryptionService } from './services/encryption.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.openai.com", "https://dralexai.com", "https://sentimentasaservice.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration for multi-tenant
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from tenant-specific domains
    const allowedOrigins = [
      'https://corporate.ecosystem-intelligence.com',
      'https://*.wellness-portal.com',
      'http://localhost:3000',
      'http://localhost:8080'
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      allowed.includes('*') ? origin.includes(allowed.replace('*.', '')) : origin === allowed
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting - Enterprise grade
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 1000 : 10000, // Enterprise limits
  message: {
    error: 'Rate limit exceeded',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(compression());
app.use(express.json({ limit: '50mb' })); // Large CSV uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration with Redis
const RedisStore = connectRedis(session);
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'corporate-wellness-portal-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Custom middleware stack
app.use(auditMiddleware);      // Log all requests for compliance
app.use(tenantMiddleware);     // Multi-tenant context
app.use(securityMiddleware);   // Dr. Alex AI-grade security
app.use(authMiddleware);       // Enterprise authentication

// Health check (no auth required)
app.use('/api/health', healthRoutes);

// Public authentication routes
app.use('/api/auth', authRoutes);

// Protected routes (require authentication)
app.use('/api/tenant', tenantRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api/admin', adminRoutes);

// Static files for admin interface
app.use(express.static('public'));

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    tenantId: req.tenant?.id,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Security: Don't expose internal errors in production
  const message = NODE_ENV === 'production' ? 'Internal server error' : err.message;
  
  res.status(err.status || 500).json({
    error: message,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown handler
async function gracefulShutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close database connections
    await database.end();
    
    // Close Redis connection
    await redisClient.quit();
    
    logger.info('Corporate Wellness Portal shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    // Initialize database
    await database.connect();
    logger.info('Database connected successfully');
    
    // Initialize Redis
    await redisClient.connect();
    logger.info('Redis connected successfully');
    
    // Test encryption service
    await encryptionService.initialize();
    logger.info('Encryption service initialized');
    
    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`🏢 Corporate Wellness Portal running on port ${PORT}`);
      logger.info(`🔐 Security: Dr. Alex AI-grade encryption enabled`);
      logger.info(`🏗️  Multi-tenant: Enterprise architecture active`);
      logger.info(`🚀 Environment: ${NODE_ENV}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;