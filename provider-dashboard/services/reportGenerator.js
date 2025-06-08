const moment = require('moment');
const db = require('../utils/database');
const logger = require('../utils/logger');

/**
 * Generate patient-specific reports
 */
const generatePatientReport = async (reportType, options) => {
  const { providerId, patientIds, dateRange, parameters } = options;
  
  try {
    const startDate = dateRange.startDate || moment().subtract(90, 'days').toISOString();
    const endDate = dateRange.endDate || moment().toISOString();

    const report = {
      reportType,
      generatedAt: new Date().toISOString(),
      dateRange: { startDate, endDate },
      patients: []
    };

    for (const patientId of patientIds) {
      const patientData = await generateSinglePatientReport(patientId, providerId, startDate, endDate, parameters);
      report.patients.push(patientData);
    }

    // Add summary statistics
    report.summary = generatePatientSummaryStats(report.patients);

    return report;

  } catch (error) {
    logger.error('Patient report generation error:', error);
    throw error;
  }
};

/**
 * Generate population health reports
 */
const generatePopulationReport = async (reportType, options) => {
  const { providerId, practiceId, dateRange, parameters } = options;
  
  try {
    const startDate = dateRange.startDate || moment().subtract(90, 'days').toISOString();
    const endDate = dateRange.endDate || moment().toISOString();

    const report = {
      reportType,
      generatedAt: new Date().toISOString(),
      dateRange: { startDate, endDate },
      practiceId
    };

    // Get all patients for this provider
    const patientsResult = await db.query(`
      SELECT DISTINCT pp.patient_id
      FROM provider_patients pp
      WHERE pp.provider_id = $1 AND pp.is_active = true
    `, [providerId]);

    const patientIds = patientsResult.rows.map(row => row.patient_id);

    if (reportType === 'outcome_analysis') {
      report.outcomeAnalysis = await generateOutcomeAnalysis(patientIds, startDate, endDate, parameters);
    } else if (reportType === 'population_health') {
      report.populationHealth = await generatePopulationHealthMetrics(patientIds, startDate, endDate, parameters);
    }

    return report;

  } catch (error) {
    logger.error('Population report generation error:', error);
    throw error;
  }
};

/**
 * Generate comprehensive data for a single patient
 */
const generateSinglePatientReport = async (patientId, providerId, startDate, endDate, parameters) => {
  try {
    // Get patient basic info
    const patientResult = await db.query(`
      SELECT 
        u.*,
        po.medical_history,
        po.current_medications,
        po.allergies,
        po.chief_complaint,
        po.goals
      FROM users u
      LEFT JOIN patient_onboarding po ON u.id = po.patient_id AND po.provider_id = $2
      WHERE u.id = $1
    `, [patientId, providerId]);

    if (patientResult.rows.length === 0) {
      throw new Error(`Patient ${patientId} not found`);
    }

    const patient = patientResult.rows[0];

    // Get app usage data
    const appUsageResult = await db.query(`
      SELECT 
        ar.app_name,
        COUNT(*) as event_count,
        MIN(ae.timestamp) as first_event,
        MAX(ae.timestamp) as last_event,
        COUNT(DISTINCT DATE(ae.timestamp)) as active_days
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.user_id = $1 
        AND ae.timestamp >= $2 
        AND ae.timestamp <= $3
      GROUP BY ar.app_name
      ORDER BY event_count DESC
    `, [patientId, startDate, endDate]);

    // Get health metrics over time
    const healthMetricsResult = await db.query(`
      SELECT 
        DATE(ae.timestamp) as date,
        ae.event_data
      FROM analytics_events ae
      WHERE ae.user_id = $1 
        AND ae.event_type = 'health_data'
        AND ae.timestamp >= $2 
        AND ae.timestamp <= $3
      ORDER BY ae.timestamp
    `, [patientId, startDate, endDate]);

    // Get communications
    const communicationsResult = await db.query(`
      SELECT 
        communication_type,
        direction,
        COUNT(*) as count,
        MAX(created_at) as last_communication
      FROM patient_communications
      WHERE patient_id = $1 AND provider_id = $2
        AND created_at >= $3 AND created_at <= $4
      GROUP BY communication_type, direction
    `, [patientId, providerId, startDate, endDate]);

    // Get clinical notes
    const notesResult = await db.query(`
      SELECT *
      FROM clinical_notes
      WHERE patient_id = $1 AND provider_id = $2
        AND created_at >= $3 AND created_at <= $4
      ORDER BY created_at DESC
    `, [patientId, providerId, startDate, endDate]);

    // Process health metrics trends
    const healthTrends = processHealthMetrics(healthMetricsResult.rows);

    // Calculate engagement score
    const engagementScore = calculateEngagementScore(appUsageResult.rows, communicationsResult.rows);

    return {
      patientInfo: {
        id: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        dateOfBirth: patient.date_of_birth,
        gender: patient.gender,
        medicalHistory: patient.medical_history,
        currentMedications: patient.current_medications,
        allergies: patient.allergies,
        chiefComplaint: patient.chief_complaint,
        goals: patient.goals
      },
      appUsage: appUsageResult.rows,
      healthTrends,
      communications: communicationsResult.rows,
      clinicalNotes: notesResult.rows,
      engagementScore,
      reportPeriod: { startDate, endDate }
    };

  } catch (error) {
    logger.error(`Single patient report error for ${patientId}:`, error);
    throw error;
  }
};

