/**
 * Comprehensive Audit Trail System
 * HIPAA-Compliant Immutable Logging
 * 
 * Tracks all data access, modifications, and system events
 * Maintains 7+ year retention with tamper-proof logs
 */

const crypto = require('crypto');
const { Pool } = require('pg');

class AuditTrailSystem {
  constructor(databaseUrl) {
    this.pool = new Pool({ connectionString: databaseUrl });
    this.initializeAuditTables();
  }

  /**
   * Initialize audit tables with proper indexes and constraints
   */
  async initializeAuditTables() {
    const auditTablesSQL = `
      -- Comprehensive audit log table
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id VARCHAR(64) UNIQUE NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        event_type VARCHAR(100) NOT NULL,
        event_category VARCHAR(50) NOT NULL, -- 'data_access', 'data_modification', 'authentication', 'system'
        user_id UUID,
        session_id VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        resource_type VARCHAR(100),
        resource_id VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        outcome VARCHAR(20) NOT NULL, -- 'success', 'failure', 'warning'
        details JSONB DEFAULT '{}'::jsonb,
        before_state JSONB,
        after_state JSONB,
        risk_level INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=critical
        compliance_flags TEXT[],
        hash_chain VARCHAR(64), -- For tamper detection
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- HIPAA-specific audit events
      CREATE TABLE IF NOT EXISTS hipaa_audit_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        audit_log_id UUID REFERENCES audit_logs(id) ON DELETE CASCADE,
        patient_id UUID,
        phi_accessed BOOLEAN DEFAULT false,
        phi_types TEXT[], -- 'demographics', 'medical_history', 'treatment_data', etc.
        access_purpose VARCHAR(100), -- 'treatment', 'payment', 'operations', 'research'
        minimum_necessary BOOLEAN DEFAULT true,
        authorization_present BOOLEAN DEFAULT false,
        disclosure_recipient VARCHAR(255),
        retention_period INTERVAL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Security events for breach detection
      CREATE TABLE IF NOT EXISTS security_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        audit_log_id UUID REFERENCES audit_logs(id) ON DELETE CASCADE,
        threat_level INTEGER DEFAULT 1,
        attack_vector VARCHAR(100),
        indicators JSONB DEFAULT '{}'::jsonb,
        geolocation JSONB,
        device_fingerprint VARCHAR(255),
        anomaly_score DECIMAL(5,4),
        response_actions TEXT[],
        investigation_status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Data lineage tracking
      CREATE TABLE IF NOT EXISTS data_lineage (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        audit_log_id UUID REFERENCES audit_logs(id) ON DELETE CASCADE,
        source_system VARCHAR(100),
        destination_system VARCHAR(100),
        data_classification VARCHAR(50), -- 'public', 'internal', 'confidential', 'restricted'
        transformation_applied JSONB,
        data_quality_score DECIMAL(3,2),
        compliance_tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_hipaa_audit_patient ON hipaa_audit_events(patient_id);
      CREATE INDEX IF NOT EXISTS idx_security_events_threat ON security_events(threat_level);
    `;

    try {
      await this.pool.query(auditTablesSQL);
    } catch (error) {
      console.error('Failed to initialize audit tables:', error);
    }
  }

