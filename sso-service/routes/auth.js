const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const db = require('../utils/database');
const redis = require('../utils/redis');
const logger = require('../utils/logger');
const { generateTokens, verifyRefreshToken } = require('../utils/tokens');
const supabase = require('../utils/supabase');

const router = express.Router();

// User registration
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('firstName').trim().isLength({ min: 1, max: 100 }),
  body('lastName').trim().isLength({ min: 1, max: 100 }),
  body('phone').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, phone, dateOfBirth, gender } = req.body;

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const userResult = await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, phone, date_of_birth, gender)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name, last_name, created_at
    `, [email, passwordHash, firstName, lastName, phone, dateOfBirth, gender]);

    const user = userResult.rows[0];

    // Also create user in Supabase for consistency
    try {
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            ecosystem_user_id: user.id
          }
        }
      });

      if (supabaseError) {
        logger.warn('Supabase user creation failed:', supabaseError);
      }
    } catch (supabaseErr) {
      logger.warn('Supabase integration error:', supabaseErr);
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, {
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    });

    // Create session
    await db.query(`
      INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      user.id,
      accessToken,
      refreshToken,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      req.ip,
      req.get('User-Agent')
    ]);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// User login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const userResult = await db.query(`
      SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active,
             array_agg(
               json_build_object(
                 'name', ar.app_name,
                 'status', uas.subscription_status,
                 'tier', uas.subscription_tier
               )
             ) FILTER (WHERE ar.id IS NOT NULL) as apps
      FROM users u
      LEFT JOIN user_app_subscriptions uas ON u.id = uas.user_id
      LEFT JOIN app_registrations ar ON uas.app_id = ar.id
      WHERE u.email = $1
      GROUP BY u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active
    `, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = userResult.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id, {
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      apps: user.apps || []
    });

    // Create or update session
    await db.query(`
      INSERT INTO user_sessions (user_id, session_token, refresh_token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (session_token) 
      DO UPDATE SET 
        last_accessed = NOW(),
        ip_address = $5,
        user_agent = $6
    `, [
      user.id,
      accessToken,
      refreshToken,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      req.ip,
      req.get('User-Agent')
    ]);

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        apps: user.apps || []
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Token refresh
router.post('/refresh', [
  body('refreshToken').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'The refresh token is invalid or expired'
      });
    }

    // Check if session exists and is active
    const sessionResult = await db.query(`
      SELECT us.user_id, us.is_active, u.email, u.first_name, u.last_name, u.is_active as user_active
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.refresh_token = $1 AND us.expires_at > NOW()
    `, [refreshToken]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid session',
        message: 'Session not found or expired'
      });
    }

    const session = sessionResult.rows[0];

    if (!session.is_active || !session.user_active) {
      return res.status(401).json({
        error: 'Session inactive',
        message: 'Session or user account is inactive'
      });
    }

    // Get user's app subscriptions
    const appsResult = await db.query(`
      SELECT ar.app_name as name, uas.subscription_status as status, uas.subscription_tier as tier
      FROM user_app_subscriptions uas
      JOIN app_registrations ar ON uas.app_id = ar.id
      WHERE uas.user_id = $1 AND uas.subscription_status = 'active'
    `, [session.user_id]);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(session.user_id, {
      email: session.email,
      firstName: session.first_name,
      lastName: session.last_name,
      apps: appsResult.rows
    });

    // Update session with new tokens
    await db.query(`
      UPDATE user_sessions
      SET session_token = $1, refresh_token = $2, last_accessed = NOW()
      WHERE refresh_token = $3
    `, [accessToken, newRefreshToken, refreshToken]);

    res.json({
      message: 'Tokens refreshed successfully',
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing tokens'
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        error: 'No token provided',
        message: 'Authorization header with Bearer token is required'
      });
    }

    const token = authHeader.substring(7);

    // Deactivate session
    await db.query(
      'UPDATE user_sessions SET is_active = false WHERE session_token = $1',
      [token]
    );

    // Add token to Redis blacklist (optional, for extra security)
    try {
      await redis.setex(`blacklist:${token}`, 24 * 60 * 60, 'true'); // 24 hours
    } catch (redisError) {
      logger.warn('Redis blacklist error:', redisError);
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
});

module.exports = router;