/**
 * Generate outcome analysis across patients
 */
const generateOutcomeAnalysis = async (patientIds, startDate, endDate, parameters) => {
  try {
    // Get health outcomes data
    const outcomesResult = await db.query(`
      SELECT 
        ae.user_id,
        ae.event_data,
        ae.timestamp,
        ar.app_name
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.user_id = ANY($1)
        AND ae.event_type IN ('health_data', 'treatment_progress')
        AND ae.timestamp >= $2 
        AND ae.timestamp <= $3
      ORDER BY ae.user_id, ae.timestamp
    `, [patientIds, startDate, endDate]);

    // Group by patient and analyze trends
    const patientOutcomes = {};
    outcomesResult.rows.forEach(row => {
      if (!patientOutcomes[row.user_id]) {
        patientOutcomes[row.user_id] = [];
      }
      patientOutcomes[row.user_id].push({
        timestamp: row.timestamp,
        data: row.event_data,
        app: row.app_name
      });
    });

    // Calculate improvement metrics
    const outcomes = {
      totalPatients: patientIds.length,
      patientsWithData: Object.keys(patientOutcomes).length,
      improvementMetrics: {},
      appEffectiveness: {},
      correlations: []
    };

    // Analyze improvement trends
    Object.entries(patientOutcomes).forEach(([patientId, events]) => {
      const improvement = analyzePatientImprovement(events);
      if (improvement) {
        outcomes.improvementMetrics[patientId] = improvement;
      }
    });

    // Calculate app effectiveness
    const appGroups = {};
    outcomesResult.rows.forEach(row => {
      if (!appGroups[row.app_name]) {
        appGroups[row.app_name] = [];
      }
      appGroups[row.app_name].push(row);
    });

    Object.entries(appGroups).forEach(([appName, events]) => {
      outcomes.appEffectiveness[appName] = calculateAppEffectiveness(events);
    });

    return outcomes;

  } catch (error) {
    logger.error('Outcome analysis error:', error);
    throw error;
  }
};

/**
 * Generate population health metrics
 */
const generatePopulationHealthMetrics = async (patientIds, startDate, endDate, parameters) => {
  try {
    // Get demographic breakdown
    const demographicsResult = await db.query(`
      SELECT 
        gender,
        EXTRACT(YEAR FROM AGE(date_of_birth)) as age_group,
        COUNT(*) as count
      FROM users
      WHERE id = ANY($1)
      GROUP BY gender, EXTRACT(YEAR FROM AGE(date_of_birth))
      ORDER BY gender, age_group
    `, [patientIds]);

    // Get app adoption rates
    const adoptionResult = await db.query(`
      SELECT 
        ar.app_name,
        COUNT(DISTINCT uas.user_id) as users,
        COUNT(DISTINCT CASE WHEN uas.subscription_status = 'active' THEN uas.user_id END) as active_users
      FROM app_registrations ar
      LEFT JOIN user_app_subscriptions uas ON ar.id = uas.app_id
      WHERE uas.user_id = ANY($1)
      GROUP BY ar.app_name
      ORDER BY users DESC
    `, [patientIds]);

    // Get engagement patterns
    const engagementResult = await db.query(`
      SELECT 
        DATE_TRUNC('week', ae.timestamp) as week,
        COUNT(DISTINCT ae.user_id) as active_users,
        COUNT(*) as total_events,
        AVG(CASE WHEN ae.event_type = 'health_data' THEN 1 ELSE 0 END) as health_data_ratio
      FROM analytics_events ae
      WHERE ae.user_id = ANY($1)
        AND ae.timestamp >= $2 
        AND ae.timestamp <= $3
      GROUP BY DATE_TRUNC('week', ae.timestamp)
      ORDER BY week
    `, [patientIds, startDate, endDate]);

    return {
      totalPatients: patientIds.length,
      demographics: demographicsResult.rows,
      appAdoption: adoptionResult.rows,
      engagementTrends: engagementResult.rows,
      reportPeriod: { startDate, endDate }
    };

  } catch (error) {
    logger.error('Population health metrics error:', error);
    throw error;
  }
};

