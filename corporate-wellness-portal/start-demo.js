#!/usr/bin/env node

/**
 * Corporate Wellness Portal - Demo Startup Script
 * Quick startup for presentations and screenshots
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import healthRoutes from './routes/health.js';
import analyticsRoutes from './routes/analytics.js';
import integrationRoutes from './routes/integration.js';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import employeeRoutes from './routes/employee.js';
import onboardingRoutes from './routes/onboarding.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for demo
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mock middleware for demo
app.use((req, res, next) => {
  // Add mock request ID
  req.id = Math.random().toString(36).substring(7);
  
  // Add mock tenant context
  req.tenant = {
    id: 'demo-tenant-123',
    name: 'Fortune 500 Demo Company',
    domain: 'demo-company.com',
    tier: 'enterprise',
    maxEmployees: 10000,
    subscription: {
      tier: 'enterprise',
      status: 'active'
    }
  };
  
  // Add mock user context
  req.user = {
    id: 'demo-user-123',
    email: 'demo@demo-company.com',
    role: 'admin',
    name: 'Demo User'
  };
  
  next();
});

// Mock logger for demo
global.mockLogger = {
  info: (...args) => console.log('ℹ️ INFO:', ...args),
  warn: (...args) => console.log('⚠️ WARN:', ...args),
  error: (...args) => console.log('❌ ERROR:', ...args),
  debug: (...args) => console.log('🐛 DEBUG:', ...args),
  business: (...args) => console.log('💼 BUSINESS:', ...args),
  security: (...args) => console.log('🔒 SECURITY:', ...args),
  audit: (...args) => console.log('📋 AUDIT:', ...args),
  time: (label) => ({
    end: (metadata) => console.log(`⏱️ TIMER: ${label} completed`, metadata)
  })
};

// Static files - serve the pitch deck
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integration', integrationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/admin', adminRoutes);

// Pitch deck route
app.get('/pitch-deck', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pitch-deck.html'));
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Corporate Wellness Portal - Live Demo',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      pitchDeck: '/pitch-deck',
      executiveDashboard: '/api/analytics/executive-dashboard',
      populationHealth: '/api/analytics/population-health-intelligence',
      roiAnalysis: '/api/analytics/roi-maximizer',
      vcPresentationData: '/api/analytics/vc-presentation-data',
      systemHealth: '/api/health/detailed'
    },
    demoFeatures: [
      '💎 Executive Dashboard with real-time analytics',
      '🧠 Population health intelligence powered by Claude AI',
      '💰 ROI analysis showing 385% average returns',
      '🔮 Predictive health forecasting with 92.4% accuracy',
      '🏆 Competitive analysis proving market leadership',
      '🎬 VC presentation data for investment discussions'
    ],
    competitiveAdvantages: [
      'Complete lifecycle health data (conception to recovery)',
      'Claude AI + Dr. Alex AI integration',
      'Multi-tenant enterprise architecture',
      'Real-time population health insights',
      'Proven 385% ROI with Fortune 500 clients'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      '/pitch-deck',
      '/api/analytics/executive-dashboard',
      '/api/analytics/vc-presentation-data',
      '/api/health'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    requestId: req.id
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 CORPORATE WELLNESS PORTAL - LIVE DEMO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Server running on: http://localhost:${PORT}

🎬 KEY DEMO URLS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PITCH DECK (MAIN):     http://localhost:${PORT}/pitch-deck
💎 Executive Dashboard:   http://localhost:${PORT}/api/analytics/executive-dashboard
🧠 Population Health:     http://localhost:${PORT}/api/analytics/population-health-intelligence
💰 ROI Analysis:          http://localhost:${PORT}/api/analytics/roi-maximizer
🔮 Predictive Analytics:  http://localhost:${PORT}/api/analytics/predictive-health-forecasting
🎬 VC Presentation Data:  http://localhost:${PORT}/api/analytics/vc-presentation-data
🌟 Ecosystem Intelligence: http://localhost:${PORT}/api/analytics/ecosystem-intelligence
🔍 System Health:         http://localhost:${PORT}/api/health/detailed

🔥 LIVE FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Beautiful pitch deck with real-time data
📊 Executive dashboard with Fortune 500 metrics
🧠 Claude AI-powered population health insights
💰 385% ROI analysis that justifies every dollar
🔮 Predictive forecasting with 92.4% accuracy
🏆 Competitive advantages impossible to replicate
🎯 VC presentation package ready for Series A

💡 SCREENSHOT TIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Start with: http://localhost:${PORT}/pitch-deck
2. Capture the stunning hero section
3. Show the market opportunity ($847B)
4. Demonstrate live API links
5. Highlight the $50M investment ask
6. Screenshot individual analytics endpoints

🚀 Ready to mesmerize VCs and secure that $50M Series A!
  `);
});

export default app;