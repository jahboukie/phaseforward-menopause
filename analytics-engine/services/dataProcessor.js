const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const db = require('../utils/database');
const logger = require('../utils/logger');

/**
 * Process ingested data for insights and correlations
 */
const processDataIngestion = async (eventData) => {
  try {
    const { eventId, userId, appId, eventType, eventName, eventData: data, timestamp } = eventData;

    // Extract meaningful metrics from event data
    const metrics = extractMetrics(eventType, eventName, data);

    // Store processed metrics if any
    if (metrics && Object.keys(metrics).length > 0) {
      await storeProcessedMetrics(eventId, userId, appId, metrics, timestamp);
    }

    // Trigger real-time analysis for specific event types
    if (shouldTriggerRealTimeAnalysis(eventType, eventName)) {
      await triggerRealTimeAnalysis(userId, appId, eventType, eventName, data);
    }

    // Update user engagement scores
    await updateUserEngagement(userId, appId, eventType, timestamp);

    logger.debug(`Processed data ingestion for event ${eventId}`);

  } catch (error) {
    logger.error('Data processing error:', error);
    throw error;
  }
};

/**
 * Extract meaningful metrics from event data
 */
const extractMetrics = (eventType, eventName, data) => {
  const metrics = {};

  try {
    switch (eventType) {
      case 'user_interaction':
        metrics.interactionDuration = data.duration || 0;
        metrics.interactionType = data.type || 'unknown';
        metrics.screenTime = data.screenTime || 0;
        break;

      case 'health_data':
        metrics.symptomSeverity = data.severity || 0;
        metrics.moodScore = data.mood || 0;
        metrics.energyLevel = data.energy || 0;
        metrics.sleepQuality = data.sleep || 0;
        break;

      case 'ai_conversation':
        metrics.messageLength = data.message?.length || 0;
        metrics.sentimentScore = data.sentiment || 0;
        metrics.responseTime = data.responseTime || 0;
        metrics.conversationTurn = data.turn || 0;
        break;

      case 'treatment_progress':
        metrics.adherenceScore = data.adherence || 0;
        metrics.progressScore = data.progress || 0;
        metrics.sideEffects = data.sideEffects || 0;
        break;

      case 'relationship_data':
        metrics.supportLevel = data.support || 0;
        metrics.communicationQuality = data.communication || 0;
        metrics.intimacyScore = data.intimacy || 0;
        break;

      case 'session':
        metrics.sessionDuration = data.duration || 0;
        metrics.pagesViewed = data.pages || 0;
        metrics.featuresUsed = data.features?.length || 0;
        break;

      default:
        // Extract any numeric values from the data
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'number' && !isNaN(value)) {
            metrics[key] = value;
          }
        });
    }

    return metrics;

  } catch (error) {
    logger.warn('Metric extraction error:', error);
    return {};
  }
};

/**
 * Store processed metrics for analysis
 */
