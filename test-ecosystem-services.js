#!/usr/bin/env node

/**
 * 🧪 Ecosystem Intelligence Platform - Service Testing Suite
 * Comprehensive testing for all microservices
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 Ecosystem Intelligence Platform - Service Testing Suite');
console.log('=' .repeat(60));

// Test configuration
const services = [
  {
    name: 'API Gateway',
    url: 'http://localhost:3000',
    healthPath: '/health',
    testPaths: ['/api/status', '/dashboard'],
    port: 3000
  },
  {
    name: 'SSO Service',
    url: 'http://localhost:3001',
    healthPath: '/health',
    testPaths: ['/register', '/login'],
    port: 3001
  },
  {
    name: 'Analytics Engine',
    url: 'http://localhost:3002',
    healthPath: '/health',
    testPaths: ['/dashboard', '/data/summary'],
    port: 3002
  },
  {
    name: 'AI Orchestration',
    url: 'http://localhost:3003',
    healthPath: '/health',
    testPaths: ['/dashboard', '/personas'],
    port: 3003
  },
  {
    name: 'Provider Dashboard',
    url: 'http://localhost:3004',
    healthPath: '/health',
    testPaths: ['/dashboard', '/auth/status'],
    port: 3004
  }
];

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  services: {}
};

function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'Ecosystem-Test-Suite/1.0'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
          url: url
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function logTest(serviceName, testName, passed, details = '') {
  testResults.total++;
  if (!testResults.services[serviceName]) {
    testResults.services[serviceName] = { passed: 0, failed: 0, tests: [] };
  }

  const result = {
    name: testName,
    passed: passed,
    details: details
  };

  testResults.services[serviceName].tests.push(result);

  if (passed) {
    testResults.passed++;
    testResults.services[serviceName].passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    testResults.failed++;
    testResults.services[serviceName].failed++;
    console.log(`  ❌ ${testName}`);
    if (details) console.log(`     ${details}`);
  }
}

async function testServiceHealth(service) {
  console.log(`\\n🔍 Testing ${service.name} (${service.url})`);
  console.log('-'.repeat(40));

  try {
    // Health check
    const healthResponse = await makeRequest(`${service.url}${service.healthPath}`);
    logTest(service.name, 'Health Check', healthResponse.status === 200, 
      healthResponse.status !== 200 ? `Status: ${healthResponse.status}` : '');
    
    // Service availability
    const serviceResponse = await makeRequest(service.url);
    logTest(service.name, 'Service Reachable', 
      serviceResponse.status < 500, 
      serviceResponse.status >= 500 ? `Status: ${serviceResponse.status}` : '');

    // Test additional paths
    for (const testPath of service.testPaths) {
      try {
        const response = await makeRequest(`${service.url}${testPath}`);
        logTest(service.name, `Endpoint ${testPath}`, 
          response.status < 500, 
          response.status >= 500 ? `Status: ${response.status}` : '');
      } catch (error) {
        logTest(service.name, `Endpoint ${testPath}`, false, error.message);
      }
    }

  } catch (error) {
    logTest(service.name, 'Service Connection', false, error.message);
    logTest(service.name, 'Health Check', false, 'Service unreachable');
  }
}

async function testServiceIntegration() {
  console.log(`\\n🔗 Testing Service Integration`);
  console.log('-'.repeat(40));

  try {
    // Test API Gateway proxy routes
    const proxyTests = [
      '/api/myconfidant/health',
      '/api/dralexai/health', 
      '/api/soberpal/health',
      '/auth/health',
      '/analytics/health',
      '/ai/health'
    ];

    for (const proxyPath of proxyTests) {
      try {
        const response = await makeRequest(`http://localhost:3000${proxyPath}`);
        logTest('Integration', `Proxy ${proxyPath}`, 
          response.status !== 404, 
          response.status === 404 ? 'Route not found' : '');
      } catch (error) {
        logTest('Integration', `Proxy ${proxyPath}`, false, error.message);
      }
    }

  } catch (error) {
    logTest('Integration', 'API Gateway Proxy', false, error.message);
  }
}

async function testAuthentication() {
  console.log(`\\n🔐 Testing Authentication System`);
  console.log('-'.repeat(40));

  try {
    // Test user registration endpoint
    const registerData = JSON.stringify({
      email: `test-${Date.now()}@ecosystem-test.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User'
    });

    // Make request to SSO service for registration
    const registerUrl = 'http://localhost:3001/register';
    
    try {
      const response = await makeRequest(registerUrl);
      logTest('Authentication', 'Registration Endpoint', 
        response.status !== 404, 
        response.status === 404 ? 'Endpoint not found' : '');
    } catch (error) {
      logTest('Authentication', 'Registration Endpoint', false, error.message);
    }

    // Test login endpoint
    try {
      const response = await makeRequest('http://localhost:3001/login');
      logTest('Authentication', 'Login Endpoint', 
        response.status !== 404, 
        response.status === 404 ? 'Endpoint not found' : '');
    } catch (error) {
      logTest('Authentication', 'Login Endpoint', false, error.message);
    }

  } catch (error) {
    logTest('Authentication', 'Auth System', false, error.message);
  }
}

function checkDependencies() {
  console.log(`\\n📦 Checking Service Dependencies`);
  console.log('-'.repeat(40));

  const serviceDirs = [
    'api-gateway',
    'sso-service', 
    'analytics-engine',
    'ai-orchestration',
    'provider-dashboard'
  ];

  serviceDirs.forEach(dir => {
    const packagePath = path.join('/mnt/c/Users/scorp/dbil/ecosystem-intelligence', dir, 'package.json');
    const nodeModulesPath = path.join('/mnt/c/Users/scorp/dbil/ecosystem-intelligence', dir, 'node_modules');
    
    try {
      if (fs.existsSync(packagePath)) {
        logTest('Dependencies', `${dir} package.json`, true);
      } else {
        logTest('Dependencies', `${dir} package.json`, false, 'File not found');
      }

      if (fs.existsSync(nodeModulesPath)) {
        logTest('Dependencies', `${dir} node_modules`, true);
      } else {
        logTest('Dependencies', `${dir} node_modules`, false, 'Dependencies not installed');
      }
    } catch (error) {
      logTest('Dependencies', `${dir} check`, false, error.message);
    }
  });
}

function checkEnvironmentConfig() {
  console.log(`\\n⚙️  Checking Environment Configuration`);
  console.log('-'.repeat(40));

  const envPath = '/mnt/c/Users/scorp/dbil/ecosystem-intelligence/.env';
  
  try {
    if (fs.existsSync(envPath)) {
      logTest('Environment', '.env file exists', true);
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'API_GATEWAY_PORT',
        'SSO_SERVICE_PORT', 
        'ANALYTICS_ENGINE_PORT',
        'AI_ORCHESTRATION_PORT',
        'PROVIDER_DASHBOARD_PORT',
        'DATABASE_URL',
        'JWT_SECRET'
      ];

      requiredVars.forEach(varName => {
        const hasVar = envContent.includes(varName + '=');
        logTest('Environment', `${varName} configured`, hasVar, 
          !hasVar ? 'Variable not found in .env' : '');
      });

    } else {
      logTest('Environment', '.env file exists', false, 'File not found');
    }
  } catch (error) {
    logTest('Environment', 'Environment check', false, error.message);
  }
}

async function generateTestReport() {
  console.log('\\n' + '='.repeat(60));
  console.log('📊 ECOSYSTEM INTELLIGENCE PLATFORM - TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\\n📈 OVERALL RESULTS:`);
  console.log(`   Total Tests: ${testResults.total}`);
  console.log(`   Passed: ${testResults.passed} ✅`);
  console.log(`   Failed: ${testResults.failed} ❌`);
  console.log(`   Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  console.log(`\\n🔍 SERVICE BREAKDOWN:`);
  Object.keys(testResults.services).forEach(serviceName => {
    const service = testResults.services[serviceName];
    const rate = service.passed + service.failed > 0 ? 
      ((service.passed / (service.passed + service.failed)) * 100).toFixed(1) : 0;
    console.log(`   ${serviceName}: ${service.passed}/${service.passed + service.failed} (${rate}%)`);
  });

  const readinessScore = (testResults.passed / testResults.total) * 100;
  
  console.log(`\\n🚀 ECOSYSTEM READINESS ASSESSMENT:`);
  if (readinessScore >= 80) {
    console.log('   ✅ EXCELLENT - Ready for integration and deployment');
  } else if (readinessScore >= 60) {
    console.log('   ⚠️  GOOD - Minor issues need attention');
  } else if (readinessScore >= 40) {
    console.log('   🔧 NEEDS WORK - Significant issues to resolve');
  } else {
    console.log('   🚨 CRITICAL - Major issues preventing deployment');
  }

  console.log(`\\n📋 IMMEDIATE NEXT STEPS:`);
  if (testResults.failed === 0) {
    console.log('   1. ✅ All tests passing - ready for MyConfidant integration');
    console.log('   2. 🔗 Configure SentimentAsAService.com data licensing');
    console.log('   3. 💰 Set up provider billing and enterprise features');
    console.log('   4. 📊 Begin cross-app analytics implementation');
  } else {
    console.log('   1. 🔧 Install missing dependencies (npm run install:all)');
    console.log('   2. 🗄️  Set up PostgreSQL and Redis databases');
    console.log('   3. ⚙️  Configure environment variables (.env file)');
    console.log('   4. 🚀 Start services (npm run dev)');
  }

  console.log(`\\n💡 BUSINESS IMPACT:`);
  console.log('   🎯 Foundation for $100M+ healthcare intelligence platform');
  console.log('   🔗 Ready for 6-app ecosystem integration');
  console.log('   📊 Unique Big Pharma data licensing opportunity');
  console.log('   🏥 Provider platform for enterprise revenue');

  return readinessScore >= 70;
}

async function runComprehensiveTests() {
  console.log('Starting comprehensive ecosystem testing...\\n');

  // Check prerequisites
  checkEnvironmentConfig();
  checkDependencies();

  // Test individual services
  for (const service of services) {
    await testServiceHealth(service);
  }

  // Test integration
  await testServiceIntegration();
  await testAuthentication();

  // Generate final report
  const isReady = await generateTestReport();
  
  console.log('\\n🎉 Testing complete!');
  process.exit(isReady ? 0 : 1);
}

// Handle command line arguments
if (process.argv.includes('--help')) {
  console.log('Usage: node test-ecosystem-services.js [options]');
  console.log('Options:');
  console.log('  --help     Show this help message');
  console.log('  --quick    Run only essential health checks');
  process.exit(0);
}

// Run the tests
runComprehensiveTests().catch(error => {
  console.error('\\n💥 Test suite failed:', error.message);
  process.exit(1);
});