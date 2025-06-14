const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const database = require('./utils/database');
const redis = require('./utils/redis');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3005;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased for enterprise usage
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'sentimentasaservice',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health/detailed', async (req, res) => {
  try {
    const dbStatus = await database.checkConnection();
    const redisStatus = await redis.ping();
    
    res.json({
      status: 'healthy',
      service: 'sentimentasaservice',
      version: '1.0.0',
      dependencies: {
        database: dbStatus ? 'connected' : 'disconnected',
        redis: redisStatus ? 'connected' : 'disconnected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Routes
app.use('/api/data', require('./routes/data'));
app.use('/api/sentiment', require('./routes/sentiment'));
app.use('/api/enterprise', authMiddleware.validateEnterprise, require('./routes/enterprise'));
app.use('/api/research', authMiddleware.validateResearcher, require('./routes/research'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/billing', authMiddleware.validateEnterprise, require('./routes/billing'));
app.use('/api/ml', authMiddleware.validateEnterprise, require('./routes/ml'));

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  res.status(error.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  const server = app.listen(PORT);
  
  setTimeout(() => {
    logger.error('Forceful shutdown after timeout');
    process.exit(1);
  }, 30000);

  try {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      await database.close();
      await redis.disconnect();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    await database.initialize();
    await redis.connect();
    
    app.listen(PORT, () => {
      logger.info(`SentimentAsAService master data brain running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;