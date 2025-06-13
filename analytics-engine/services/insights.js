const moment = require('moment');
const stats = require('simple-statistics');

const db = require('../utils/database');
const logger = require('../utils/logger');

/**
 * Generate comprehensive user insights
 */
const generateUserInsights = async (userId, periodDays = 30) => {
  try {
    const startDate = moment().subtract(periodDays, 'days').toISOString();
    const endDate = moment().toISOString();

    // Get user's activity across all apps
    const activityQuery = `
      SELECT 
        ae.*,
        ar.app_name,
        ar.app_metadata
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.user_id = $1 
        AND ae.timestamp >= $2 
        AND ae.timestamp <= $3
      ORDER BY ae.timestamp
    `;

    const activityResult = await db.query(activityQuery, [userId, startDate, endDate]);
    const events = activityResult.rows;

    if (events.length === 0) {
      return {
        summary: { totalEvents: 0, message: 'No activity in the specified period' },
        apps: [],
        patterns: {},
        recommendations: []
      };
    }

    // Analyze app usage
    const appUsage = analyzeAppUsage(events);
    
    // Analyze behavioral patterns
    const patterns = analyzeBehavioralPatterns(events, periodDays);
    
    // Analyze health trends (if health data available)
    const healthTrends = analyzeHealthTrends(events);
    
    // Generate engagement metrics
    const engagement = analyzeEngagement(events, periodDays);
    
    // Generate recommendations
    const recommendations = generateUserRecommendations(appUsage, patterns, healthTrends, engagement);

    return {
      userId,
      period: { days: periodDays, startDate, endDate },
      summary: {
        totalEvents: events.length,
        uniqueApps: appUsage.length,
        activeDays: [...new Set(events.map(e => moment(e.timestamp).format('YYYY-MM-DD')))].length,
        avgDailyEvents: events.length / periodDays
      },
      apps: appUsage,
      patterns,
      healthTrends,
      engagement,
      recommendations
    };

  } catch (error) {
    logger.error('Generate user insights error:', error);
    throw error;
  }
};

/**
 * Generate app-specific insights
 */
const generateAppInsights = async (appName, periodDays = 30) => {
  try {
    const startDate = moment().subtract(periodDays, 'days').toISOString();
    const endDate = moment().toISOString();

    // Get app usage data
    const appQuery = `
      SELECT 
        ae.*,
        u.first_name,
        u.last_name
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      JOIN users u ON ae.user_id = u.id
      WHERE ar.app_name = $1 
        AND ae.timestamp >= $2 
        AND ae.timestamp <= $3
      ORDER BY ae.timestamp
    `;

    const appResult = await db.query(appQuery, [appName, startDate, endDate]);
    const events = appResult.rows;

    if (events.length === 0) {
      return {
        summary: { totalEvents: 0, message: 'No activity for this app in the specified period' },
        users: [],
        features: {},
        trends: {}
      };
    }

    // Analyze user engagement
    const userEngagement = analyzeAppUserEngagement(events);
    
    // Analyze feature usage
    const featureUsage = analyzeFeatureUsage(events);
    
    // Analyze usage trends
    const trends = analyzeAppTrends(events, periodDays);
    
    // Analyze user retention
    const retention = analyzeUserRetention(events, periodDays);

    return {
      appName,
      period: { days: periodDays, startDate, endDate },
      summary: {
        totalEvents: events.length,
        uniqueUsers: [...new Set(events.map(e => e.user_id))].length,
        avgEventsPerUser: events.length / [...new Set(events.map(e => e.user_id))].length,
        activeDays: [...new Set(events.map(e => moment(e.timestamp).format('YYYY-MM-DD')))].length
      },
      userEngagement,
      featureUsage,
      trends,
      retention
    };

  } catch (error) {
    logger.error('Generate app insights error:', error);
    throw error;
  }
};

/**
 * Generate trend analysis
 */
const generateTrendAnalysis = async (metric, period, granularity) => {
  try {
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[period];

    const startDate = moment().subtract(periodDays, 'days').toISOString();
    const endDate = moment().toISOString();

    let dateFormat, groupBy;
    switch (granularity) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        groupBy = "DATE_TRUNC('hour', ae.timestamp)";
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        groupBy = "DATE_TRUNC('day', ae.timestamp)";
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        groupBy = "DATE_TRUNC('week', ae.timestamp)";
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        groupBy = "DATE_TRUNC('month', ae.timestamp)";
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
        groupBy = "DATE_TRUNC('day', ae.timestamp)";
    }

    let query;
    switch (metric) {
      case 'users':
        query = `
          SELECT 
            ${groupBy} as period,
            COUNT(DISTINCT ae.user_id) as value
          FROM analytics_events ae
          WHERE ae.timestamp >= $1 AND ae.timestamp <= $2
          GROUP BY ${groupBy}
          ORDER BY period
        `;
        break;
      case 'events':
        query = `
          SELECT 
            ${groupBy} as period,
            COUNT(*) as value
          FROM analytics_events ae
          WHERE ae.timestamp >= $1 AND ae.timestamp <= $2
          GROUP BY ${groupBy}
          ORDER BY period
        `;
        break;
      case 'engagement':
        query = `
          SELECT 
            ${groupBy} as period,
            AVG(daily_score) as value
          FROM user_engagement_scores ues
          WHERE ues.last_activity >= $1 AND ues.last_activity <= $2
          GROUP BY ${groupBy}
          ORDER BY period
        `;
        break;
      default:
        throw new Error(`Unsupported metric: ${metric}`);
    }

    const result = await db.query(query, [startDate, endDate]);
    const data = result.rows.map(row => ({
      period: moment(row.period).format(dateFormat === 'YYYY-"W"WW' ? 'YYYY-[W]WW' : dateFormat),
      value: parseFloat(row.value) || 0
    }));

    // Calculate trend statistics
    const values = data.map(d => d.value);
    const trendStats = {
      mean: stats.mean(values),
      median: stats.median(values),
      standardDeviation: stats.standardDeviation(values),
      min: Math.min(...values),
      max: Math.max(...values),
      trend: calculateTrend(values)
    };

    return {
      data,
      statistics: trendStats
    };

  } catch (error) {
    logger.error('Generate trend analysis error:', error);
    throw error;
  }
};

