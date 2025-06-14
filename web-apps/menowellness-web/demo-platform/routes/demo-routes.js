// Demo Platform API Routes
// Handles all demo-specific endpoints with mock data

const express = require('express');
const router = express.Router();
const { authenticateDemo, verifyDemoToken, optionalDemoAuth, generateDemoToken } = require('../middleware/demo-auth');
const { 
  DEMO_PROVIDER, 
  DEMO_PATIENTS, 
  DEMO_AI_RESPONSES, 
  DEMO_METRICS, 
  DEMO_USAGE,
  DEMO_ALERTS
} = require('../data/demo-data');

// Demo login endpoint
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('🎭 Demo login attempt:', username);
  
  const result = authenticateDemo(username, password);
  
  if (result.success) {
    res.json({
      success: true,
      token: result.token,
      provider: result.provider,
      isDemo: true,
      message: 'Demo authentication successful'
    });
  } else {
    res.status(401).json({
      success: false,
      message: result.message,
      isDemo: true,
      hint: 'Use demo@dralexai.com / DrAlexDemo2024!'
    });
  }
});

// Generate direct demo access token
router.get('/auth/direct-access', (req, res) => {
  const token = generateDemoToken();
  res.json({
    success: true,
    token,
    provider: DEMO_PROVIDER,
    isDemo: true,
    message: 'Direct demo access granted',
    expiresIn: '24 hours'
  });
});

// Verify demo token
router.get('/auth/verify', verifyDemoToken, (req, res) => {
  res.json({
    valid: true,
    isDemo: true,
    user: req.demoUser,
    message: 'Demo token is valid'
  });
});

// Demo provider profile
router.get('/provider/profile', optionalDemoAuth, (req, res) => {
  res.json({
    provider: DEMO_PROVIDER,
    isDemo: true,
    demoMode: true
  });
});

// Demo patients list
router.get('/patients', optionalDemoAuth, (req, res) => {
  res.json({
    patients: DEMO_PATIENTS,
    total: DEMO_PATIENTS.length,
    isDemo: true,
    lastUpdated: new Date().toISOString()
  });
});

// Individual demo patient
router.get('/patients/:id', optionalDemoAuth, (req, res) => {
  const patient = DEMO_PATIENTS.find(p => p.id === req.params.id);
  
  if (!patient) {
    return res.status(404).json({
      error: 'Demo patient not found',
      availablePatients: DEMO_PATIENTS.map(p => p.id),
      isDemo: true
    });
  }
  
  res.json({
    patient,
    isDemo: true,
    note: 'This is simulated patient data for demonstration purposes'
  });
});

// Demo AI chat responses
router.post('/ai/chat', optionalDemoAuth, (req, res) => {
  const { message, context } = req.body;
  
  console.log('🤖 Demo AI query:', message?.substring(0, 50) + '...');
  
  // Determine response type based on keywords
  let responseCategory = 'clinical';
  const msgLower = message?.toLowerCase() || '';
  
  if (msgLower.includes('security') || msgLower.includes('hipaa') || 
      msgLower.includes('compliance') || msgLower.includes('encryption')) {
    responseCategory = 'security';
  } else if (msgLower.includes('cost') || msgLower.includes('roi') || 
             msgLower.includes('savings') || msgLower.includes('money')) {
    responseCategory = 'roi';
  } else if (msgLower.includes('crisis') || msgLower.includes('emergency') || 
             msgLower.includes('alert') || msgLower.includes('risk')) {
    responseCategory = 'crisis';
  }
  
  const responses = DEMO_AI_RESPONSES[responseCategory];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Simulate response delay for realism
  setTimeout(() => {
    res.json({
      response: randomResponse,
      context: responseCategory,
      isDemo: true,
      timestamp: new Date().toISOString(),
      queryId: `demo-${Date.now()}`,
      processingTime: Math.random() * 2 + 0.5 // 0.5-2.5 seconds
    });
  }, 1000 + Math.random() * 1500); // 1-2.5 second delay
});

// Demo metrics and ROI
router.get('/metrics/roi', optionalDemoAuth, (req, res) => {
  res.json({
    metrics: DEMO_METRICS,
    calculatedAt: new Date().toISOString(),
    isDemo: true,
    note: 'ROI calculations based on simulated data'
  });
});

