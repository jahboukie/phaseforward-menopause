const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Detailed health check with service dependencies
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {}
  };

  // Check internal services
  const services = [
    {
      name: 'SSO Service',
      url: `http://${process.env.SSO_SERVICE_HOST || 'localhost'}:${process.env.SSO_SERVICE_PORT || 3001}/health`
    },
    {
      name: 'Analytics Engine',
      url: `http://${process.env.ANALYTICS_ENGINE_HOST || 'localhost'}:${process.env.ANALYTICS_ENGINE_PORT || 3002}/health`
    },
    {
      name: 'AI Orchestration',
      url: `http://${process.env.AI_ORCHESTRATION_HOST || 'localhost'}:${process.env.AI_ORCHESTRATION_PORT || 3003}/health`
    },
    {
      name: 'Provider Dashboard',
      url: `http://${process.env.PROVIDER_DASHBOARD_HOST || 'localhost'}:${process.env.PROVIDER_DASHBOARD_PORT || 3004}/health`
    }
  ];

  // Check each service
  const serviceChecks = services.map(async (service) => {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      return {
        name: service.name,
        status: 'healthy',
        responseTime: response.headers['x-response-time'] || 'N/A',
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      logger.warn(`Health check failed for ${service.name}:`, error.message);
      return {
        name: service.name,
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  });

  try {
    const results = await Promise.all(serviceChecks);
    
    // Add service results to health check
    results.forEach(result => {
      healthCheck.services[result.name.toLowerCase().replace(/\s+/g, '_')] = result;
    });

    // Determine overall status
    const unhealthyServices = results.filter(result => result.status === 'unhealthy');
    if (unhealthyServices.length > 0) {
      healthCheck.status = 'degraded';
      healthCheck.issues = unhealthyServices.map(service => 
        `${service.name}: ${service.error}`
      );
    }

    res.json(healthCheck);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      service: 'API Gateway',
      timestamp: new Date().toISOString(),
      error: 'Failed to perform health checks'
    });
  }
});

// Readiness check (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  try {
    // Check if essential services are available
    const ssoCheck = await axios.get(
      `http://${process.env.SSO_SERVICE_HOST || 'localhost'}:${process.env.SSO_SERVICE_PORT || 3001}/health`,
      { timeout: 3000 }
    );

    if (ssoCheck.status === 200) {
      res.json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'SSO service unavailable' });
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

module.exports = router;
