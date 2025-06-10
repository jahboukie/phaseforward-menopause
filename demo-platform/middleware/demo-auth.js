// Demo Platform Authentication Middleware
// Simplified auth for demo purposes - NOT for production use

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const DEMO_CREDENTIALS = {
  username: process.env.DEMO_USERNAME || 'demo@dralexai.com',
  password: process.env.DEMO_PASSWORD || 'DrAlexDemo2024!',
  role: 'enterprise-demo',
  provider: {
    id: 'demo-provider-001',
    name: 'Dr. Sarah Johnson',
    title: 'Chief Medical Officer', 
    hospital: 'Metropolitan Health System',
    email: 'demo@dralexai.com'
  }
};

// Hash the demo password (in production, this would be pre-hashed)
const hashedDemoPassword = bcrypt.hashSync(DEMO_CREDENTIALS.password, 10);

// Demo login function
function authenticateDemo(username, password) {
  if (username === DEMO_CREDENTIALS.username && 
      bcrypt.compareSync(password, hashedDemoPassword)) {
    
    const token = jwt.sign(
      { 
        username: DEMO_CREDENTIALS.username,
        role: DEMO_CREDENTIALS.role,
        provider: DEMO_CREDENTIALS.provider,
        isDemo: true,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hour expiry
      },
      process.env.JWT_SECRET || 'demo-jwt-secret'
    );
    
    return { 
      success: true, 
      token,
      provider: DEMO_CREDENTIALS.provider 
    };
  }
  
  return { success: false, message: 'Invalid demo credentials' };
}

// Middleware to verify demo token
function verifyDemoToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ 
      error: 'No demo token provided',
      isDemo: true,
      loginUrl: '/demo-login'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-jwt-secret');
    
    if (!decoded.isDemo) {
      return res.status(403).json({ 
        error: 'Invalid demo token',
        isDemo: true 
      });
    }
    
    req.demoUser = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired demo token',
      isDemo: true,
      loginUrl: '/demo-login'
    });
  }
}

// Optional demo auth - allows both authenticated and unauthenticated access
function optionalDemoAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-jwt-secret');
      if (decoded.isDemo) {
        req.demoUser = decoded;
      }
    } catch (error) {
      // Invalid token, but continue without auth for demo
      console.log('Demo: Invalid token, continuing without auth');
    }
  }
  
  // Always continue for demo platform
  next();
}

// Demo session middleware - adds demo context to all requests
function demoSession(req, res, next) {
  req.isDemo = true;
  req.demoMode = true;
  res.locals.isDemo = true;
  res.locals.demoWarning = 'DEMO ENVIRONMENT - All data is simulated';
  
  // Add demo headers
  res.setHeader('X-Demo-Mode', 'true');
  res.setHeader('X-Demo-Warning', 'Simulated data only');
  
  next();
}

// Generate demo token for direct access (bypasses login)
function generateDemoToken() {
  return jwt.sign(
    { 
      username: DEMO_CREDENTIALS.username,
      role: DEMO_CREDENTIALS.role,
      provider: DEMO_CREDENTIALS.provider,
      isDemo: true,
      directAccess: true,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    },
    process.env.JWT_SECRET || 'demo-jwt-secret'
  );
}

module.exports = {
  authenticateDemo,
  verifyDemoToken,
  optionalDemoAuth,
  demoSession,
  generateDemoToken,
  DEMO_CREDENTIALS: {
    username: DEMO_CREDENTIALS.username,
    // Don't expose password
    role: DEMO_CREDENTIALS.role,
    provider: DEMO_CREDENTIALS.provider
  }
};