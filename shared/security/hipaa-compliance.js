/**
 * HIPAA Compliance Dashboard System
 * Military-Grade Security Foundation
 * 
 * Provides comprehensive HIPAA compliance monitoring, reporting, and management
 * Implements administrative safeguards, audit controls, and risk assessments
 */

const { Pool } = require('pg');
const crypto = require('crypto');

class HIPAAComplianceSystem {
  constructor(databaseUrl) {
    this.pool = new Pool({ connectionString: databaseUrl });
    this.initializeComplianceTables();
  }

  /**
   * Initialize HIPAA compliance tables
   */
  async initializeComplianceTables() {
    const complianceTablesSQL = `
      -- HIPAA compliance assessments
      CREATE TABLE IF NOT EXISTS hipaa_assessments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        assessment_date DATE DEFAULT CURRENT_DATE,
        assessment_type VARCHAR(50) NOT NULL, -- 'annual', 'quarterly', 'incident', 'audit'
        overall_score DECIMAL(5,2),
        administrative_score DECIMAL(5,2),
        physical_score DECIMAL(5,2),
        technical_score DECIMAL(5,2),
        findings JSONB DEFAULT '{}'::jsonb,
        recommendations JSONB DEFAULT '{}'::jsonb,
        status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'remediation_required'
        assessor_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );

      -- HIPAA safeguards tracking
      CREATE TABLE IF NOT EXISTS hipaa_safeguards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        safeguard_category VARCHAR(50) NOT NULL, -- 'administrative', 'physical', 'technical'
        safeguard_name VARCHAR(200) NOT NULL,
        requirement_text TEXT NOT NULL,
        implementation_status VARCHAR(50) DEFAULT 'not_implemented',
        implementation_details TEXT,
        evidence_documents TEXT[],
        responsible_party VARCHAR(100),
        target_date DATE,
        completion_date DATE,
        last_reviewed DATE,
        compliance_score DECIMAL(3,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Business Associate Agreements (BAA) tracking
      CREATE TABLE IF NOT EXISTS business_associate_agreements (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_name VARCHAR(200) NOT NULL,
        contact_person VARCHAR(100),
        contact_email VARCHAR(255),
        services_provided TEXT,
        baa_signed_date DATE,
        baa_expiration_date DATE,
        baa_document_path VARCHAR(500),
        phi_access_level VARCHAR(50), -- 'full', 'limited', 'none'
        security_requirements JSONB DEFAULT '{}'::jsonb,
        compliance_status VARCHAR(50) DEFAULT 'pending',
        last_assessment_date DATE,
        next_assessment_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Risk assessments
      CREATE TABLE IF NOT EXISTS hipaa_risk_assessments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        asset_type VARCHAR(100) NOT NULL, -- 'system', 'process', 'data', 'facility'
        asset_name VARCHAR(200) NOT NULL,
        threat_description TEXT,
        vulnerability_description TEXT,
        likelihood_score INTEGER, -- 1-5 scale
        impact_score INTEGER, -- 1-5 scale
        risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
        current_controls TEXT[],
        recommended_controls TEXT[],
        mitigation_plan TEXT,
        responsible_party VARCHAR(100),
        target_completion_date DATE,
        status VARCHAR(50) DEFAULT 'identified',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Breach incidents tracking
      CREATE TABLE IF NOT EXISTS breach_incidents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        incident_number VARCHAR(50) UNIQUE NOT NULL,
        discovery_date TIMESTAMP WITH TIME ZONE NOT NULL,
        incident_date TIMESTAMP WITH TIME ZONE,
        incident_type VARCHAR(100), -- 'unauthorized_access', 'data_theft', 'system_breach', 'human_error'
        affected_individuals_count INTEGER DEFAULT 0,
        phi_types_involved TEXT[],
        description TEXT NOT NULL,
        root_cause TEXT,
        immediate_actions TEXT[],
        containment_actions TEXT[],
        notification_required BOOLEAN DEFAULT false,
        hhs_notification_date TIMESTAMP WITH TIME ZONE,
        individual_notification_date TIMESTAMP WITH TIME ZONE,
        media_notification_required BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'investigating',
        investigation_findings TEXT,
        corrective_actions TEXT[],
        lessons_learned TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Training records
      CREATE TABLE IF NOT EXISTS hipaa_training_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID,
        employee_name VARCHAR(200) NOT NULL,
        training_type VARCHAR(100), -- 'initial', 'annual', 'role_specific', 'incident_response'
        training_date DATE NOT NULL,
        training_duration_hours DECIMAL(4,2),
        training_provider VARCHAR(200),
        completion_status VARCHAR(50) DEFAULT 'completed',
        test_score DECIMAL(5,2),
        certificate_path VARCHAR(500),
        next_training_due DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_hipaa_assessments_date ON hipaa_assessments(assessment_date);
      CREATE INDEX IF NOT EXISTS idx_hipaa_safeguards_category ON hipaa_safeguards(safeguard_category);
      CREATE INDEX IF NOT EXISTS idx_baa_expiration ON business_associate_agreements(baa_expiration_date);
      CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON hipaa_risk_assessments(risk_level);
      CREATE INDEX IF NOT EXISTS idx_breach_incidents_date ON breach_incidents(discovery_date);
    `;

    try {
      await this.pool.query(complianceTablesSQL);
      await this.initializeHIPAASafeguards();
    } catch (error) {
      console.error('Failed to initialize HIPAA compliance tables:', error);
    }
  }

