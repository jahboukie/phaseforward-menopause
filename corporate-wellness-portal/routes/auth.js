/**
 * Corporate Wellness Portal - Authentication Routes
 * Enterprise authentication with SSO support
 */

import express from 'express';
// Use global mock logger for demo
const logger = global.mockLogger || console;

// Mock functions for demo
const generateToken = (user, tenantId) => {
  return `demo_token_${user.id}_${tenantId}_${Date.now()}`;
};
const database = {};
const encryptionService = {};

const router = express.Router();

/**
 * POST /api/auth/demo-login
 * Demo login for showcasing the platform
 */
router.post('/demo-login', async (req, res) => {
  try {
    // Create demo user session for presentation purposes
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@ecosystem-intelligence.com',
      role: 'admin',
      name: 'Demo User'
    };
    
    const demoTenant = {
      id: 'demo-tenant-123',
      name: 'Fortune 500 Demo Company',
      tier: 'enterprise'
    };
    
    // Generate demo token
    const token = generateToken(demoUser, demoTenant.id);
    
    logger.info('Demo login successful', {
      userId: demoUser.id,
      tenantId: demoTenant.id,
      requestId: req.id
    });
    
    res.json({
      success: true,
      token,
      user: demoUser,
      tenant: demoTenant,
      message: '🚀 Welcome to the Corporate Wellness Portal Demo',
      features: [
        'Real-time analytics dashboard',
        'Population health intelligence',
        'Predictive health forecasting',
        'ROI analysis and projections',
        'Integration with Dr. Alex AI',
        'SentimentAsAService correlation'
      ]
    });
    
  } catch (error) {
    logger.error('Demo login failed', {
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      success: false,
      error: 'Demo login failed',
      requestId: req.id
    });
  }
});

/**
 * POST /api/auth/login
 * Standard email/password login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, tenantDomain } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        requestId: req.id
      });
    }
    
    // For demo purposes, accept any login with demo credentials
    if (email.includes('demo') || email.includes('test')) {
      const demoUser = {
        id: `user-${Date.now()}`,
        email: email,
        role: 'admin',
        name: 'Demo User'
      };
      
      const demoTenant = {
        id: `tenant-${Date.now()}`,
        name: 'Demo Corporation',
        tier: 'enterprise'
      };
      
      const token = generateToken(demoUser, demoTenant.id);
      
      return res.json({
        success: true,
        token,
        user: demoUser,
        tenant: demoTenant,
        message: 'Login successful'
      });
    }
    
    // In production, this would validate against the database
    logger.warn('Login attempt with non-demo credentials', {
      email,
      tenantDomain,
      requestId: req.id
    });
    
    res.status(401).json({
      error: 'Invalid credentials. Use demo credentials for presentation.',
      requestId: req.id
    });
    
  } catch (error) {
    logger.error('Login failed', {
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Login failed',
      requestId: req.id
    });
  }
});

/**
 * POST /api/auth/register
 * User registration (for demo purposes)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName, firstName, lastName } = req.body;
    
    if (!email || !password || !companyName) {
      return res.status(400).json({
        error: 'Email, password, and company name are required',
        requestId: req.id
      });
    }
    
    // Create demo user and tenant
    const newUser = {
      id: `user-${Date.now()}`,
      email: email,
      role: 'admin',
      name: `${firstName} ${lastName}`,
      firstName,
      lastName
    };
    
    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: companyName,
      tier: 'startup',
      domain: email.split('@')[1]
    };
    
    const token = generateToken(newUser, newTenant.id);
    
    logger.info('Demo registration successful', {
      userId: newUser.id,
      tenantId: newTenant.id,
      companyName,
      requestId: req.id
    });
    
    res.status(201).json({
      success: true,
      token,
      user: newUser,
      tenant: newTenant,
      message: '🎉 Welcome to Corporate Wellness Portal!',
      nextSteps: [
        'Complete your company profile',
        'Upload employee data for onboarding',
        'Configure wellness programs',
        'Start analyzing population health'
      ]
    });
    
  } catch (error) {
    logger.error('Registration failed', {
      error: error.message,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Registration failed',
      requestId: req.id
    });
  }
});

/**
 * POST /api/auth/logout
 * User logout
 */
router.post('/logout', (req, res) => {
  // In a real implementation, this would invalidate the token
  logger.info('User logout', {
    userId: req.user?.id,
    tenantId: req.user?.tenantId,
    requestId: req.id
  });
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Not authenticated',
      requestId: req.id
    });
  }
  
  res.json({
    success: true,
    user: req.user,
    tenant: req.tenant
  });
});

/**
 * POST /api/auth/refresh
 * Refresh authentication token
 */
router.post('/refresh', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Not authenticated',
      requestId: req.id
    });
  }
  
  try {
    const newToken = generateToken(req.user, req.user.tenantId);
    
    res.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    logger.error('Token refresh failed', {
      error: error.message,
      userId: req.user.id,
      requestId: req.id
    });
    
    res.status(500).json({
      error: 'Token refresh failed',
      requestId: req.id
    });
  }
});

/**
 * GET /api/auth/csrf-token
 * Get CSRF token for forms
 */
router.get('/csrf-token', (req, res) => {
  const csrfToken = require('crypto').randomBytes(32).toString('hex');
  
  // Store in session for validation
  req.session.csrfToken = csrfToken;
  
  res.json({
    csrfToken,
    requestId: req.id
  });
});

export default router;