// Demo usage statistics
router.get('/usage/stats', optionalDemoAuth, (req, res) => {
  res.json({
    usage: DEMO_USAGE,
    period: 'current_month',
    isDemo: true,
    lastUpdated: new Date().toISOString()
  });
});

// Demo alerts feed
router.get('/alerts', optionalDemoAuth, (req, res) => {
  res.json({
    alerts: DEMO_ALERTS,
    total: DEMO_ALERTS.length,
    isDemo: true,
    refreshRate: '30 seconds (demo)'
  });
});

// Demo crisis events
router.get('/crisis/events', optionalDemoAuth, (req, res) => {
  const crisisAlerts = DEMO_ALERTS.filter(alert => alert.type === 'crisis');
  
  res.json({
    events: crisisAlerts,
    total: crisisAlerts.length,
    severity: {
      high: crisisAlerts.filter(a => a.severity === 'high').length,
      medium: crisisAlerts.filter(a => a.severity === 'medium').length,
      low: crisisAlerts.filter(a => a.severity === 'low').length
    },
    isDemo: true
  });
});

// Demo billing information
router.get('/billing/usage', optionalDemoAuth, (req, res) => {
  res.json({
    currentUsage: DEMO_USAGE,
    billing: {
      plan: 'Enterprise Demo',
      cost: 0,
      period: 'Demo Period',
      nextBilling: 'N/A - Demo Only'
    },
    isDemo: true
  });
});

// Demo EHR integration status
router.get('/ehr/status', optionalDemoAuth, (req, res) => {
  res.json({
    integrations: [
      { name: 'Epic', status: 'connected', lastSync: new Date().toISOString() },
      { name: 'Cerner', status: 'connected', lastSync: new Date().toISOString() },
      { name: 'Allscripts', status: 'pending', lastSync: null }
    ],
    totalConnected: 2,
    isDemo: true,
    note: 'EHR integrations are simulated for demo purposes'
  });
});

// Demo insights and analytics
router.get('/insights/summary', optionalDemoAuth, (req, res) => {
  res.json({
    insights: {
      totalPatients: DEMO_PATIENTS.length,
      averageImprovement: 78.5,
      adherenceRate: 89.3,
      riskReduction: 23.4,
      costSavings: DEMO_METRICS.costSavings.monthly
    },
    trends: {
      patientSatisfaction: '+12% this month',
      treatmentAdherence: '+8% this month',
      providerEfficiency: '+15% this month'
    },
    isDemo: true,
    generatedAt: new Date().toISOString()
  });
});

// Demo ecosystem status
router.get('/ecosystem/status', optionalDemoAuth, (req, res) => {
  res.json({
    status: 'fully_operational',
    services: {
      'api-gateway': { status: 'healthy', port: 3000 },
      'sso-service': { status: 'healthy', port: 3001 },
      'analytics-engine': { status: 'healthy', port: 3002 },
      'ai-orchestration': { status: 'healthy', port: 3003 },
      'provider-dashboard': { status: 'healthy', port: 3004 }
    },
    apps: {
      'menowellness': { status: 'active', users: 1247 },
      'supportivepartner': { status: 'active', users: 856 },
      'soberpal': { status: 'active', users: 423 },
      'myconfidant': { status: 'active', users: 678 },
      'innerarchitect': { status: 'active', users: 892 }
    },
    isDemo: true,
    lastCheck: new Date().toISOString()
  });
});

// Demo lead capture (for sales)
router.post('/leads/capture', (req, res) => {
  const { name, email, company, phone, interest, message } = req.body;
  
  console.log('📈 Demo lead captured:', { name, email, company });
  
  // In production, this would integrate with CRM/sales tools
  res.json({
    success: true,
    message: 'Demo interest recorded - sales team will contact you within 24 hours',
    leadId: `demo-lead-${Date.now()}`,
    nextSteps: [
      'Sales team will contact you within 24 hours',
      'Schedule personalized demo based on your needs', 
      'Receive custom ROI analysis for your organization',
      'Get implementation timeline and pricing'
    ],
    isDemo: true
  });
});

// Health check for demo platform
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'demo',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/demo/auth/*',
      patients: '/api/demo/patients',
      ai: '/api/demo/ai/chat',
      metrics: '/api/demo/metrics/*',
      alerts: '/api/demo/alerts'
    }
  });
});

module.exports = router;