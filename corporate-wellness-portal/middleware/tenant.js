/**
 * Corporate Wellness Portal - Multi-Tenant Middleware
 * Handles tenant context and isolation
 */

import { database } from '../utils/database.js';
import { logger } from '../utils/logger.js';
import { redisClient } from '../utils/redis.js';

/**
 * Multi-tenant middleware - extracts and validates tenant context
 */
export const tenantMiddleware = async (req, res, next) => {
  try {
    let tenantId = null;
    let tenant = null;
    
    // Extract tenant ID from various sources
    tenantId = extractTenantId(req);
    
    if (!tenantId) {
      // For public endpoints, skip tenant validation
      if (isPublicEndpoint(req.path)) {
        return next();
      }
      
      return res.status(400).json({
        error: 'Tenant identification required',
        hint: 'Provide tenant ID via header, domain, or JWT token',
        requestId: req.id
      });
    }
    
    // Get tenant configuration (with caching)
    tenant = await getTenantConfig(tenantId);
    
    if (!tenant) {
      logger.warn('Invalid tenant access attempt', {
        tenantId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.id
      });
      
      return res.status(404).json({
        error: 'Tenant not found',
        requestId: req.id
      });
    }
    
    // Validate tenant status
    if (tenant.status !== 'active') {
      logger.warn('Inactive tenant access attempt', {
        tenantId,
        tenantStatus: tenant.status,
        requestId: req.id
      });
      
      return res.status(403).json({
        error: 'Tenant account is not active',
        status: tenant.status,
        requestId: req.id
      });
    }
    
    // Check subscription status
    if (tenant.subscription_status !== 'active') {
      logger.warn('Suspended tenant access attempt', {
        tenantId,
        subscriptionStatus: tenant.subscription_status,
        requestId: req.id
      });
      
      return res.status(402).json({
        error: 'Subscription required',
        subscriptionStatus: tenant.subscription_status,
        requestId: req.id
      });
    }
    
    // Set tenant context on request
    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      domain: tenant.domain,
      tier: tenant.tier,
      maxEmployees: tenant.max_employees,
      encryptionKey: tenant.encryption_key,
      config: {
        whiteLabel: tenant.white_label_config || {},
        sso: tenant.sso_config || {},
        integration: tenant.integration_config || {},
        billing: tenant.billing_config || {}
      },
      subscription: {
        tier: tenant.subscription_tier,
        status: tenant.subscription_status,
        startDate: tenant.subscription_start_date,
        endDate: tenant.subscription_end_date
      },
      securityLevel: tenant.security_level,
      complianceRequirements: tenant.compliance_requirements || []
    };
    
    // Set tenant-specific response headers
    res.set({
      'X-Tenant-ID': tenant.id,
      'X-Tenant-Tier': tenant.tier,
      'X-Security-Level': tenant.security_level
    });
    
    // Log tenant access for audit
    logger.debug('Tenant context established', {
      tenantId: tenant.id,
      tenantName: tenant.name,
      tier: tenant.tier,
      requestId: req.id
    });
    
    next();
    
  } catch (error) {
    logger.error('Tenant middleware error', {
      error: error.message,
      tenantId,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Tenant validation failed',
      requestId: req.id
    });
  }
};

/**
 * Extract tenant ID from request
 */
function extractTenantId(req) {
  // 1. Check X-Tenant-ID header
  let tenantId = req.headers['x-tenant-id'];
  if (tenantId) return tenantId;
  
  // 2. Check Authorization JWT token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // This would decode the JWT and extract tenant ID
      // For now, we'll parse it from the token structure
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.tenantId) return payload.tenantId;
    } catch (error) {
      // Invalid JWT, continue to other methods
    }
  }
  
  // 3. Check subdomain (for white-label deployments)
  const host = req.get('host');
  if (host) {
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      // Look up tenant by subdomain
      return lookupTenantBySubdomain(subdomain);
    }
  }
  
  // 4. Check custom domain mapping
  if (host) {
    return lookupTenantByDomain(host);
  }
  
  // 5. Check query parameter (for development/testing)
  if (req.query.tenantId) {
    return req.query.tenantId;
  }
  
  return null;
}

/**
 * Get tenant configuration with caching
 */
async function getTenantConfig(tenantId) {
  const cacheKey = `tenant:${tenantId}`;
  
  try {
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Query database
    const query = `
      SELECT 
        id, name, domain, tier, max_employees, encryption_key,
        white_label_config, sso_config, integration_config, billing_config,
        subscription_tier, subscription_status, subscription_start_date, subscription_end_date,
        primary_contact_email, primary_contact_name,
        industry, company_size, headquarters_location,
        status, security_level, compliance_requirements,
        created_at, updated_at
      FROM tenant_main.companies 
      WHERE id = $1
    `;
    
    const result = await database.query(query, [tenantId]);
    const tenant = result.rows[0];
    
    if (tenant) {
      // Cache for 5 minutes
      await redisClient.setex(cacheKey, 300, JSON.stringify(tenant));
    }
    
    return tenant;
    
  } catch (error) {
    logger.error('Failed to get tenant config', {
      tenantId,
      error: error.message
    });
    return null;
  }
}

