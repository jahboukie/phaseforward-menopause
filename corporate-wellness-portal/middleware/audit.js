/**
 * Corporate Wellness Portal - Audit Middleware
 * Comprehensive audit logging for compliance and security
 */

import { logger } from '../utils/logger.js';
import { database } from '../utils/database.js';

/**
 * Audit middleware for logging all requests
 */
export const auditMiddleware = async (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response data
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log the request
    logAuditEvent(req, res, duration, chunk);
    
    // Call original end function
    originalEnd.call(res, chunk, encoding);
  };
  
  next();
};

/**
 * Log audit event to database and logger
 */
async function logAuditEvent(req, res, duration, responseData) {
  try {
    const auditData = {
      // Request details
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      query: req.query,
      
      // User context
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      tenantId: req.tenant?.id || null,
      
      // Request metadata
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer'),
      requestId: req.id,
      
      // Response details
      statusCode: res.statusCode,
      duration: duration,
      
      // Security context
      authMethod: req.headers.authorization ? 'bearer_token' : 'none',
      
      // Timestamp
      timestamp: new Date().toISOString()
    };
    
    // Determine audit level based on request type
    const auditLevel = getAuditLevel(req, res);
    
    if (auditLevel === 'high' || auditLevel === 'critical') {
      // Store in database for high-importance events
      await storeAuditEvent(auditData);
    }
    
    // Always log to application logger
    logger.audit('Request processed', {
      ...auditData,
      auditLevel
    });
    
  } catch (error) {
    // Don't let audit logging break the application
    logger.error('Audit logging failed', {
      error: error.message,
      requestId: req.id
    });
  }
}

/**
 * Determine audit level based on request characteristics
 */
function getAuditLevel(req, res) {
  // Critical events
  if (req.path.includes('/admin') || 
      req.path.includes('/analytics') ||
      req.method === 'DELETE') {
    return 'critical';
  }
  
  // High importance events
  if (req.path.includes('/onboarding') ||
      req.path.includes('/integration') ||
      req.method === 'POST' ||
      req.method === 'PUT' ||
      res.statusCode >= 400) {
    return 'high';
  }
  
  // Medium importance events
  if (req.path.includes('/api') && req.method === 'GET') {
    return 'medium';
  }
  
  // Low importance events (static files, health checks)
  return 'low';
}

/**
 * Store audit event in database
 */
async function storeAuditEvent(auditData) {
  try {
    const query = `
      INSERT INTO tenant_audit.audit_logs (
        tenant_id, user_id, user_email, action, resource_type, resource_id,
        ip_address, user_agent, request_id, session_id,
        success, duration_ms, timestamp
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `;
    
    const values = [
      auditData.tenantId,
      auditData.userId,
      auditData.userEmail,
      `${auditData.method} ${auditData.path}`,
      extractResourceType(auditData.path),
      extractResourceId(auditData.path),
      auditData.ip,
      auditData.userAgent,
      auditData.requestId,
      null, // session_id - would be extracted from session if available
      auditData.statusCode < 400,
      auditData.duration,
      auditData.timestamp
    ];
    
    await database.query(query, values);
    
  } catch (error) {
    logger.error('Failed to store audit event in database', {
      error: error.message,
      auditData: auditData
    });
  }
}

/**
 * Extract resource type from request path
 */
function extractResourceType(path) {
  const pathSegments = path.split('/').filter(segment => segment);
  
  if (pathSegments.length >= 2) {
    return pathSegments[1]; // e.g., /api/employees -> "employees"
  }
  
  return 'unknown';
}

/**
 * Extract resource ID from request path
 */
function extractResourceId(path) {
  const pathSegments = path.split('/').filter(segment => segment);
  
  // Look for UUID pattern or numeric ID
  for (const segment of pathSegments) {
    if (isUUID(segment) || /^\d+$/.test(segment)) {
      return segment;
    }
  }
  
  return null;
}

/**
 * Check if string is a UUID
 */
function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Security event middleware for flagging suspicious activity
 */
export const securityAuditMiddleware = (req, res, next) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//,           // Path traversal
    /<script/i,         // XSS attempts
    /union\s+select/i,  // SQL injection
    /exec\s*\(/i,       // Code execution
    /eval\s*\(/i        // Code evaluation
  ];
  
  const requestData = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query
  });
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestData)
  );
  
  if (isSuspicious) {
    logger.security('Suspicious request detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      tenantId: req.tenant?.id,
      requestId: req.id,
      severity: 'high'
    });
    
    // Store security event
    storeSecurityEvent(req, 'suspicious_request', 'high');
  }
  
  next();
};

/**
 * Store security event in database
 */
async function storeSecurityEvent(req, eventType, severity) {
  try {
    const query = `
      INSERT INTO tenant_audit.security_events (
        tenant_id, event_type, severity, description, affected_user_id,
        source_ip, user_agent, detected_at, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW(), 'open'
      )
    `;
    
    const values = [
      req.tenant?.id,
      eventType,
      severity,
      `Suspicious request: ${req.method} ${req.originalUrl}`,
      req.user?.id,
      req.ip,
      req.get('User-Agent')
    ];
    
    await database.query(query, values);
    
  } catch (error) {
    logger.error('Failed to store security event', {
      error: error.message,
      eventType,
      severity
    });
  }
}

export default {
  auditMiddleware,
  securityAuditMiddleware
};