  /**
   * Initialize HIPAA safeguards requirements
   */
  async initializeHIPAASafeguards() {
    const safeguards = [
      // Administrative Safeguards
      {
        category: 'administrative',
        name: 'Security Officer',
        requirement: 'Assign security responsibilities to one individual'
      },
      {
        category: 'administrative',
        name: 'Workforce Training',
        requirement: 'Train all workforce members on PHI policies and procedures'
      },
      {
        category: 'administrative',
        name: 'Access Management',
        requirement: 'Implement procedures for granting access to PHI'
      },
      {
        category: 'administrative',
        name: 'Contingency Plan',
        requirement: 'Establish procedures for responding to emergencies'
      },
      
      // Physical Safeguards
      {
        category: 'physical',
        name: 'Facility Access Controls',
        requirement: 'Limit physical access to facilities containing PHI'
      },
      {
        category: 'physical',
        name: 'Workstation Use',
        requirement: 'Implement policies for workstation use and access'
      },
      {
        category: 'physical',
        name: 'Device and Media Controls',
        requirement: 'Implement controls for electronic media containing PHI'
      },
      
      // Technical Safeguards
      {
        category: 'technical',
        name: 'Access Control',
        requirement: 'Implement technical policies and procedures for electronic access'
      },
      {
        category: 'technical',
        name: 'Audit Controls',
        requirement: 'Implement hardware, software, and procedural mechanisms for audit logs'
      },
      {
        category: 'technical',
        name: 'Integrity',
        requirement: 'Protect PHI from improper alteration or destruction'
      },
      {
        category: 'technical',
        name: 'Person or Entity Authentication',
        requirement: 'Verify that persons seeking access are who they claim to be'
      },
      {
        category: 'technical',
        name: 'Transmission Security',
        requirement: 'Implement technical security measures for PHI transmission'
      }
    ];

    for (const safeguard of safeguards) {
      await this.addSafeguardRequirement(
        safeguard.category,
        safeguard.name,
        safeguard.requirement
      );
    }
  }

  /**
   * Add HIPAA safeguard requirement
   */
  async addSafeguardRequirement(category, name, requirement) {
    const insertQuery = `
      INSERT INTO hipaa_safeguards (
        safeguard_category, safeguard_name, requirement_text
      ) VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
    `;

    await this.pool.query(insertQuery, [category, name, requirement]);
  }