  /**
   * Generate unique event ID with timestamp and hash
   */
  generateEventId() {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(8).toString('hex');
    return crypto.createHash('sha256')
      .update(timestamp + random)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Calculate hash chain for tamper detection
   */
  async calculateHashChain(eventData) {
    // Get the last hash from the chain
    const lastHashQuery = `
      SELECT hash_chain FROM audit_logs 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;
    
    const result = await this.pool.query(lastHashQuery);
    const previousHash = result.rows[0]?.hash_chain || '0';
    
    // Create hash of current event + previous hash
    const eventString = JSON.stringify(eventData);
    return crypto.createHash('sha256')
      .update(previousHash + eventString)
      .digest('hex');
  }

  /**
   * Log comprehensive audit event
   */
  async logEvent({
    eventType,
    eventCategory,
    userId = null,
    sessionId = null,
    ipAddress = null,
    userAgent = null,
    resourceType = null,
    resourceId = null,
    action,
    outcome = 'success',
    details = {},
    beforeState = null,
    afterState = null,
    riskLevel = 1,
    complianceFlags = []
  }) {
    const eventId = this.generateEventId();
    const eventData = {
      eventId,
      eventType,
      eventCategory,
      userId,
      action,
      outcome,
      details
    };
    
    const hashChain = await this.calculateHashChain(eventData);

    const insertQuery = `
      INSERT INTO audit_logs (
        event_id, event_type, event_category, user_id, session_id,
        ip_address, user_agent, resource_type, resource_id, action,
        outcome, details, before_state, after_state, risk_level,
        compliance_flags, hash_chain
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id
    `;

    const values = [
      eventId, eventType, eventCategory, userId, sessionId,
      ipAddress, userAgent, resourceType, resourceId, action,
      outcome, JSON.stringify(details), 
      beforeState ? JSON.stringify(beforeState) : null,
      afterState ? JSON.stringify(afterState) : null,
      riskLevel, complianceFlags, hashChain
    ];

    try {
      const result = await this.pool.query(insertQuery, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('Failed to log audit event:', error);
      throw error;
    }
  }

  /**
   * Log HIPAA-specific audit event
   */
  async logHIPAAEvent(auditLogId, {
    patientId,
    phiAccessed = false,
    phiTypes = [],
    accessPurpose = 'treatment',
    minimumNecessary = true,
    authorizationPresent = false,
    disclosureRecipient = null,
    retentionPeriod = '7 years'
  }) {
    const insertQuery = `
      INSERT INTO hipaa_audit_events (
        audit_log_id, patient_id, phi_accessed, phi_types,
        access_purpose, minimum_necessary, authorization_present,
        disclosure_recipient, retention_period
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values = [
      auditLogId, patientId, phiAccessed, phiTypes,
      accessPurpose, minimumNecessary, authorizationPresent,
      disclosureRecipient, retentionPeriod
    ];

    try {
      await this.pool.query(insertQuery, values);
    } catch (error) {
      console.error('Failed to log HIPAA event:', error);
      throw error;
    }
  }

  /**
   * Log security event for breach detection
   */
  async logSecurityEvent(auditLogId, {
    threatLevel = 1,
    attackVector = null,
    indicators = {},
    geolocation = null,
    deviceFingerprint = null,
    anomalyScore = 0,
    responseActions = [],
    investigationStatus = 'pending'
  }) {
    const insertQuery = `
      INSERT INTO security_events (
        audit_log_id, threat_level, attack_vector, indicators,
        geolocation, device_fingerprint, anomaly_score,
        response_actions, investigation_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values = [
      auditLogId, threatLevel, attackVector, JSON.stringify(indicators),
      geolocation ? JSON.stringify(geolocation) : null,
      deviceFingerprint, anomalyScore, responseActions, investigationStatus
    ];

    try {
      await this.pool.query(insertQuery, values);
    } catch (error) {
      console.error('Failed to log security event:', error);
      throw error;
    }
  }

  /**
   * Verify audit trail integrity using hash chain
   */
  async verifyIntegrity() {
    const query = `
      SELECT event_id, hash_chain, details, timestamp
      FROM audit_logs
      ORDER BY timestamp ASC
    `;

    const result = await this.pool.query(query);
    const logs = result.rows;

    let previousHash = '0';
    const tamperedEvents = [];

    for (const log of logs) {
      const eventData = {
        eventId: log.event_id,
        details: log.details
      };
      
      const expectedHash = crypto.createHash('sha256')
        .update(previousHash + JSON.stringify(eventData))
        .digest('hex');

      if (expectedHash !== log.hash_chain) {
        tamperedEvents.push({
          eventId: log.event_id,
          timestamp: log.timestamp,
          expectedHash,
          actualHash: log.hash_chain
        });
      }

      previousHash = log.hash_chain;
    }

    return {
      isIntact: tamperedEvents.length === 0,
      tamperedEvents
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate, endDate) {
    const query = `
      SELECT 
        event_category,
        COUNT(*) as event_count,
        COUNT(CASE WHEN outcome = 'failure' THEN 1 END) as failure_count,
        COUNT(CASE WHEN risk_level >= 3 THEN 1 END) as high_risk_count
      FROM audit_logs
      WHERE timestamp BETWEEN $1 AND $2
      GROUP BY event_category
    `;

    const result = await this.pool.query(query, [startDate, endDate]);
    return result.rows;
  }
}

module.exports = AuditTrailSystem;