/**
 * Analyze app usage patterns
 */
const analyzeAppUsage = (events) => {
  const appGroups = events.reduce((acc, event) => {
    if (!acc[event.app_name]) {
      acc[event.app_name] = [];
    }
    acc[event.app_name].push(event);
    return acc;
  }, {});

  return Object.entries(appGroups).map(([appName, appEvents]) => {
    const sessions = groupEventsBySessions(appEvents);
    const avgSessionDuration = sessions.length > 0 
      ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length 
      : 0;

    return {
      appName,
      eventCount: appEvents.length,
      sessionCount: sessions.length,
      avgSessionDuration: Math.round(avgSessionDuration),
      lastUsed: moment(Math.max(...appEvents.map(e => new Date(e.timestamp)))).fromNow(),
      mostUsedFeatures: getMostUsedFeatures(appEvents)
    };
  });
};

/**
 * Analyze behavioral patterns
 */
const analyzeBehavioralPatterns = (events, periodDays) => {
  const patterns = {};

  // Usage time patterns
  const hourlyUsage = events.reduce((acc, event) => {
    const hour = moment(event.timestamp).hour();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  patterns.peakUsageHours = Object.entries(hourlyUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }));

  // Daily patterns
  const dailyUsage = events.reduce((acc, event) => {
    const day = moment(event.timestamp).format('dddd');
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  patterns.weeklyPattern = dailyUsage;

  // Consistency score (how regularly the user engages)
  const activeDays = [...new Set(events.map(e => moment(e.timestamp).format('YYYY-MM-DD')))];
  patterns.consistencyScore = Math.round((activeDays.length / periodDays) * 100);

  return patterns;
};

/**
 * Analyze health trends from health-related events
 */
const analyzeHealthTrends = (events) => {
  const healthEvents = events.filter(e => e.event_type === 'health_data');
  
  if (healthEvents.length === 0) {
    return { available: false, message: 'No health data available' };
  }

  const trends = {};

  // Extract health metrics over time
  const healthMetrics = ['mood', 'energy', 'sleep', 'symptoms', 'pain'];
  
  healthMetrics.forEach(metric => {
    const metricData = healthEvents
      .map(e => ({
        date: moment(e.timestamp).format('YYYY-MM-DD'),
        value: e.event_data?.[metric]
      }))
      .filter(d => d.value !== undefined)
      .sort((a, b) => moment(a.date).diff(moment(b.date)));

    if (metricData.length > 0) {
      const values = metricData.map(d => d.value);
      trends[metric] = {
        current: values[values.length - 1],
        average: stats.mean(values),
        trend: calculateTrend(values),
        dataPoints: metricData.length
      };
    }
  });

  return { available: true, trends };
};

/**
 * Helper functions
 */
const groupEventsBySessions = (events) => {
  // Simple session grouping by time gaps > 30 minutes
  const sessions = [];
  let currentSession = null;

  events.forEach(event => {
    const eventTime = moment(event.timestamp);
    
    if (!currentSession || eventTime.diff(moment(currentSession.endTime), 'minutes') > 30) {
      currentSession = {
        startTime: event.timestamp,
        endTime: event.timestamp,
        events: [event]
      };
      sessions.push(currentSession);
    } else {
      currentSession.endTime = event.timestamp;
      currentSession.events.push(event);
    }
  });

  return sessions.map(session => ({
    ...session,
    duration: moment(session.endTime).diff(moment(session.startTime), 'seconds')
  }));
};

const getMostUsedFeatures = (events) => {
  const features = events.reduce((acc, event) => {
    acc[event.event_name] = (acc[event.event_name] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(features)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([feature, count]) => ({ feature, count }));
};

const calculateTrend = (values) => {
  if (values.length < 2) return 'insufficient_data';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = stats.mean(firstHalf);
  const secondAvg = stats.mean(secondHalf);
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (Math.abs(change) < 5) return 'stable';
  return change > 0 ? 'increasing' : 'decreasing';
};

module.exports = {
  generateUserInsights,
  generateAppInsights,
  generateTrendAnalysis
};
