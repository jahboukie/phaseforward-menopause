const express = require('express');
const db = require('../utils/database');
const redis = require('../utils/redis');
const supabase = require('../utils/supabase');
const logger = require('../utils/logger');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'SSO Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check with dependencies
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    service: 'SSO Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    dependencies: {}
  };

  // Check database connection
  try {
    const dbHealthy = await db.healthCheck();
    healthCheck.dependencies.database = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    healthCheck.dependencies.database = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }

  // Check Redis connection
  try {
    const redisHealthy = await redis.healthCheck();
    healthCheck.dependencies.redis = {
      status: redisHealthy ? 'healthy' : 'unhealthy',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    healthCheck.dependencies.redis = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }

  // Check Supabase connection
  try {
    const supabaseHealthy = await supabase.healthCheck();
    healthCheck.dependencies.supabase = {
      status: supabaseHealthy ? 'healthy' : 'unhealthy',
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    healthCheck.dependencies.supabase = {
      status: 'unhealthy',
      error: error.message,
      lastChecked: new Date().toISOString()
    };
  }

  // Determine overall status
  const unhealthyDeps = Object.values(healthCheck.dependencies)
    .filter(dep => dep.status === 'unhealthy');

  if (unhealthyDeps.length > 0) {
    healthCheck.status = 'degraded';
    healthCheck.issues = unhealthyDeps.map(dep => dep.error).filter(Boolean);
  }

  res.json(healthCheck);
});

// Readiness check (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  try {
    // Check if essential dependencies are available
    const dbHealthy = await db.healthCheck();
    
    if (dbHealthy) {
      res.json({ status: 'ready' });
    } else {
      res.status(503).json({ 
        status: 'not ready', 
        reason: 'Database unavailable' 
      });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready', 
      reason: 'Essential services unavailable',
      error: error.message 
    });
  }
});

// Liveness check (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Service metrics
router.get('/metrics', async (req, res) => {
  try {
    // Get basic metrics
    const metrics = {
      service: 'SSO Service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    // Get user count
    try {
      const userCountResult = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = true');
      metrics.activeUsers = parseInt(userCountResult.rows[0].count);
    } catch (error) {
      logger.warn('Failed to get user count:', error);
      metrics.activeUsers = 'unavailable';
    }

    // Get session count
    try {
      const sessionCountResult = await db.query('SELECT COUNT(*) as count FROM user_sessions WHERE is_active = true AND expires_at > NOW()');
      metrics.activeSessions = parseInt(sessionCountResult.rows[0].count);
    } catch (error) {
      logger.warn('Failed to get session count:', error);
      metrics.activeSessions = 'unavailable';
    }

    // Get app count
    try {
      const appCountResult = await db.query('SELECT COUNT(*) as count FROM app_registrations WHERE is_active = true');
      metrics.registeredApps = parseInt(appCountResult.rows[0].count);
    } catch (error) {
      logger.warn('Failed to get app count:', error);
      metrics.registeredApps = 'unavailable';
    }

    res.json(metrics);

  } catch (error) {
    logger.error('Metrics endpoint error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
