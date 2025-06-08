const jwt = require('jsonwebtoken');
const axios = require('axios');
const logger = require('../utils/logger');

// Cache for validated tokens (in production, use Redis)
const tokenCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Authentication middleware for API Gateway
 * Validates JWT tokens and app keys
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Skip auth for health checks and public endpoints
    if (req.path.startsWith('/health') || req.path.startsWith('/auth/login') || req.path.startsWith('/auth/register')) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const appKey = req.headers['x-app-key'];
    
    // Check for Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Check cache first
      const cacheKey = `token:${token}`;
      const cachedData = tokenCache.get(cacheKey);
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        req.user = cachedData.user;
        req.appContext = cachedData.appContext;
        return next();
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Validate token with SSO service
        const ssoResponse = await axios.get(
          `http://${process.env.SSO_SERVICE_HOST || 'localhost'}:${process.env.SSO_SERVICE_PORT || 3001}/validate`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          }
        );

        if (ssoResponse.data.valid) {
          const userData = {
            id: decoded.userId,
            email: decoded.email,
            apps: decoded.apps || [],
            role: decoded.role || 'user'
          };

          // Cache the validated token
          tokenCache.set(cacheKey, {
            user: userData,
            appContext: ssoResponse.data.appContext,
            timestamp: Date.now()
          });

          req.user = userData;
          req.appContext = ssoResponse.data.appContext;
          return next();
        } else {
          return res.status(401).json({ error: 'Invalid token' });
        }
      } catch (jwtError) {
        logger.warn('JWT verification failed:', jwtError.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    // Check for App Key authentication (for service-to-service communication)
    if (appKey) {
      try {
        const appValidationResponse = await axios.post(
          `http://${process.env.SSO_SERVICE_HOST || 'localhost'}:${process.env.SSO_SERVICE_PORT || 3001}/validate-app`,
          { appKey },
          { timeout: 5000 }
        );

        if (appValidationResponse.data.valid) {
          req.app = appValidationResponse.data.app;
          req.isServiceRequest = true;
          return next();
        } else {
          return res.status(401).json({ error: 'Invalid app key' });
        }
      } catch (appError) {
        logger.error('App key validation failed:', appError.message);
        return res.status(401).json({ error: 'App authentication failed' });
      }
    }

    // No valid authentication found
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please provide a valid Bearer token or App Key'
    });

  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({ error: 'Authentication service error' });
  }
};

/**
 * Middleware to check if user has access to specific app
 */
const requireAppAccess = (appName) => {
  return (req, res, next) => {
    if (req.isServiceRequest) {
      return next(); // Service requests bypass app access checks
    }

    if (!req.user || !req.user.apps) {
      return res.status(403).json({ error: 'No app access information' });
    }

    const hasAccess = req.user.apps.some(app => 
      app.name === appName && app.status === 'active'
    );

    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `You don't have access to ${appName}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is a provider
 */
const requireProviderRole = (req, res, next) => {
  if (req.user && req.user.role === 'provider') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Provider access required',
    message: 'This endpoint requires provider privileges'
  });
};

/**
 * Clean up expired cache entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      tokenCache.delete(key);
    }
  }
}, CACHE_TTL);

module.exports = {
  authMiddleware,
  requireAppAccess,
  requireProviderRole
};
