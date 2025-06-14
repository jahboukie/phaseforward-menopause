const express = require('express');
const { body, query, validationResult } = require('express-validator');

const db = require('../utils/database');
const logger = require('../utils/logger');
const { 
  analyzeCorrelations, 
  getCorrelationResults, 
  generateRelationshipInsights 
} = require('../services/correlation');

const router = express.Router();

// Start correlation analysis
router.post('/analyze', [
  body('analysisType').isIn(['user_behavior', 'app_usage', 'health_outcomes', 'relationship_patterns']).withMessage('Invalid analysis type'),
  body('timeframe').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid timeframe'),
  body('apps').optional().isArray().withMessage('Apps must be an array'),
  body('userSegment').optional().isObject().withMessage('User segment must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      analysisType,
      timeframe = '30d',
      apps = [],
      userSegment = {},
      parameters = {}
    } = req.body;

    // Start correlation analysis
    const analysisId = await analyzeCorrelations({
      analysisType,
      timeframe,
      apps,
      userSegment,
      parameters
    });

    logger.info(`Correlation analysis started: ${analysisId} (${analysisType})`);

    res.status(202).json({
      message: 'Correlation analysis started',
      analysisId,
      analysisType,
      timeframe,
      estimatedCompletionTime: '5-15 minutes',
      status: 'processing'
    });

  } catch (error) {
    logger.error('Correlation analysis start error:', error);
    res.status(500).json({
      error: 'Failed to start correlation analysis',
      message: 'An error occurred while starting the analysis'
    });
  }
});

// Get correlation analysis results
router.get('/results/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;

    const results = await getCorrelationResults(analysisId);

    if (!results) {
      return res.status(404).json({
        error: 'Analysis not found',
        message: 'The specified analysis ID was not found'
      });
    }

    res.json({
      analysisId,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get correlation results error:', error);
    res.status(500).json({
      error: 'Failed to retrieve correlation results',
      message: 'An error occurred while fetching results'
    });
  }
});

