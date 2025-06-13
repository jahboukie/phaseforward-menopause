const express = require('express');
const { query, validationResult } = require('express-validator');
const moment = require('moment');

const db = require('../utils/database');
const logger = require('../utils/logger');
const { generateUserInsights, generateAppInsights, generateTrendAnalysis } = require('../services/insights');

const router = express.Router();

// Get insights summary
router.get('/summary', async (req, res) => {
  try {
    // Get overall platform metrics
    const metricsQuery = `
      SELECT 
        COUNT(DISTINCT ae.user_id) as active_users,
        COUNT(DISTINCT ae.app_id) as active_apps,
        COUNT(*) as total_events,
        COUNT(DISTINCT DATE(ae.timestamp)) as active_days
      FROM analytics_events ae
      WHERE ae.timestamp >= NOW() - INTERVAL '30 days'
    `;

    const metricsResult = await db.query(metricsQuery);
    const metrics = metricsResult.rows[0];

    // Get app usage breakdown
    const appUsageQuery = `
      SELECT 
        ar.app_name,
        COUNT(*) as event_count,
        COUNT(DISTINCT ae.user_id) as unique_users,
        AVG(EXTRACT(EPOCH FROM (MAX(ae.timestamp) - MIN(ae.timestamp)))) as avg_session_duration
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY ar.app_name, ar.id
      ORDER BY event_count DESC
    `;

    const appUsageResult = await db.query(appUsageQuery);

    // Get user engagement trends
    const engagementQuery = `
      SELECT 
        DATE(ae.timestamp) as date,
        COUNT(DISTINCT ae.user_id) as daily_active_users,
        COUNT(*) as daily_events
      FROM analytics_events ae
      WHERE ae.timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(ae.timestamp)
      ORDER BY date DESC
      LIMIT 30
    `;

    const engagementResult = await db.query(engagementQuery);

    res.json({
      summary: {
        activeUsers: parseInt(metrics.active_users),
        activeApps: parseInt(metrics.active_apps),
        totalEvents: parseInt(metrics.total_events),
        activeDays: parseInt(metrics.active_days),
        period: '30 days'
      },
      appUsage: appUsageResult.rows.map(row => ({
        appName: row.app_name,
        eventCount: parseInt(row.event_count),
        uniqueUsers: parseInt(row.unique_users),
        avgSessionDuration: parseFloat(row.avg_session_duration) || 0
      })),
      engagement: engagementResult.rows.map(row => ({
        date: row.date,
        dailyActiveUsers: parseInt(row.daily_active_users),
        dailyEvents: parseInt(row.daily_events)
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Insights summary error:', error);
    res.status(500).json({
      error: 'Failed to generate insights summary',
      message: 'An error occurred while generating insights'
    });
  }
});

// Get user-specific insights
router.get('/user/:userId', [
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

    const { userId } = req.params;
    const { period = '30d' } = req.query;

    // Convert period to days
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[period];

    const insights = await generateUserInsights(userId, periodDays);

    res.json({
      userId,
      period,
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('User insights error:', error);
    res.status(500).json({
      error: 'Failed to generate user insights',
      message: 'An error occurred while generating user insights'
    });
  }
});

// Get app-specific insights
router.get('/app/:appName', [
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

    const { appName } = req.params;
    const { period = '30d' } = req.query;

    // Convert period to days
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[period];

    const insights = await generateAppInsights(appName, periodDays);

    res.json({
      appName,
      period,
      insights,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('App insights error:', error);
    res.status(500).json({
      error: 'Failed to generate app insights',
      message: 'An error occurred while generating app insights'
    });
  }
});

// Get trend analysis
router.get('/trends', [
  query('metric').optional().isIn(['users', 'events', 'engagement', 'retention']).withMessage('Invalid metric'),
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
  query('granularity').optional().isIn(['hour', 'day', 'week', 'month']).withMessage('Invalid granularity')
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
      metric = 'users',
      period = '30d',
      granularity = 'day'
    } = req.query;

    const trends = await generateTrendAnalysis(metric, period, granularity);

    res.json({
      metric,
      period,
      granularity,
      trends,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Trend analysis error:', error);
    res.status(500).json({
      error: 'Failed to generate trend analysis',
      message: 'An error occurred while generating trends'
    });
  }
});

// Get cross-app user journey
router.get('/journey/:userId', [
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;
    const {
      startDate = moment().subtract(30, 'days').toISOString(),
      endDate = moment().toISOString()
    } = req.query;

    // Get user's cross-app journey
    const journeyQuery = `
      SELECT 
        ae.timestamp,
        ar.app_name,
        ae.event_type,
        ae.event_name,
        ae.event_data,
        ae.session_id,
        LAG(ar.app_name) OVER (ORDER BY ae.timestamp) as previous_app,
        LEAD(ar.app_name) OVER (ORDER BY ae.timestamp) as next_app
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.user_id = $1 
        AND ae.timestamp >= $2 
        AND ae.timestamp <= $3
      ORDER BY ae.timestamp
    `;

    const journeyResult = await db.query(journeyQuery, [userId, startDate, endDate]);

    // Analyze app transitions
    const transitions = {};
    journeyResult.rows.forEach(event => {
      if (event.previous_app && event.previous_app !== event.app_name) {
        const transition = `${event.previous_app} → ${event.app_name}`;
        transitions[transition] = (transitions[transition] || 0) + 1;
      }
    });

    // Calculate session information
    const sessions = {};
    journeyResult.rows.forEach(event => {
      if (!sessions[event.session_id]) {
        sessions[event.session_id] = {
          sessionId: event.session_id,
          appName: event.app_name,
          startTime: event.timestamp,
          endTime: event.timestamp,
          eventCount: 0
        };
      }
      sessions[event.session_id].endTime = event.timestamp;
      sessions[event.session_id].eventCount++;
    });

    res.json({
      userId,
      period: { startDate, endDate },
      journey: journeyResult.rows,
      transitions: Object.entries(transitions).map(([transition, count]) => ({
        transition,
        count
      })).sort((a, b) => b.count - a.count),
      sessions: Object.values(sessions),
      summary: {
        totalEvents: journeyResult.rows.length,
        uniqueApps: [...new Set(journeyResult.rows.map(e => e.app_name))].length,
        totalSessions: Object.keys(sessions).length
      }
    });

  } catch (error) {
    logger.error('User journey error:', error);
    res.status(500).json({
      error: 'Failed to generate user journey',
      message: 'An error occurred while analyzing user journey'
    });
  }
});

module.exports = router;
