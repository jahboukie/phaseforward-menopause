const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const db = require('../utils/database');
const redis = require('../utils/redis');
const logger = require('../utils/logger');

const router = express.Router();

// Validate JWT token
router.get('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        valid: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Check if token is blacklisted
    try {
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          valid: false,
          error: 'Token has been revoked'
        });
      }
    } catch (redisError) {
      logger.warn('Redis blacklist check error:', redisError);
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        valid: false,
        error: 'Invalid or expired token'
      });
    }

    // Check if session exists and is active
    const sessionResult = await db.query(`
      SELECT us.user_id, us.is_active, us.expires_at,
             u.email, u.first_name, u.last_name, u.is_active as user_active
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_token = $1
    `, [token]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        valid: false,
        error: 'Session not found'
      });
    }

    const session = sessionResult.rows[0];

    // Check if session is active and not expired
    if (!session.is_active || !session.user_active || new Date() > session.expires_at) {
      return res.status(401).json({
        valid: false,
        error: 'Session inactive or expired'
      });
    }

    // Get user's app subscriptions
    const appsResult = await db.query(`
      SELECT ar.app_name as name, uas.subscription_status as status, 
             uas.subscription_tier as tier, ar.app_metadata
      FROM user_app_subscriptions uas
      JOIN app_registrations ar ON uas.app_id = ar.id
      WHERE uas.user_id = $1 AND uas.subscription_status = 'active'
    `, [session.user_id]);

    // Update last accessed time
    await db.query(
      'UPDATE user_sessions SET last_accessed = NOW() WHERE session_token = $1',
      [token]
    );

    res.json({
      valid: true,
      user: {
        id: session.user_id,
        email: session.email,
        firstName: session.first_name,
        lastName: session.last_name,
        apps: appsResult.rows
      },
      appContext: {
        availableApps: appsResult.rows.map(app => ({
          name: app.name,
          status: app.status,
          tier: app.tier,
          metadata: app.app_metadata
        }))
      }
    });

  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Validation service error'
    });
  }
});

// Validate app key (for service-to-service communication)
router.post('/validate-app', [
  body('appKey').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        valid: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { appKey } = req.body;

    // Find app by key
    const appResult = await db.query(`
      SELECT id, app_name, api_endpoint, is_active, app_metadata
      FROM app_registrations
      WHERE app_key = $1 AND is_active = true
    `, [appKey]);

    if (appResult.rows.length === 0) {
      return res.status(401).json({
        valid: false,
        error: 'Invalid app key'
      });
    }

    const app = appResult.rows[0];

    res.json({
      valid: true,
      app: {
        id: app.id,
        name: app.app_name,
        endpoint: app.api_endpoint,
        metadata: app.app_metadata
      }
    });

  } catch (error) {
    logger.error('App key validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'App validation service error'
    });
  }
});

// Validate user access to specific app
router.post('/validate-app-access', [
  body('userId').isUUID(),
  body('appName').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        valid: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId, appName } = req.body;

    // Check user's access to the app
    const accessResult = await db.query(`
      SELECT uas.subscription_status, uas.subscription_tier, ar.app_name, ar.app_metadata
      FROM user_app_subscriptions uas
      JOIN app_registrations ar ON uas.app_id = ar.id
      WHERE uas.user_id = $1 AND ar.app_name = $2
    `, [userId, appName]);

    if (accessResult.rows.length === 0) {
      return res.json({
        valid: false,
        hasAccess: false,
        reason: 'No subscription found'
      });
    }

    const access = accessResult.rows[0];

    const hasActiveAccess = access.subscription_status === 'active';

    res.json({
      valid: true,
      hasAccess: hasActiveAccess,
      subscription: {
        status: access.subscription_status,
        tier: access.subscription_tier,
        appMetadata: access.app_metadata
      }
    });

  } catch (error) {
    logger.error('App access validation error:', error);
    res.status(500).json({
      valid: false,
      error: 'Access validation service error'
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);

    // Verify token first
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    // Get user profile
    const userResult = await db.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth, 
             u.gender, u.created_at, u.last_login, u.profile_data,
             array_agg(
               json_build_object(
                 'name', ar.app_name,
                 'status', uas.subscription_status,
                 'tier', uas.subscription_tier,
                 'startedAt', uas.started_at
               )
             ) FILTER (WHERE ar.id IS NOT NULL) as apps
      FROM users u
      LEFT JOIN user_app_subscriptions uas ON u.id = uas.user_id
      LEFT JOIN app_registrations ar ON uas.app_id = ar.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        profileData: user.profile_data,
        apps: user.apps || []
      }
    });

  } catch (error) {
    logger.error('Profile retrieval error:', error);
    res.status(500).json({
      error: 'Profile service error'
    });
  }
});

module.exports = router;