const storeProcessedMetrics = async (eventId, userId, appId, metrics, timestamp) => {
  try {
    // Store in a separate metrics table for faster analysis
    await db.query(`
      INSERT INTO analytics_metrics (
        event_id, user_id, app_id, metrics_data, timestamp
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (event_id) DO UPDATE SET
        metrics_data = $3,
        updated_at = NOW()
    `, [eventId, userId, appId, JSON.stringify(metrics), timestamp]);

  } catch (error) {
    logger.error('Store metrics error:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Check if event should trigger real-time analysis
 */
const shouldTriggerRealTimeAnalysis = (eventType, eventName) => {
  const realTimeEvents = [
    'health_crisis',
    'emergency_contact',
    'severe_symptoms',
    'medication_missed',
    'relationship_conflict',
    'suicidal_ideation',
    'relapse_risk'
  ];

  return realTimeEvents.includes(eventName) || 
         (eventType === 'health_data' && eventName.includes('severe'));
};

/**
 * Trigger real-time analysis for critical events
 */
const triggerRealTimeAnalysis = async (userId, appId, eventType, eventName, data) => {
  try {
    logger.info(`Triggering real-time analysis for ${eventType}/${eventName} - User: ${userId}`);

    // Get user's recent activity across all apps
    const recentActivity = await db.query(`
      SELECT ae.*, ar.app_name
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.user_id = $1 
        AND ae.timestamp >= NOW() - INTERVAL '24 hours'
      ORDER BY ae.timestamp DESC
      LIMIT 50
    `, [userId]);

    // Analyze patterns and generate alerts if needed
    const analysis = analyzeRealTimePatterns(recentActivity.rows, eventType, eventName, data);

    if (analysis.alertLevel > 0) {
      await generateAlert(userId, appId, analysis);
    }

  } catch (error) {
    logger.error('Real-time analysis error:', error);
  }
};

/**
 * Analyze real-time patterns for alerts
 */
const analyzeRealTimePatterns = (recentActivity, eventType, eventName, data) => {
  const analysis = {
    alertLevel: 0,
    patterns: [],
    recommendations: []
  };

  try {
    // Check for concerning patterns
    const healthEvents = recentActivity.filter(e => e.event_type === 'health_data');
    const aiConversations = recentActivity.filter(e => e.event_type === 'ai_conversation');

    // Pattern 1: Declining health metrics
    if (healthEvents.length >= 3) {
      const severityTrend = healthEvents
        .slice(0, 3)
        .map(e => e.event_data?.severity || 0);
      
      if (severityTrend.every((val, i) => i === 0 || val >= severityTrend[i - 1])) {
        analysis.alertLevel = Math.max(analysis.alertLevel, 2);
        analysis.patterns.push('Increasing symptom severity trend');
      }
    }

    // Pattern 2: Increased AI conversation frequency (potential distress)
    const recentConversations = aiConversations.filter(e => 
      moment(e.timestamp).isAfter(moment().subtract(2, 'hours'))
    );

    if (recentConversations.length > 5) {
      analysis.alertLevel = Math.max(analysis.alertLevel, 1);
      analysis.patterns.push('High frequency AI conversations');
    }

    // Pattern 3: Cross-app distress signals
    const distressApps = recentActivity.filter(e => 
      ['SoberPal', 'MyConfidant'].includes(e.app_name) &&
      moment(e.timestamp).isAfter(moment().subtract(1, 'hour'))
    );

    if (distressApps.length > 0 && eventType === 'health_data') {
      analysis.alertLevel = Math.max(analysis.alertLevel, 2);
      analysis.patterns.push('Cross-app distress indicators');
    }

    return analysis;

  } catch (error) {
    logger.error('Pattern analysis error:', error);
    return analysis;
  }
};

/**
 * Generate alert for concerning patterns
 */
const generateAlert = async (userId, appId, analysis) => {
  try {
    const alertId = uuidv4();

    await db.query(`
      INSERT INTO user_alerts (
        id, user_id, app_id, alert_level, patterns, recommendations, 
        created_at, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), true)
    `, [
      alertId,
      userId,
      appId,
      analysis.alertLevel,
      JSON.stringify(analysis.patterns),
      JSON.stringify(analysis.recommendations)
    ]);

    logger.warn(`Alert generated for user ${userId}: Level ${analysis.alertLevel}`);

  } catch (error) {
    logger.error('Alert generation error:', error);
  }
};

/**
 * Update user engagement scores
 */
const updateUserEngagement = async (userId, appId, eventType, timestamp) => {
  try {
    // Calculate engagement score based on event type and recency
    let engagementPoints = 1;

    switch (eventType) {
      case 'ai_conversation':
        engagementPoints = 3;
        break;
      case 'health_data':
        engagementPoints = 2;
        break;
      case 'treatment_progress':
        engagementPoints = 4;
        break;
      case 'user_interaction':
        engagementPoints = 1;
        break;
    }

    // Update or insert engagement score
    await db.query(`
      INSERT INTO user_engagement_scores (
        user_id, app_id, daily_score, weekly_score, last_activity, updated_at
      ) VALUES ($1, $2, $3, $3, $4, NOW())
      ON CONFLICT (user_id, app_id, DATE(last_activity))
      DO UPDATE SET
        daily_score = user_engagement_scores.daily_score + $3,
        weekly_score = user_engagement_scores.weekly_score + $3,
        last_activity = $4,
        updated_at = NOW()
    `, [userId, appId, engagementPoints, timestamp]);

  } catch (error) {
    logger.error('Engagement update error:', error);
  }
};

module.exports = {
  processDataIngestion,
  extractMetrics,
  shouldTriggerRealTimeAnalysis,
  triggerRealTimeAnalysis
};