/**
 * Lookup tenant by subdomain
 */
async function lookupTenantBySubdomain(subdomain) {
  try {
    const cacheKey = `tenant:subdomain:${subdomain}`;
    
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Query database for subdomain mapping
    const query = `
      SELECT id FROM tenant_main.companies 
      WHERE white_label_config->>'subdomain' = $1
      AND status = 'active'
    `;
    
    const result = await database.query(query, [subdomain]);
    const tenantId = result.rows[0]?.id;
    
    if (tenantId) {
      // Cache for 1 hour
      await redisClient.setex(cacheKey, 3600, tenantId);
    }
    
    return tenantId;
    
  } catch (error) {
    logger.error('Failed to lookup tenant by subdomain', {
      subdomain,
      error: error.message
    });
    return null;
  }
}

/**
 * Lookup tenant by custom domain
 */
async function lookupTenantByDomain(domain) {
  try {
    const cacheKey = `tenant:domain:${domain}`;
    
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Query database for domain mapping
    const query = `
      SELECT id FROM tenant_main.companies 
      WHERE domain = $1 OR white_label_config->>'customDomain' = $1
      AND status = 'active'
    `;
    
    const result = await database.query(query, [domain]);
    const tenantId = result.rows[0]?.id;
    
    if (tenantId) {
      // Cache for 1 hour
      await redisClient.setex(cacheKey, 3600, tenantId);
    }
    
    return tenantId;
    
  } catch (error) {
    logger.error('Failed to lookup tenant by domain', {
      domain,
      error: error.message
    });
    return null;
  }
}

/**
 * Check if endpoint is public (doesn't require tenant context)
 */
function isPublicEndpoint(path) {
  const publicPaths = [
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/sso',
    '/api/onboarding/template'
  ];
  
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

/**
 * Middleware to validate tenant resource access
 */
export const validateTenantResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { tenantId } = req.tenant;
      const resourceId = req.params.id || req.params.employeeId || req.params.resourceId;
      
      if (!resourceId) {
        return res.status(400).json({
          error: 'Resource ID required',
          requestId: req.id
        });
      }
      
      // Validate that the resource belongs to the tenant
      const isValid = await validateResourceOwnership(tenantId, resourceType, resourceId);
      
      if (!isValid) {
        logger.warn('Unauthorized tenant resource access attempt', {
          tenantId,
          resourceType,
          resourceId,
          requestId: req.id
        });
        
        return res.status(404).json({
          error: 'Resource not found',
          requestId: req.id
        });
      }
      
      next();
      
    } catch (error) {
      logger.error('Tenant resource validation error', {
        error: error.message,
        requestId: req.id
      });
      
      res.status(500).json({
        error: 'Resource validation failed',
        requestId: req.id
      });
    }
  };
};

/**
 * Validate resource ownership by tenant
 */
async function validateResourceOwnership(tenantId, resourceType, resourceId) {
  const ownershipQueries = {
    employee: 'SELECT 1 FROM tenant_main.employees WHERE id = $1 AND company_id = $2',
    app_assignment: 'SELECT 1 FROM tenant_main.app_assignments aa JOIN tenant_main.employees e ON aa.employee_id = e.id WHERE aa.id = $1 AND e.company_id = $2',
    onboarding: 'SELECT 1 FROM tenant_main.onboarding_sessions WHERE id = $1 AND company_id = $2'
  };
  
  const query = ownershipQueries[resourceType];
  if (!query) {
    throw new Error(`Unknown resource type: ${resourceType}`);
  }
  
  try {
    const result = await database.query(query, [resourceId, tenantId]);
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Resource ownership validation failed', {
      tenantId,
      resourceType,
      resourceId,
      error: error.message
    });
    return false;
  }
}

/**
 * Clear tenant cache (for when tenant config changes)
 */
export const clearTenantCache = async (tenantId) => {
  try {
    const cacheKeys = [
      `tenant:${tenantId}`,
      `tenant:domain:*`, // This would need pattern deletion
      `tenant:subdomain:*` // This would need pattern deletion
    ];
    
    for (const key of cacheKeys) {
      await redisClient.del(key);
    }
    
    logger.info('Tenant cache cleared', { tenantId });
  } catch (error) {
    logger.error('Failed to clear tenant cache', {
      tenantId,
      error: error.message
    });
  }
};

export default {
  tenantMiddleware,
  validateTenantResource,
  clearTenantCache
};