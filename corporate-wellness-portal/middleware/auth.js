/**
 * Corporate Wellness Portal - Authentication Middleware
 * Enterprise-grade authentication for multi-tenant access
 */

import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { encryptionService } from '../services/encryption.js';

/**
 * Authentication middleware for protected routes
 */
export const authMiddleware = (req, res, next) => {
  // Skip auth for public endpoints
  const publicPaths = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/pitch-deck',
    '/pitch-deck.html'
  ];
  
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  if (isPublicPath) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    logger.warn('Missing authentication token', {
      path: req.path,
      ip: req.ip,
      requestId: req.id
    });
    
    return res.status(401).json({
      error: 'Authentication required',
      requestId: req.id
    });
  }
  
  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'corporate-wellness-secret');
    
    // Add user context to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      tenantId: decoded.tenantId
    };
    
    logger.debug('User authenticated', {
      userId: req.user.id,
      tenantId: req.user.tenantId,
      path: req.path,
      requestId: req.id
    });
    
    next();
    
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error.message,
      path: req.path,
      ip: req.ip,
      requestId: req.id
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        requestId: req.id
      });
    }
    
    return res.status(401).json({
      error: 'Invalid token',
      requestId: req.id
    });
  }
};

/**
 * Optional authentication middleware (doesn't block if no token)
 */
export const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'corporate-wellness-secret');
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId
      };
    } catch (error) {
      // Continue without user context if token is invalid
      logger.debug('Optional auth failed, continuing without user context', {
        error: error.message,
        requestId: req.id
      });
    }
  }
  
  next();
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        requestId: req.id
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
        requestId: req.id
      });
      
      return res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        requestId: req.id
      });
    }
    
    next();
  };
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user, tenantId) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: tenantId
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET || 'corporate-wellness-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

export default {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  generateToken
};