  /**
   * Conduct HIPAA compliance assessment
   */
  async conductComplianceAssessment(assessmentType = 'quarterly', assessorId = null) {
    const assessmentId = crypto.randomUUID();
    
    // Calculate scores for each category
    const administrativeScore = await this.calculateCategoryScore('administrative');
    const physicalScore = await this.calculateCategoryScore('physical');
    const technicalScore = await this.calculateCategoryScore('technical');
    
    const overallScore = (administrativeScore + physicalScore + technicalScore) / 3;

    // Generate findings and recommendations
    const findings = await this.generateFindings();
    const recommendations = await this.generateRecommendations(findings);

    const insertQuery = `
      INSERT INTO hipaa_assessments (
        id, assessment_type, overall_score, administrative_score,
        physical_score, technical_score, findings, recommendations, assessor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;

    const result = await this.pool.query(insertQuery, [
      assessmentId, assessmentType, overallScore, administrativeScore,
      physicalScore, technicalScore, JSON.stringify(findings),
      JSON.stringify(recommendations), assessorId
    ]);

    return result.rows[0].id;
  }

  /**
   * Calculate compliance score for a category
   */
  async calculateCategoryScore(category) {
    const query = `
      SELECT AVG(compliance_score) as avg_score
      FROM hipaa_safeguards
      WHERE safeguard_category = $1 AND compliance_score IS NOT NULL
    `;

    const result = await this.pool.query(query, [category]);
    return parseFloat(result.rows[0].avg_score) || 0;
  }

  /**
   * Generate compliance findings
   */
  async generateFindings() {
    const findings = {
      critical_issues: [],
      high_priority: [],
      medium_priority: [],
      low_priority: []
    };

    // Check for critical issues
    const criticalQuery = `
      SELECT safeguard_name, implementation_status
      FROM hipaa_safeguards
      WHERE implementation_status = 'not_implemented' 
      AND safeguard_category = 'technical'
    `;

    const criticalResult = await this.pool.query(criticalQuery);
    findings.critical_issues = criticalResult.rows.map(row => ({
      safeguard: row.safeguard_name,
      issue: 'Not implemented',
      priority: 'critical'
    }));

    // Check for high-risk items
    const highRiskQuery = `
      SELECT asset_name, risk_level, threat_description
      FROM hipaa_risk_assessments
      WHERE risk_level IN ('high', 'critical') AND status != 'mitigated'
    `;

    const highRiskResult = await this.pool.query(highRiskQuery);
    findings.high_priority = highRiskResult.rows.map(row => ({
      asset: row.asset_name,
      risk: row.risk_level,
      threat: row.threat_description
    }));

    return findings;
  }

  /**
   * Generate recommendations based on findings
   */
  async generateRecommendations(findings) {
    const recommendations = [];

    // Critical issues recommendations
    for (const issue of findings.critical_issues) {
      recommendations.push({
        priority: 'critical',
        action: `Immediately implement ${issue.safeguard}`,
        timeline: '30 days',
        responsible: 'Security Officer'
      });
    }

    // High-risk recommendations
    for (const risk of findings.high_priority) {
      recommendations.push({
        priority: 'high',
        action: `Develop mitigation plan for ${risk.asset}`,
        timeline: '60 days',
        responsible: 'Risk Management Team'
      });
    }

    return recommendations;
  }

  /**
   * Track breach incident
   */
  async reportBreachIncident({
    incidentType,
    discoveryDate,
    incidentDate,
    affectedCount = 0,
    phiTypesInvolved = [],
    description,
    immediateActions = []
  }) {
    const incidentNumber = this.generateIncidentNumber();
    
    const insertQuery = `
      INSERT INTO breach_incidents (
        incident_number, incident_type, discovery_date, incident_date,
        affected_individuals_count, phi_types_involved, description, immediate_actions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const result = await this.pool.query(insertQuery, [
      incidentNumber, incidentType, discoveryDate, incidentDate,
      affectedCount, phiTypesInvolved, description, immediateActions
    ]);

    // Determine if notifications are required
    await this.assessNotificationRequirements(result.rows[0].id, affectedCount);

    return result.rows[0].id;
  }

  /**
   * Assess notification requirements for breach
   */
  async assessNotificationRequirements(incidentId, affectedCount) {
    const notificationRequired = affectedCount >= 500; // HHS threshold
    const mediaNotificationRequired = affectedCount >= 500;

    const updateQuery = `
      UPDATE breach_incidents
      SET notification_required = $1, media_notification_required = $2
      WHERE id = $3
    `;

    await this.pool.query(updateQuery, [
      notificationRequired, mediaNotificationRequired, incidentId
    ]);
  }

  /**
   * Generate incident number
   */
  generateIncidentNumber() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `INC-${year}-${timestamp}`;
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard() {
    // Get latest assessment
    const latestAssessment = await this.pool.query(`
      SELECT * FROM hipaa_assessments
      ORDER BY assessment_date DESC
      LIMIT 1
    `);

    // Get safeguards status
    const safeguardsStatus = await this.pool.query(`
      SELECT 
        safeguard_category,
        COUNT(*) as total,
        COUNT(CASE WHEN implementation_status = 'implemented' THEN 1 END) as implemented
      FROM hipaa_safeguards
      GROUP BY safeguard_category
    `);

    // Get active risks
    const activeRisks = await this.pool.query(`
      SELECT risk_level, COUNT(*) as count
      FROM hipaa_risk_assessments
      WHERE status != 'mitigated'
      GROUP BY risk_level
    `);

    // Get recent incidents
    const recentIncidents = await this.pool.query(`
      SELECT incident_type, COUNT(*) as count
      FROM breach_incidents
      WHERE discovery_date >= NOW() - INTERVAL '30 days'
      GROUP BY incident_type
    `);

    return {
      latestAssessment: latestAssessment.rows[0],
      safeguardsStatus: safeguardsStatus.rows,
      activeRisks: activeRisks.rows,
      recentIncidents: recentIncidents.rows
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate, endDate) {
    const report = {
      period: { startDate, endDate },
      assessments: [],
      incidents: [],
      training: [],
      recommendations: []
    };

    // Get assessments in period
    const assessmentsQuery = `
      SELECT * FROM hipaa_assessments
      WHERE assessment_date BETWEEN $1 AND $2
      ORDER BY assessment_date DESC
    `;
    const assessments = await this.pool.query(assessmentsQuery, [startDate, endDate]);
    report.assessments = assessments.rows;

    // Get incidents in period
    const incidentsQuery = `
      SELECT * FROM breach_incidents
      WHERE discovery_date BETWEEN $1 AND $2
      ORDER BY discovery_date DESC
    `;
    const incidents = await this.pool.query(incidentsQuery, [startDate, endDate]);
    report.incidents = incidents.rows;

    return report;
  }
}

module.exports = HIPAAComplianceSystem;
