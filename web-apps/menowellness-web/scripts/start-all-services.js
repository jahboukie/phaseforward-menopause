#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const services = [
  {
    name: 'API Gateway',
    dir: 'api-gateway',
    port: process.env.API_GATEWAY_PORT || 3000,
    color: '\x1b[36m' // Cyan
  },
  {
    name: 'SSO Service',
    dir: 'sso-service',
    port: process.env.SSO_SERVICE_PORT || 3001,
    color: '\x1b[32m' // Green
  },
  {
    name: 'Analytics Engine',
    dir: 'analytics-engine',
    port: process.env.ANALYTICS_ENGINE_PORT || 3002,
    color: '\x1b[33m' // Yellow
  },
  {
    name: 'AI Orchestration',
    dir: 'ai-orchestration',
    port: process.env.AI_ORCHESTRATION_PORT || 3003,
    color: '\x1b[35m' // Magenta
  },
  {
    name: 'Provider Dashboard',
    dir: 'provider-dashboard',
    port: process.env.PROVIDER_DASHBOARD_PORT || 3004,
    color: '\x1b[34m' // Blue
  }
];

const reset = '\x1b[0m';
const processes = [];

function log(service, message, isError = false) {
  const timestamp = new Date().toISOString();
  const color = isError ? '\x1b[31m' : service.color;
  console.log(`${color}[${timestamp}] [${service.name}]${reset} ${message}`);
}

function checkServiceDirectory(service) {
  const servicePath = path.join(process.cwd(), service.dir);
  const packageJsonPath = path.join(servicePath, 'package.json');
  
  if (!fs.existsSync(servicePath)) {
    log(service, `Directory not found: ${servicePath}`, true);
    return false;
  }
  
  if (!fs.existsSync(packageJsonPath)) {
    log(service, `package.json not found in ${servicePath}`, true);
    return false;
  }
  
  return true;
}

function startService(service) {
  if (!checkServiceDirectory(service)) {
    return null;
  }

  log(service, `Starting on port ${service.port}...`);
  
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), service.dir),
    stdio: 'pipe',
    env: { ...process.env }
  });

  child.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      log(service, message);
    }
  });

  child.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      log(service, message, true);
    }
  });

  child.on('close', (code) => {
    if (code !== 0) {
      log(service, `Process exited with code ${code}`, true);
    } else {
      log(service, 'Process stopped');
    }
  });

  child.on('error', (error) => {
    log(service, `Failed to start: ${error.message}`, true);
  });

  return child;
}

function startAllServices() {
  console.log('\x1b[1m\x1b[37m🚀 Starting Ecosystem Intelligence Platform Services\x1b[0m\n');

  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    console.log('\x1b[31m⚠️  Warning: .env file not found. Please copy .env.example to .env and configure it.\x1b[0m\n');
  }

  services.forEach((service, index) => {
    setTimeout(() => {
      const child = startService(service);
      if (child) {
        processes.push({ service, process: child });
      }
    }, index * 2000); // Stagger startup by 2 seconds
  });

  // Display service URLs after all services have started
  setTimeout(() => {
    console.log('\n\x1b[1m\x1b[37m📊 Service URLs:\x1b[0m');
    services.forEach(service => {
      console.log(`${service.color}  ${service.name}: http://localhost:${service.port}${reset}`);
    });
    console.log('\n\x1b[1m\x1b[37m🔍 Health Checks:\x1b[0m');
    services.forEach(service => {
      console.log(`${service.color}  ${service.name}: http://localhost:${service.port}/health${reset}`);
    });
    console.log('\n\x1b[1m\x1b[37m📖 API Documentation:\x1b[0m');
    console.log(`\x1b[36m  API Gateway Dashboard: http://localhost:3000/api/status${reset}`);
    console.log(`\x1b[33m  Analytics Dashboard: http://localhost:3002/dashboard${reset}`);
    console.log(`\x1b[35m  AI Orchestration Dashboard: http://localhost:3003/dashboard${reset}`);
    console.log(`\x1b[34m  Provider Dashboard: http://localhost:3004/dashboard${reset}`);
    console.log('\n\x1b[32m✅ All services started! Press Ctrl+C to stop all services.\x1b[0m\n');
  }, services.length * 2000 + 3000);
}

function stopAllServices() {
  console.log('\n\x1b[1m\x1b[37m🛑 Stopping all services...\x1b[0m');
  
  processes.forEach(({ service, process }) => {
    log(service, 'Stopping...');
    process.kill('SIGTERM');
  });

  setTimeout(() => {
    console.log('\x1b[32m✅ All services stopped.\x1b[0m');
    process.exit(0);
  }, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', stopAllServices);
process.on('SIGTERM', stopAllServices);

// Start all services
startAllServices();
