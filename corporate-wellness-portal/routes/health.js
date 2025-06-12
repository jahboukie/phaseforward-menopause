/**
 * Corporate Wellness Portal - Health Check Routes
 * System health monitoring and status endpoints
 */

import express from 'express';
import { database } from '../utils/database.js';
import { redisClient } from '../utils/redis.js';
import { integrationHubService } from '../services/integration-hub.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: Date.now() - startTime
    };
    
    res.json(health);
    
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/detailed
 * Comprehensive health check with all services
 */
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Detailed health check requested');
    
    // Check all system components
    const [
      databaseHealth,
      redisHealth,
      integrationHealth
    ] = await Promise.allSettled([
      database.healthCheck(),
      redisClient.healthCheck(),
      integrationHubService.initialize()
    ]);
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      // System metrics
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heap: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: process.cpuUsage()
      },
      
      // Service health
      services: {
        database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : { 
          status: 'unhealthy', 
          error: databaseHealth.reason?.message 
        },
        redis: redisHealth.status === 'fulfilled' ? redisHealth.value : { 
          status: 'unhealthy', 
          error: redisHealth.reason?.message 
        },
        integrations: integrationHealth.status === 'fulfilled' ? integrationHealth.value : { 
          status: 'unhealthy', 
          error: integrationHealth.reason?.message 
        }
      },
      
      responseTime: Date.now() - startTime
    };
    
    // Determine overall health status
    const serviceStatuses = [
      health.services.database.status,
      health.services.redis.status,
      health.services.integrations.status
    ];
    
    if (serviceStatuses.includes('unhealthy')) {
      health.status = serviceStatuses.filter(s => s === 'healthy').length > 0 ? 'degraded' : 'unhealthy';
    }
    
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 207 : 503;
    
    res.status(statusCode).json(health);
    
  } catch (error) {
    logger.error('Detailed health check failed', { error: error.message });
    
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    });
  }
});

/**
 * GET /api/health/database
 * Database-specific health check
 */
router.get('/database', async (req, res) => {
  try {
    const health = await database.healthCheck();
    const stats = await database.getStatistics();
    
    res.json({
      ...health,
      statistics: stats
    });
    
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/redis
 * Redis-specific health check
 */
router.get('/redis', async (req, res) => {
  try {
    const health = await redisClient.healthCheck();
    const info = await redisClient.getInfo();
    
    res.json({
      ...health,
      info: info
    });
    
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/integrations
 * Integration services health check
 */
router.get('/integrations', async (req, res) => {
  try {
    const health = await integrationHubService.initialize();
    
    res.json(health);
    
  } catch (error) {
    logger.error('Integration health check failed', { error: error.message });
    
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/readiness
 * Kubernetes readiness probe
 */
router.get('/readiness', async (req, res) => {
  try {
    // Check if critical services are ready
    const [dbReady, redisReady] = await Promise.allSettled([
      database.query('SELECT 1'),
      redisClient.ping()
    ]);
    
    const ready = dbReady.status === 'fulfilled' && redisReady.status === 'fulfilled';
    
    if (ready) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/health/liveness
 * Kubernetes liveness probe
 */
router.get('/liveness', (req, res) => {
  // Simple liveness check - if this endpoint responds, the process is alive
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /api/health/metrics
 * Prometheus-style metrics endpoint
 */
router.get('/metrics', async (req, res) => {
  try {
    const [dbStats, redisInfo] = await Promise.allSettled([
      database.getStatistics(),
      redisClient.getInfo()
    ]);
    
    const metrics = [];
    
    // System metrics
    metrics.push(`# HELP process_uptime_seconds Process uptime in seconds`);
    metrics.push(`# TYPE process_uptime_seconds counter`);
    metrics.push(`process_uptime_seconds ${process.uptime()}`);
    
    metrics.push(`# HELP process_memory_usage_bytes Process memory usage in bytes`);
    metrics.push(`# TYPE process_memory_usage_bytes gauge`);
    metrics.push(`process_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}`);
    metrics.push(`process_memory_usage_bytes{type="heap_used"} ${process.memoryUsage().heapUsed}`);
    metrics.push(`process_memory_usage_bytes{type="heap_total"} ${process.memoryUsage().heapTotal}`);
    
    // Database metrics
    if (dbStats.status === 'fulfilled') {
      const stats = dbStats.value;
      metrics.push(`# HELP database_connections_total Total database connections`);
      metrics.push(`# TYPE database_connections_total gauge`);
      metrics.push(`database_connections_total{type="total"} ${stats.pool.totalConnections}`);
      metrics.push(`database_connections_total{type="idle"} ${stats.pool.idleConnections}`);
      metrics.push(`database_connections_total{type="waiting"} ${stats.pool.waitingConnections}`);
      
      if (stats.database?.database_size) {
        metrics.push(`# HELP database_size_bytes Database size in bytes`);
        metrics.push(`# TYPE database_size_bytes gauge`);
        metrics.push(`database_size_bytes ${stats.database.database_size}`);
      }
    }
    
    // Redis metrics
    if (redisInfo.status === 'fulfilled') {
      const info = redisInfo.value;
      if (info.memory) {
        metrics.push(`# HELP redis_memory_usage_bytes Redis memory usage in bytes`);
        metrics.push(`# TYPE redis_memory_usage_bytes gauge`);
        metrics.push(`redis_memory_usage_bytes ${info.memory.used_memory || 0}`);
      }
    }
    
    res.set('Content-Type', 'text/plain');
    res.send(metrics.join('\n'));
    
  } catch (error) {
    logger.error('Metrics generation failed', { error: error.message });
    res.status(500).send('# Error generating metrics');
  }
});

export default router;