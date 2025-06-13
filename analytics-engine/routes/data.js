const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../utils/database');
const logger = require('../utils/logger');
const { processDataIngestion } = require('../services/dataProcessor');

const router = express.Router();

// Data ingestion endpoint
router.post('/ingest', [
  body('userId').isUUID().withMessage('Valid user ID required'),
  body('appName').isLength({ min: 1 }).withMessage('App name required'),
  body('eventType').isLength({ min: 1 }).withMessage('Event type required'),
  body('eventName').isLength({ min: 1 }).withMessage('Event name required'),
  body('eventData').isObject().withMessage('Event data must be an object'),
  body('timestamp').optional().isISO8601().withMessage('Invalid timestamp format')
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
      userId,
      appName,
      eventType,
      eventName,
      eventData,
      sessionId,
      timestamp
    } = req.body;

    // Get app ID from app name
    const appResult = await db.query(
      'SELECT id FROM app_registrations WHERE app_name = $1 AND is_active = true',
      [appName]
    );

    if (appResult.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid app name',
        message: `App '${appName}' not found or inactive`
      });
    }

    const appId = appResult.rows[0].id;

    // Insert analytics event
    const eventResult = await db.query(`
      INSERT INTO analytics_events (
        user_id, app_id, event_type, event_name, event_data, 
        session_id, timestamp, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, timestamp
    `, [
      userId,
      appId,
      eventType,
      eventName,
      JSON.stringify(eventData),
      sessionId,
      timestamp ? new Date(timestamp) : new Date(),
      req.ip,
      req.get('User-Agent')
    ]);

    const event = eventResult.rows[0];

    // Process data asynchronously for insights
    processDataIngestion({
      eventId: event.id,
      userId,
      appId,
      eventType,
      eventName,
      eventData,
      timestamp: event.timestamp
    }).catch(error => {
      logger.error('Data processing error:', error);
    });

    logger.info(`Data ingested: ${eventType}/${eventName} for user ${userId} from ${appName}`);

    res.status(201).json({
      message: 'Data ingested successfully',
      eventId: event.id,
      timestamp: event.timestamp
    });

  } catch (error) {
    logger.error('Data ingestion error:', error);
    res.status(500).json({
      error: 'Data ingestion failed',
      message: 'An error occurred while processing the data'
    });
  }
});

// Batch data ingestion
router.post('/ingest/batch', [
  body('events').isArray({ min: 1, max: 100 }).withMessage('Events array required (max 100)'),
  body('events.*.userId').isUUID().withMessage('Valid user ID required for each event'),
  body('events.*.appName').isLength({ min: 1 }).withMessage('App name required for each event'),
  body('events.*.eventType').isLength({ min: 1 }).withMessage('Event type required for each event'),
  body('events.*.eventName').isLength({ min: 1 }).withMessage('Event name required for each event'),
  body('events.*.eventData').isObject().withMessage('Event data must be an object for each event')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { events } = req.body;
    const results = [];
    const failed = [];

    // Process events in batches
    for (const event of events) {
      try {
        // Get app ID
        const appResult = await db.query(
          'SELECT id FROM app_registrations WHERE app_name = $1 AND is_active = true',
          [event.appName]
        );

        if (appResult.rows.length === 0) {
          failed.push({
            event,
            error: `App '${event.appName}' not found or inactive`
          });
          continue;
        }

        const appId = appResult.rows[0].id;

        // Insert event
        const eventResult = await db.query(`
          INSERT INTO analytics_events (
            user_id, app_id, event_type, event_name, event_data, 
            session_id, timestamp, ip_address, user_agent
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, timestamp
        `, [
          event.userId,
          appId,
          event.eventType,
          event.eventName,
          JSON.stringify(event.eventData),
          event.sessionId,
          event.timestamp ? new Date(event.timestamp) : new Date(),
          req.ip,
          req.get('User-Agent')
        ]);

        results.push({
          eventId: eventResult.rows[0].id,
          timestamp: eventResult.rows[0].timestamp
        });

      } catch (eventError) {
        logger.error('Batch event processing error:', eventError);
        failed.push({
          event,
          error: eventError.message
        });
      }
    }

    logger.info(`Batch ingestion: ${results.length} successful, ${failed.length} failed`);

    res.status(201).json({
      message: 'Batch ingestion completed',
      successful: results.length,
      failed: failed.length,
      results,
      failures: failed
    });

  } catch (error) {
    logger.error('Batch ingestion error:', error);
    res.status(500).json({
      error: 'Batch ingestion failed',
      message: 'An error occurred while processing the batch'
    });
  }
});

// Get events for a user
router.get('/events/user/:userId', [
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('appName').optional().isLength({ min: 1 }).withMessage('Invalid app name'),
  query('eventType').optional().isLength({ min: 1 }).withMessage('Invalid event type'),
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
      limit = 100,
      offset = 0,
      appName,
      eventType,
      startDate,
      endDate
    } = req.query;

    let query = `
      SELECT ae.id, ae.event_type, ae.event_name, ae.event_data, ae.timestamp,
             ar.app_name, ae.session_id
      FROM analytics_events ae
      JOIN app_registrations ar ON ae.app_id = ar.id
      WHERE ae.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    // Add filters
    if (appName) {
      query += ` AND ar.app_name = $${paramIndex}`;
      params.push(appName);
      paramIndex++;
    }

    if (eventType) {
      query += ` AND ae.event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND ae.timestamp >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND ae.timestamp <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY ae.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    res.json({
      events: result.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.rows.length
      }
    });

  } catch (error) {
    logger.error('Get user events error:', error);
    res.status(500).json({
      error: 'Failed to retrieve events',
      message: 'An error occurred while fetching user events'
    });
  }
});

module.exports = router;