// Get relationship insights between apps
router.get('/relationships', [
  query('app1').isLength({ min: 1 }).withMessage('First app name required'),
  query('app2').isLength({ min: 1 }).withMessage('Second app name required'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { app1, app2, period = '30d' } = req.query;

    const insights = await generateRelationshipInsights(app1, app2, period);

    res.json({
      apps: [app1, app2],
      period,
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Relationship insights error:', error);
    res.status(500).json({
      error: 'Failed to generate relationship insights',
      message: 'An error occurred while analyzing app relationships'
    });
  }
});

// Get cross-app user patterns
router.get('/patterns/users', [
  query('minApps').optional().isInt({ min: 2, max: 10 }).withMessage('Min apps must be between 2 and 10'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { minApps = 2, period = '30d' } = req.query;

    // Convert period to days
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[period];

    // Find users who use multiple apps
    const multiAppUsersQuery = `
      SELECT 
        ae.user_id,
        array_agg(DISTINCT ar.app_name) as apps,
        COUNT(DISTINCT ar.app_name) as app_count,
        COUNT(*) as total_events,
        MIN(ae.timestamp) as first_event,
        MAX(ae.timestamp) as last_event
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.timestamp >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY ae.user_id
      HAVING COUNT(DISTINCT ar.app_name) >= $1
      ORDER BY app_count DESC, total_events DESC
      LIMIT 100
    `;

    const multiAppUsersResult = await db.query(multiAppUsersQuery, [minApps]);

    // Analyze common app combinations
    const appCombinations = {};
    multiAppUsersResult.rows.forEach(user => {
      const apps = user.apps.sort();
      for (let i = 0; i < apps.length; i++) {
        for (let j = i + 1; j < apps.length; j++) {
          const combination = `${apps[i]} + ${apps[j]}`;
          appCombinations[combination] = (appCombinations[combination] || 0) + 1;
        }
      }
    });

    // Get usage patterns for multi-app users
    const usagePatternsQuery = `
      SELECT 
        ar.app_name,
        COUNT(DISTINCT ae.user_id) as unique_users,
        AVG(daily_events.event_count) as avg_daily_events,
        AVG(EXTRACT(EPOCH FROM (session_end - session_start))) as avg_session_duration
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      JOIN (
        SELECT user_id FROM analytics_events 
        WHERE timestamp >= NOW() - INTERVAL '${periodDays} days'
        GROUP BY user_id 
        HAVING COUNT(DISTINCT app_id) >= $1
      ) multi_users ON ae.user_id = multi_users.user_id
      LEFT JOIN (
        SELECT 
          user_id, 
          app_id, 
          DATE(timestamp) as date,
          COUNT(*) as event_count
        FROM analytics_events 
        WHERE timestamp >= NOW() - INTERVAL '${periodDays} days'
        GROUP BY user_id, app_id, DATE(timestamp)
      ) daily_events ON ae.user_id = daily_events.user_id AND ae.app_id = daily_events.app_id
      LEFT JOIN (
        SELECT 
          user_id, 
          app_id, 
          session_id,
          MIN(timestamp) as session_start,
          MAX(timestamp) as session_end
        FROM analytics_events 
        WHERE timestamp >= NOW() - INTERVAL '${periodDays} days'
        GROUP BY user_id, app_id, session_id
      ) sessions ON ae.user_id = sessions.user_id AND ae.app_id = sessions.app_id
      WHERE ae.timestamp >= NOW() - INTERVAL '${periodDays} days'
      GROUP BY ar.app_name
      ORDER BY unique_users DESC
    `;

    const usagePatternsResult = await db.query(usagePatternsQuery, [minApps]);

    res.json({
      period,
      minApps: parseInt(minApps),
      summary: {
        totalMultiAppUsers: multiAppUsersResult.rows.length,
        avgAppsPerUser: multiAppUsersResult.rows.reduce((sum, user) => sum + user.app_count, 0) / multiAppUsersResult.rows.length
      },
      multiAppUsers: multiAppUsersResult.rows.map(user => ({
        userId: user.user_id,
        apps: user.apps,
        appCount: parseInt(user.app_count),
        totalEvents: parseInt(user.total_events),
        firstEvent: user.first_event,
        lastEvent: user.last_event
      })),
      commonCombinations: Object.entries(appCombinations)
        .map(([combination, count]) => ({ combination, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      usagePatterns: usagePatternsResult.rows.map(pattern => ({
        appName: pattern.app_name,
        uniqueUsers: parseInt(pattern.unique_users),
        avgDailyEvents: parseFloat(pattern.avg_daily_events) || 0,
        avgSessionDuration: parseFloat(pattern.avg_session_duration) || 0
      }))
    });

  } catch (error) {
    logger.error('User patterns error:', error);
    res.status(500).json({
      error: 'Failed to analyze user patterns',
      message: 'An error occurred while analyzing cross-app user patterns'
    });
  }
});

// Get health outcome correlations (for provider insights)
router.get('/health-outcomes', [
  query('outcome').isLength({ min: 1 }).withMessage('Health outcome required'),
  query('period').optional().isIn(['30d', '90d', '6m', '1y']).withMessage('Invalid period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { outcome, period = '90d' } = req.query;

    // This would analyze correlations between app usage and health outcomes
    // For now, we'll return a placeholder structure
    const correlations = {
      outcome,
      period,
      correlations: [
        {
          factor: 'Daily app engagement',
          correlation: 0.73,
          significance: 0.001,
          description: 'Higher daily engagement correlates with improved outcomes'
        },
        {
          factor: 'Cross-app usage',
          correlation: 0.68,
          significance: 0.005,
          description: 'Users of multiple apps show better outcomes'
        },
        {
          factor: 'Partner app usage',
          correlation: 0.82,
          significance: 0.0001,
          description: 'Partner support app usage strongly correlates with outcomes'
        }
      ],
      sampleSize: 1247,
      confidenceLevel: 0.95
    };

    res.json({
      outcome,
      period,
      analysis: correlations,
      timestamp: new Date().toISOString(),
      note: 'This is a placeholder for health outcome correlation analysis'
    });

  } catch (error) {
    logger.error('Health outcomes correlation error:', error);
    res.status(500).json({
      error: 'Failed to analyze health outcome correlations',
      message: 'An error occurred while analyzing health outcomes'
    });
  }
});

module.exports = router;