/**
 * Helper functions
 */
const processHealthMetrics = (healthData) => {
  const metrics = {};
  
  healthData.forEach(row => {
    const data = row.event_data;
    Object.entries(data).forEach(([metric, value]) => {
      if (typeof value === 'number') {
        if (!metrics[metric]) {
          metrics[metric] = [];
        }
        metrics[metric].push({
          date: row.date,
          value: value
        });
      }
    });
  });

  // Calculate trends for each metric
  Object.keys(metrics).forEach(metric => {
    metrics[metric].sort((a, b) => new Date(a.date) - new Date(b.date));
    const values = metrics[metric].map(d => d.value);
    metrics[metric].trend = calculateTrend(values);
  });

  return metrics;
};

const calculateEngagementScore = (appUsage, communications) => {
  let score = 0;
  
  // App usage component (0-50 points)
  const totalEvents = appUsage.reduce((sum, app) => sum + parseInt(app.event_count), 0);
  const appScore = Math.min(50, totalEvents / 10); // 1 point per 10 events, max 50
  
  // Communication component (0-30 points)
  const totalComms = communications.reduce((sum, comm) => sum + parseInt(comm.count), 0);
  const commScore = Math.min(30, totalComms * 5); // 5 points per communication, max 30
  
  // Consistency component (0-20 points)
  const activeDays = appUsage.reduce((sum, app) => sum + parseInt(app.active_days), 0);
  const consistencyScore = Math.min(20, activeDays / 2); // 1 point per 2 active days, max 20
  
  score = appScore + commScore + consistencyScore;
  
  return {
    total: Math.round(score),
    breakdown: {
      appUsage: Math.round(appScore),
      communication: Math.round(commScore),
      consistency: Math.round(consistencyScore)
    }
  };
};

const calculateTrend = (values) => {
  if (values.length < 2) return 'insufficient_data';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (Math.abs(change) < 5) return 'stable';
  return change > 0 ? 'improving' : 'declining';
};

const analyzePatientImprovement = (events) => {
  // Simplified improvement analysis
  if (events.length < 2) return null;
  
  const firstEvent = events[0];
  const lastEvent = events[events.length - 1];
  
  // Look for improvement indicators in the data
  const improvements = {};
  
  if (firstEvent.data && lastEvent.data) {
    Object.keys(firstEvent.data).forEach(key => {
      if (typeof firstEvent.data[key] === 'number' && typeof lastEvent.data[key] === 'number') {
        const change = lastEvent.data[key] - firstEvent.data[key];
        const percentChange = (change / firstEvent.data[key]) * 100;
        
        improvements[key] = {
          initial: firstEvent.data[key],
          final: lastEvent.data[key],
          change: change,
          percentChange: percentChange
        };
      }
    });
  }
  
  return improvements;
};

const calculateAppEffectiveness = (events) => {
  // Simplified effectiveness calculation
  return {
    totalEvents: events.length,
    uniqueUsers: [...new Set(events.map(e => e.user_id))].length,
    averageEventsPerUser: events.length / [...new Set(events.map(e => e.user_id))].length
  };
};

const generatePatientSummaryStats = (patients) => {
  return {
    totalPatients: patients.length,
    averageEngagement: patients.reduce((sum, p) => sum + p.engagementScore.total, 0) / patients.length,
    totalCommunications: patients.reduce((sum, p) => sum + p.communications.reduce((s, c) => s + parseInt(c.count), 0), 0),
    mostUsedApps: {} // TODO: Calculate most used apps across all patients
  };
};

module.exports = {
  generatePatientReport,
  generatePopulationReport
};
