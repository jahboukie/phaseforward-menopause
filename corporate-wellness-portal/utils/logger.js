/**
 * Corporate Wellness Portal - Enterprise Logging Service
 * Structured logging with audit trails and security monitoring
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format with enhanced metadata
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const baseLog = {
      timestamp: info.timestamp,
      level: info.level,
      message: info.message,
      service: 'corporate-wellness-portal',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Add metadata if present
    if (info.tenantId) baseLog.tenantId = info.tenantId;
    if (info.userId) baseLog.userId = info.userId;
    if (info.requestId) baseLog.requestId = info.requestId;
    if (info.ip) baseLog.ip = info.ip;
    if (info.userAgent) baseLog.userAgent = info.userAgent;
    if (info.stack) baseLog.stack = info.stack;

    // Add any additional metadata
    const metadata = { ...info };
    delete metadata.timestamp;
    delete metadata.level;
    delete metadata.message;
    delete metadata.service;
    delete metadata.environment;
    delete metadata.version;

    return JSON.stringify({ ...baseLog, ...metadata });
  })
);

// Create winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'corporate-wellness-portal',
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf((info) => {
          const { timestamp, level, message, tenantId, userId, requestId } = info;
          let logLine = `${timestamp} [${level}]: ${message}`;
          
          if (requestId) logLine += ` [${requestId}]`;
          if (tenantId) logLine += ` (tenant: ${tenantId})`;
          if (userId) logLine += ` (user: ${userId})`;
          
          return logLine;
        })
      )
    }),

    // File transport for general logs
    new winston.transports.File({
      filename: path.join(logsDir, 'application.log'),
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10,
      tailable: true
    }),

    // File transport for error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 5,
      tailable: true
    }),

    // File transport for security events
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf((info) => {
          // Only log security-related events
          if (info.message.includes('security') || 
              info.message.includes('auth') || 
              info.message.includes('unauthorized') ||
              info.message.includes('blocked') ||
              info.message.includes('suspicious')) {
            return JSON.stringify(info);
          }
          return '';
        })
      )
    }),

    // File transport for audit trails
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 20,
      tailable: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],

  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5
    })
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 5
    })
  ]
});

// Enhanced logging methods with context
const enhancedLogger = {
  // Security-specific logging
  security: (message, metadata = {}) => {
    logger.warn(`[SECURITY] ${message}`, {
      ...metadata,
      category: 'security',
      alertLevel: metadata.alertLevel || 'medium'
    });
  },

  // Audit trail logging
  audit: (action, metadata = {}) => {
    logger.info(`[AUDIT] ${action}`, {
      ...metadata,
      category: 'audit',
      auditType: metadata.auditType || 'user_action'
    });
  },

  // Performance logging
  performance: (message, metadata = {}) => {
    logger.info(`[PERFORMANCE] ${message}`, {
      ...metadata,
      category: 'performance'
    });
  },

  // Business logic logging
  business: (message, metadata = {}) => {
    logger.info(`[BUSINESS] ${message}`, {
      ...metadata,
      category: 'business'
    });
  },

  // Integration logging
  integration: (message, metadata = {}) => {
    logger.info(`[INTEGRATION] ${message}`, {
      ...metadata,
      category: 'integration'
    });
  },

  // Data processing logging
  dataProcessing: (message, metadata = {}) => {
    logger.info(`[DATA] ${message}`, {
      ...metadata,
      category: 'data_processing'
    });
  },

  // Standard logging methods (enhanced)
  error: (message, metadata = {}) => {
    logger.error(message, {
      ...metadata,
      severity: 'error'
    });
  },

  warn: (message, metadata = {}) => {
    logger.warn(message, {
      ...metadata,
      severity: 'warning'
    });
  },

  info: (message, metadata = {}) => {
    logger.info(message, {
      ...metadata,
      severity: 'info'
    });
  },

  debug: (message, metadata = {}) => {
    logger.debug(message, {
      ...metadata,
      severity: 'debug'
    });
  },

  // Tenant-specific logging
  tenant: (tenantId, message, metadata = {}) => {
    logger.info(message, {
      ...metadata,
      tenantId,
      category: 'tenant'
    });
  },

  // Employee-specific logging
  employee: (tenantId, employeeId, message, metadata = {}) => {
    logger.info(message, {
      ...metadata,
      tenantId,
      employeeId,
      category: 'employee'
    });
  },

  // Request/Response logging
  request: (req, message, metadata = {}) => {
    logger.info(message, {
      ...metadata,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      tenantId: req.tenant?.id,
      userId: req.user?.id,
      category: 'request'
    });
  },

  // Database operation logging
  database: (operation, metadata = {}) => {
    logger.info(`[DATABASE] ${operation}`, {
      ...metadata,
      category: 'database'
    });
  },

  // Queue/Job logging
  queue: (jobType, metadata = {}) => {
    logger.info(`[QUEUE] ${jobType}`, {
      ...metadata,
      category: 'queue'
    });
  }
};

// Performance timing utility
enhancedLogger.time = (label) => {
  const startTime = process.hrtime.bigint();
  
  return {
    end: (metadata = {}) => {
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      enhancedLogger.performance(`${label} completed`, {
        ...metadata,
        durationMs: Math.round(durationMs * 100) / 100, // Round to 2 decimal places
        label
      });
      
      return durationMs;
    }
  };
};

// Structured error logging
enhancedLogger.logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    ...context
  };

  // Log different error types appropriately
  if (error.name === 'ValidationError') {
    enhancedLogger.warn('Validation error occurred', errorInfo);
  } else if (error.name === 'UnauthorizedError') {
    enhancedLogger.security('Unauthorized access attempt', errorInfo);
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    enhancedLogger.integration('External service connection failed', errorInfo);
  } else {
    enhancedLogger.error('Unexpected error occurred', errorInfo);
  }
};

// Log sanitization for PII/PHI
enhancedLogger.sanitize = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password', 'secret', 'token', 'key', 'auth',
    'ssn', 'social', 'credit', 'card', 'phone',
    'email', 'address', 'birth', 'medical'
  ];

  const sanitized = { ...data };

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = '[FILTERED]';
      }
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = enhancedLogger.sanitize(sanitized[key]);
    }
  });

  return sanitized;
};

// Child logger for specific contexts
enhancedLogger.child = (metadata) => {
  return {
    error: (message, extra = {}) => enhancedLogger.error(message, { ...metadata, ...extra }),
    warn: (message, extra = {}) => enhancedLogger.warn(message, { ...metadata, ...extra }),
    info: (message, extra = {}) => enhancedLogger.info(message, { ...metadata, ...extra }),
    debug: (message, extra = {}) => enhancedLogger.debug(message, { ...metadata, ...extra }),
    security: (message, extra = {}) => enhancedLogger.security(message, { ...metadata, ...extra }),
    audit: (action, extra = {}) => enhancedLogger.audit(action, { ...metadata, ...extra })
  };
};

// Production-specific configuration
if (process.env.NODE_ENV === 'production') {
  // Add external logging services in production
  
  // DataDog integration (if configured)
  if (process.env.DATADOG_API_KEY) {
    // This would integrate with DataDog logging
    logger.add(new winston.transports.Http({
      host: 'http-intake.logs.datadoghq.com',
      path: `/v1/input/${process.env.DATADOG_API_KEY}`,
      ssl: true
    }));
  }

  // Disable console logging in production
  logger.remove(logger.transports.find(t => t.name === 'console'));
}

export { enhancedLogger as logger };
export default enhancedLogger;