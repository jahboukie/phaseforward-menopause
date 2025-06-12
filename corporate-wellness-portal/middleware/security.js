/**
 * Corporate Wellness Portal - Dr. Alex AI-Grade Security Middleware
 * Enterprise-level security with multi-tenant isolation
 */

import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';
import { redisClient } from '../utils/redis.js';

/**
 * Dr. Alex AI-grade security middleware stack
 * Implements military-grade security protocols
 */
export const securityMiddleware = (req, res, next) => {
  // Generate unique request ID for audit trail
  req.id = crypto.randomUUID();
  
  // Enhanced security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'X-Request-ID': req.id
  });
  
  // Security audit logging
  logger.info('Security middleware engaged', {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
  
  next();
};

/**
 * Advanced rate limiting with tenant-specific controls
 */
export const advancedRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => {
    // Tenant-specific limits
    if (req.tenant) {
      switch (req.tenant.tier) {
        case 'fortune500': return 5000;
        case 'enterprise': return 2000;
        case 'startup': return 1000;
        default: return 500;
      }
    }
    return 100; // Default for unauthenticated requests
  },
  
  keyGenerator: (req) => {
    // Combine IP, tenant, and user for granular limiting
    const keys = [req.ip];
    if (req.tenant) keys.push(req.tenant.id);
    if (req.user) keys.push(req.user.id);
    return keys.join(':');
  },
  
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      tenantId: req.tenant?.id,
      userId: req.user?.id,
      endpoint: req.originalUrl
    });
    
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(15 * 60), // 15 minutes in seconds
      requestId: req.id
    });
  },
  
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * IP-based security controls
 */
export const ipSecurityMiddleware = async (req, res, next) => {
  const clientIP = req.ip;
  const cacheKey = `ip_security:${clientIP}`;
  
  try {
    // Check if IP is blocked
    const blockStatus = await redisClient.get(`blocked_ip:${clientIP}`);
    if (blockStatus) {
      logger.warn('Blocked IP attempted access', {
        ip: clientIP,
        blockReason: blockStatus,
        requestId: req.id
      });
      
      return res.status(403).json({
        error: 'Access denied',
        requestId: req.id
      });
    }
    
    // Track suspicious activity
    const attempts = await redisClient.incr(cacheKey);
    await redisClient.expire(cacheKey, 3600); // 1 hour window
    
    // Auto-block IPs with excessive requests
    if (attempts > 1000) {
      await redisClient.setex(`blocked_ip:${clientIP}`, 86400, 'excessive_requests');
      logger.error('IP auto-blocked for suspicious activity', {
        ip: clientIP,
        attempts,
        requestId: req.id
      });
      
      return res.status(403).json({
        error: 'Access denied',
        requestId: req.id
      });
    }
    
    next();
  } catch (error) {
    logger.error('IP security middleware error', { error: error.message });
    next(); // Continue on error to avoid service disruption
  }
};

/**
 * Input sanitization and validation
 */
export const inputSanitization = (req, res, next) => {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = sanitizeString(key);
    
    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[cleanKey] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[cleanKey] = value;
    }
  }
  
  return sanitized;
}

/**
 * Sanitize individual strings
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * CSRF protection for state-changing operations
 */
export const csrfProtection = (req, res, next) => {
  // Skip CSRF for read operations
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    logger.warn('CSRF token validation failed', {
      hasToken: !!token,
      hasSessionToken: !!sessionToken,
      ip: req.ip,
      requestId: req.id
    });
    
    return res.status(403).json({
      error: 'CSRF token validation failed',
      requestId: req.id
    });
  }
  
  next();
};

/**
 * File upload security
 */
export const fileUploadSecurity = (req, res, next) => {
  if (!req.file) return next();
  
  const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/json'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  // Validate file type
  if (!allowedTypes.includes(req.file.mimetype)) {
    logger.warn('Invalid file type uploaded', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      requestId: req.id
    });
    
    return res.status(400).json({
      error: 'Invalid file type',
      allowed: allowedTypes,
      requestId: req.id
    });
  }
  
  // Validate file size
  if (req.file.size > maxSize) {
    logger.warn('File size exceeded limit', {
      filename: req.file.originalname,
      size: req.file.size,
      maxSize,
      requestId: req.id
    });
    
    return res.status(400).json({
      error: 'File size exceeds limit',
      maxSize: '100MB',
      requestId: req.id
    });
  }
  
  // Scan file content for malicious patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i
  ];
  
  const fileContent = req.file.buffer?.toString() || '';
  const hasDangerousContent = dangerousPatterns.some(pattern => pattern.test(fileContent));
  
  if (hasDangerousContent) {
    logger.error('Malicious content detected in upload', {
      filename: req.file.originalname,
      requestId: req.id
    });
    
    return res.status(400).json({
      error: 'File contains potentially malicious content',
      requestId: req.id
    });
  }
  
  next();
};

/**
 * Security event detection and alerting
 */
export const securityEventDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /union\s+select/i, // SQL injection
    /<script/i, // XSS
    /\.\.\/\.\.\//i, // Path traversal
    /eval\s*\(/i, // Code injection
    /document\.cookie/i, // Cookie theft
    /window\.location/i // Redirection attacks
  ];
  
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  const suspiciousActivity = suspiciousPatterns.some(pattern => 
    pattern.test(requestData)
  );
  
  if (suspiciousActivity) {
    logger.error('Suspicious activity detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      requestData: requestData.substring(0, 1000), // Limit logged data
      requestId: req.id
    });
    
    // Track for potential IP blocking
    redisClient.incr(`suspicious_activity:${req.ip}`).catch(() => {});
    
    // Alert security team (implement your alerting mechanism)
    // await sendSecurityAlert('Suspicious activity detected', { ... });
  }
  
  next();
};

/**
 * Content Security Policy generator
 */
export const generateCSP = (req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64');
  req.nonce = nonce;
  
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://dralexai.com https://sentimentasaservice.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  res.set('Content-Security-Policy', csp);
  next();
};

/**
 * Security middleware stack for corporate wellness portal
 */
export const corporateSecurityStack = [
  securityMiddleware,
  ipSecurityMiddleware,
  inputSanitization,
  securityEventDetector,
  generateCSP,
  advancedRateLimit
];

export default {
  securityMiddleware,
  advancedRateLimit,
  ipSecurityMiddleware,
  inputSanitization,
  csrfProtection,
  fileUploadSecurity,
  securityEventDetector,
  generateCSP,
  corporateSecurityStack
};