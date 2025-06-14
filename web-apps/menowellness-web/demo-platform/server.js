// Dr. Alex AI Demo Platform Server
// Isolated demo environment for enterprise sales

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: '.env.demo' });

// Import demo modules
const demoAuth = require('./middleware/demo-auth');
const demoData = require('./data/demo-data');
const demoRoutes = require('./routes/demo-routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware (relaxed for demo)
app.use(helmet({
  contentSecurityPolicy: false, // Relaxed for demo
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Demo banner middleware
app.use((req, res, next) => {
  res.locals.isDemo = true;
  res.locals.demoWarning = 'DEMO ENVIRONMENT - All data is simulated';
  next();
});

// Routes
app.use('/api/demo', demoRoutes);

// Demo applications
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/provider-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'provider-demo.html'));
});

// Individual app landing pages
app.get('/menowellness-landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menowellness-landing.html'));
});

app.get('/supportivepartner-landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'supportivepartner-landing.html'));
});

app.get('/fertilitytracker-landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fertilitytracker-landing.html'));
});

app.get('/pregnancycompanion-landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pregnancycompanion-landing.html'));
});

app.get('/postpartumsupport-landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'postpartumsupport-landing.html'));
});

app.get('/innerarchitect-landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'innerarchitect-landing.html'));
});

// App demo pages (interactive demos)
app.get('/menowellness-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'menowellness-demo.html'));
});

app.get('/supportivepartner-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'supportivepartner-demo.html'));
});

app.get('/fertilitytracker-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fertilitytracker-demo.html'));
});

app.get('/pregnancycompanion-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pregnancycompanion-demo.html'));
});

app.get('/postpartumsupport-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'postpartumsupport-demo.html'));
});

app.get('/innerarchitect-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'innerarchitect-demo.html'));
});

app.get('/soberpal-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'soberpal-demo.html'));
});

app.get('/myconfidant-demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'myconfidant-demo.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'demo',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Demo Platform Error:', err);
  res.status(500).json({
    error: 'Demo platform error',
    message: 'Please contact sales@dralexai.com for assistance',
    isDemo: true
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Demo endpoint not found',
    availableEndpoints: [
      '/',
      '/provider-demo',
      '/menowellness-demo',
      '/supportivepartner-demo',
      '/api/demo/*'
    ],
    isDemo: true
  });
});

app.listen(PORT, () => {
  console.log('🎭 Dr. Alex AI Demo Platform started');
  console.log(`🌍 Demo URL: http://localhost:${PORT}`);
  console.log(`🏥 Provider Demo: http://localhost:${PORT}/provider-demo`);
  console.log(`👩‍⚕️ MenoWellness Demo: http://localhost:${PORT}/menowellness-demo`);
  console.log(`💑 SupportivePartner Demo: http://localhost:${PORT}/supportivepartner-demo`);
  console.log('');
  console.log('⚠️  DEMO MODE ACTIVE - No real patient data');
  console.log('📧 Sales Contact: sales@dralexai.com');
});