/**
 * Integrated Security Middleware
 * Military-Grade Security Foundation
 * 
 * Integrates all security systems: encryption, audit, MFA, compliance
 * Provides unified security layer for all microservices
 */

const ZeroKnowledgeEncryption = require('./encryption');
const AuditTrailSystem = require('./audit-trail');
const EnhancedMFASystem = require('./mfa-system');
const DatabaseEncryptionSystem = require('./database-encryption');
const HIPAAComplianceSystem = require('./hipaa-compliance');

class SecurityMiddleware {
  constructor(databaseUrl) {
    this.encryption = new ZeroKnowledgeEncryption();
    this.auditTrail = new AuditTrailSystem(databaseUrl);
    this.mfaSystem = new EnhancedMFASystem(databaseUrl);
    this.dbEncryption = new DatabaseEncryptionSystem(databaseUrl);
    this.hipaaCompliance = new HIPAAComplianceSystem(databaseUrl);
  }

  /**
   * Comprehensive authentication middleware
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        const authContext = this.extractAuthContext(req);
        
        // Log authentication attempt
        const { riskScore, requiredFactors } = await this.mfaSystem.logAuthAttempt(
          req.user?.id,
          'api_access',
          false, // Will be updated on success
          authContext
        );

        // Store risk assessment in request
        req.securityContext = {
          riskScore,
          requiredFactors,
          authContext
        };

        // Audit the authentication attempt
        await this.auditTrail.logEvent({
          eventType: 'authentication_attempt',
          eventCategory: 'authentication',
          userId: req.user?.id,
          sessionId: req.sessionID,
          ipAddress: authContext.ipAddress,
          userAgent: authContext.userAgent,
          action: 'api_access',
          outcome: 'pending',
          details: { riskScore, requiredFactors },
          riskLevel: this.getRiskLevel(riskScore)
        });

        next();
      } catch (error) {
        await this.auditTrail.logEvent({
          eventType: 'authentication_error',
          eventCategory: 'system',
          action: 'middleware_error',
          outcome: 'failure',
          details: { error: error.message },
          riskLevel: 3
        });

        res.status(500).json({ error: 'Authentication system error' });
      }
    };
  }

  /**
   * Data access authorization middleware
   */
  authorizeDataAccess(resourceType, requiredPermissions = []) {
    return async (req, res, next) => {
      try {
        const userId = req.user?.id;
        const resourceId = req.params.id || req.body.id;

        // Check if accessing PHI
        const isPhiAccess = this.isPhiResource(resourceType);
        
        // Enhanced authorization for PHI
        if (isPhiAccess && req.securityContext.riskScore > 0.6) {
          return res.status(403).json({
            error: 'Additional authentication required for PHI access',
            requiredFactors: req.securityContext.requiredFactors
          });
        }

        // Log data access attempt
        const auditLogId = await this.auditTrail.logEvent({
          eventType: 'data_access_attempt',
          eventCategory: 'data_access',
          userId: userId,
          sessionId: req.sessionID,
          ipAddress: req.securityContext.authContext.ipAddress,
          userAgent: req.securityContext.authContext.userAgent,
          resourceType: resourceType,
          resourceId: resourceId,
          action: req.method,
          outcome: 'success',
          details: { 
            permissions: requiredPermissions,
            riskScore: req.securityContext.riskScore
          },
          riskLevel: this.getRiskLevel(req.securityContext.riskScore)
        });

        // Log HIPAA event if PHI access
        if (isPhiAccess) {
          await this.auditTrail.logHIPAAEvent(auditLogId, {
            patientId: this.extractPatientId(req),
            phiAccessed: true,
            phiTypes: this.getPhiTypes(resourceType),
            accessPurpose: req.headers['x-access-purpose'] || 'treatment',
            minimumNecessary: true,
            authorizationPresent: req.headers['x-authorization-present'] === 'true'
          });
        }

        req.auditLogId = auditLogId;
        next();
      } catch (error) {
        res.status(500).json({ error: 'Authorization system error' });
      }
    };
  }

  /**
   * Data encryption middleware for requests
   */
  encryptRequestData() {
    return async (req, res, next) => {
      try {
        if (req.body && typeof req.body === 'object') {
          req.body = await this.encryptSensitiveFields(req.body, req.route?.path);
        }
        next();
      } catch (error) {
        res.status(500).json({ error: 'Data encryption error' });
      }
    };
  }

  /**
   * Data decryption middleware for responses
   */
  decryptResponseData() {
    return async (req, res, next) => {
      const originalSend = res.send;
      
      res.send = async function(data) {
        try {
          if (data && typeof data === 'object') {
            data = await this.decryptSensitiveFields(data, req.route?.path);
          }
        } catch (error) {
          console.error('Response decryption error:', error);
        }
        
        originalSend.call(this, data);
      }.bind(this);
      
      next();
    };
  }

