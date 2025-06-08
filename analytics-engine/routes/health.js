const express = require('express');
const db = require('../utils/database');
const logger = require('../utils/logger');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Analytics Engine',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check with dependencies
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    service: 'Analytics Engine',
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

  // Determine overall status
  const unhealthyDeps = Object.values(healthCheck.dependencies)
    .filter(dep => dep.status === 'unhealthy');

  if (unhealthyDeps.length > 0) {
    healthCheck.status = 'degraded';
    healthCheck.issues = unhealthyDeps.map(dep => dep.error).filter(Boolean);
  }

  res.json(healthCheck);
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
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

// Liveness check
router.get('/live', (req, res) => {
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
