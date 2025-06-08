const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { requireAppAccess } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Proxy configuration for external apps
const appProxyConfigs = [
  {
    path: '/myconfidant',
    target: process.env.MYCONFIDANT_API_URL,
    appName: 'MyConfidant',
    requireAuth: true
  },
  {
    path: '/dralexai',
    target: process.env.DRALEXAI_API_URL,
    appName: 'DrAlexAI',
    requireAuth: true
  },
  {
    path: '/soberpal',
    target: process.env.SOBERPAL_API_URL,
    appName: 'SoberPal',
    requireAuth: true
  },
  {
    path: '/innerarchitect',
    target: process.env.INNER_ARCHITECT_API_URL,
    appName: 'Inner Architect',
    requireAuth: true
  },
  {
    path: '/menotracker',
    target: process.env.MENO_TRACKER_API_URL,
    appName: 'MenoTracker',
    requireAuth: true
  },
  {
    path: '/menopartner',
    target: process.env.MENO_PARTNER_API_URL,
    appName: 'MenoPartner',
    requireAuth: true
  },
  {
    path: '/menocommunity',
    target: process.env.MENO_COMMUNITY_API_URL,
    appName: 'Meno Community',
    requireAuth: true
  }
];

// Create proxy middleware for each app
appProxyConfigs.forEach(config => {
  if (config.target) {
    const middlewares = [];
    
    // Add app access requirement if needed
    if (config.requireAuth) {
      middlewares.push(requireAppAccess(config.appName));
    }

    // Add the proxy middleware
    middlewares.push(createProxyMiddleware({
      target: config.target,
      changeOrigin: true,
      pathRewrite: {
        [`^/api${config.path}`]: ''
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add user context to proxied requests
        if (req.user) {
          proxyReq.setHeader('X-User-ID', req.user.id);
          proxyReq.setHeader('X-User-Email', req.user.email);
          proxyReq.setHeader('X-User-Role', req.user.role);
        }
        
        // Add app context
        if (req.appContext) {
          proxyReq.setHeader('X-App-Context', JSON.stringify(req.appContext));
        }

        // Log the proxied request
        logger.info(`Proxying ${req.method} ${req.originalUrl} to ${config.target}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add response headers
        proxyRes.headers['X-Proxied-By'] = 'Ecosystem-Gateway';
        proxyRes.headers['X-Service'] = config.appName;
      },
      onError: (err, req, res) => {
        logger.error(`Proxy error for ${config.appName}:`, err);
        res.status(503).json({
          error: `${config.appName} service unavailable`,
          message: 'The requested service is currently unavailable. Please try again later.',
          service: config.appName,
          timestamp: new Date().toISOString()
        });
      }
    }));

    // Apply all middlewares to the route
    router.use(config.path, ...middlewares);
  } else {
    logger.warn(`No target URL configured for ${config.appName}`);
  }
});

// Generic API status endpoint
router.get('/status', (req, res) => {
  const availableApps = appProxyConfigs
    .filter(config => config.target)
    .map(config => ({
      name: config.appName,
      path: config.path,
      requiresAuth: config.requireAuth,
      status: 'configured'
    }));

  const unavailableApps = appProxyConfigs
    .filter(config => !config.target)
    .map(config => ({
      name: config.appName,
      path: config.path,
      status: 'not_configured'
    }));

  res.json({
    gateway: 'Ecosystem Intelligence API Gateway',
    timestamp: new Date().toISOString(),
    availableApps,
    unavailableApps,
    totalApps: appProxyConfigs.length,
    configuredApps: availableApps.length
  });
});

// User's accessible apps endpoint
router.get('/my-apps', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userApps = req.user.apps || [];
  const accessibleApps = appProxyConfigs
    .filter(config => config.target)
    .map(config => {
      const userApp = userApps.find(app => app.name === config.appName);
      return {
        name: config.appName,
        path: config.path,
        hasAccess: !!userApp,
        status: userApp?.status || 'no_access',
        subscriptionTier: userApp?.subscriptionTier || null
      };
    });

  res.json({
    userId: req.user.id,
    email: req.user.email,
    apps: accessibleApps,
    totalAccessibleApps: accessibleApps.filter(app => app.hasAccess).length
  });
});

module.exports = router;