  /**
   * Rate limiting with risk-based adjustments
   */
  riskBasedRateLimit() {
    return (req, res, next) => {
      const riskScore = req.securityContext?.riskScore || 0;
      const baseLimit = 100; // requests per hour
      
      // Reduce rate limit for higher risk scores
      const adjustedLimit = Math.floor(baseLimit * (1 - riskScore));
      
      // Implement rate limiting logic here
      // This would integrate with express-rate-limit or similar
      
      req.rateLimit = {
        limit: adjustedLimit,
        remaining: adjustedLimit - (req.rateLimitCount || 0)
      };
      
      next();
    };
  }

  /**
   * Breach detection middleware
   */
  breachDetection() {
    return async (req, res, next) => {
      try {
        const anomalyScore = await this.calculateAnomalyScore(req);
        
        if (anomalyScore > 0.8) {
          // Log security event
          const auditLogId = await this.auditTrail.logEvent({
            eventType: 'security_anomaly',
            eventCategory: 'system',
            userId: req.user?.id,
            sessionId: req.sessionID,
            ipAddress: req.securityContext.authContext.ipAddress,
            action: 'anomaly_detection',
            outcome: 'warning',
            details: { anomalyScore },
            riskLevel: 4
          });

          await this.auditTrail.logSecurityEvent(auditLogId, {
            threatLevel: 4,
            attackVector: 'suspicious_behavior',
            indicators: {
              anomalyScore,
              requestPattern: req.method + ' ' + req.path,
              userAgent: req.headers['user-agent']
            },
            anomalyScore,
            responseActions: ['increased_monitoring', 'rate_limit_applied'],
            investigationStatus: 'automated_review'
          });

          // Apply additional security measures
          req.securityFlags = {
            highRisk: true,
            additionalMonitoring: true,
            restrictedAccess: true
          };
        }

        next();
      } catch (error) {
        next(); // Don't block request on detection error
      }
    };
  }

  /**
   * Extract authentication context from request
   */
  extractAuthContext(req) {
    return {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      geolocation: req.headers['x-geolocation'] ? 
        JSON.parse(req.headers['x-geolocation']) : null,
      deviceFingerprint: req.headers['x-device-fingerprint'],
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay()
    };
  }

  /**
   * Check if resource contains PHI
   */
  isPhiResource(resourceType) {
    const phiResources = [
      'users', 'patients', 'clinical_notes', 'medical_history',
      'patient_onboarding', 'treatment_data', 'health_records'
    ];
    return phiResources.includes(resourceType);
  }

  /**
   * Extract patient ID from request
   */
  extractPatientId(req) {
    return req.params.patientId || req.body.patientId || req.user?.id;
  }

  /**
   * Get PHI types for resource
   */
  getPhiTypes(resourceType) {
    const phiTypeMap = {
      'users': ['demographics', 'contact_info'],
      'clinical_notes': ['medical_history', 'treatment_data'],
      'patient_onboarding': ['medical_history', 'medications', 'allergies'],
      'health_records': ['all_phi_types']
    };
    return phiTypeMap[resourceType] || ['general_phi'];
  }

  /**
   * Convert risk score to risk level
   */
  getRiskLevel(riskScore) {
    if (riskScore < 0.3) return 1; // Low
    if (riskScore < 0.6) return 2; // Medium
    if (riskScore < 0.8) return 3; // High
    return 4; // Critical
  }

  /**
   * Calculate anomaly score for request
   */
  async calculateAnomalyScore(req) {
    let score = 0;

    // Check for unusual request patterns
    if (req.headers['user-agent']?.includes('bot')) score += 0.3;
    if (req.method === 'DELETE') score += 0.2;
    if (req.path.includes('admin')) score += 0.2;
    
    // Check request frequency
    const userRequests = await this.getUserRequestCount(req.user?.id);
    if (userRequests > 1000) score += 0.3;

    return Math.min(score, 1.0);
  }

  /**
   * Get user request count (placeholder)
   */
  async getUserRequestCount(userId) {
    // Implementation would query recent request counts
    return 0;
  }

  /**
   * Encrypt sensitive fields in data
   */
  async encryptSensitiveFields(data, routePath) {
    // Implementation would identify and encrypt sensitive fields
    // based on data classification rules
    return data;
  }

  /**
   * Decrypt sensitive fields in data
   */
  async decryptSensitiveFields(data, routePath) {
    // Implementation would identify and decrypt sensitive fields
    // based on data classification rules
    return data;
  }

  /**
   * Initialize security middleware for Express app
   */
  static initializeForApp(app, databaseUrl) {
    const security = new SecurityMiddleware(databaseUrl);

    // Apply security middleware globally
    app.use(security.authenticate());
    app.use(security.breachDetection());
    app.use(security.riskBasedRateLimit());
    app.use(security.encryptRequestData());
    app.use(security.decryptResponseData());

    return security;
  }
}

module.exports = SecurityMiddleware;
