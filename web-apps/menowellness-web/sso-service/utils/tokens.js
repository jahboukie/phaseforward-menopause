const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  logger.error('JWT_SECRET environment variable is required');
  process.exit(1);
}

/**
 * Generate access and refresh tokens
 * @param {string} userId - User ID
 * @param {object} userData - Additional user data to include in token
 * @returns {object} - Object containing accessToken and refreshToken
 */
const generateTokens = async (userId, userData = {}) => {
  try {
    // Access token payload
    const accessTokenPayload = {
      userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      apps: userData.apps || [],
      role: userData.role || 'user',
      type: 'access'
    };

    // Refresh token payload (minimal data)
    const refreshTokenPayload = {
      userId,
      type: 'refresh'
    };

    // Generate access token
    const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'ecosystem-intelligence',
      audience: 'ecosystem-apps'
    });

    // Generate refresh token
    const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'ecosystem-intelligence',
      audience: 'ecosystem-apps'
    });

    return {
      accessToken,
      refreshToken
    };

  } catch (error) {
    logger.error('Token generation error:', error);
    throw new Error('Failed to generate tokens');
  }
};

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
const verifyAccessToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ecosystem-intelligence',
      audience: 'ecosystem-apps'
    });

    // Check if it's an access token
    if (decoded.type !== 'access') {
      logger.warn('Invalid token type for access token verification');
      return null;
    }

    return decoded;

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.info('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid access token');
    } else {
      logger.error('Access token verification error:', error);
    }
    return null;
  }
};

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {object|null} - Decoded token payload or null if invalid
 */
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ecosystem-intelligence',
      audience: 'ecosystem-apps'
    });

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      logger.warn('Invalid token type for refresh token verification');
      return null;
    }

    return decoded;

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.info('Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid refresh token');
    } else {
      logger.error('Refresh token verification error:', error);
    }
    return null;
  }
};

/**
 * Generate app API key
 * @param {string} appName - Application name
 * @returns {object} - Object containing appKey and appSecret
 */
const generateAppCredentials = (appName) => {
  try {
    // Generate app key (base64 encoded app name + random bytes)
    const appKeyData = `${appName}_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
    const appKey = Buffer.from(appKeyData).toString('base64').replace(/[+/=]/g, '');

    // Generate app secret (random 32 bytes)
    const appSecret = crypto.randomBytes(32).toString('hex');

    return {
      appKey,
      appSecret
    };

  } catch (error) {
    logger.error('App credentials generation error:', error);
    throw new Error('Failed to generate app credentials');
  }
};

/**
 * Generate secure session ID
 * @returns {string} - Secure session ID
 */
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash app secret for storage
 * @param {string} secret - App secret to hash
 * @returns {string} - Hashed secret
 */
const hashAppSecret = (secret) => {
  return crypto.createHash('sha256').update(secret).digest('hex');
};

/**
 * Verify app secret
 * @param {string} secret - Plain text secret
 * @param {string} hashedSecret - Hashed secret from database
 * @returns {boolean} - True if secrets match
 */
const verifyAppSecret = (secret, hashedSecret) => {
  const hashedInput = hashAppSecret(secret);
  return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hashedSecret));
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    logger.error('Token expiration extraction error:', error);
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  generateAppCredentials,
  generateSessionId,
  hashAppSecret,
  verifyAppSecret,
  extractTokenFromHeader,
  getTokenExpiration
};
