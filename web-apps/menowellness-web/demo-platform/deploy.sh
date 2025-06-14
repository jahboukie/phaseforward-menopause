#!/bin/bash

# Dr. Alex AI Demo Platform Deployment Script
# Deploys the isolated demo environment for enterprise sales

set -e

echo "🎭 Dr. Alex AI Demo Platform Deployment"
echo "======================================"

# Configuration
DEMO_PORT=${PORT:-4000}
DOMAIN=${DEMO_DOMAIN:-"demo.dralexai.com"}
ENVIRONMENT=${NODE_ENV:-"demo"}

echo "📋 Configuration:"
echo "  Port: $DEMO_PORT"
echo "  Domain: $DOMAIN" 
echo "  Environment: $ENVIRONMENT"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected - using containerized deployment"
    
    # Build and deploy with Docker
    echo "🔨 Building Docker image..."
    docker build -t dralexai-demo:latest .
    
    echo "🚀 Starting demo platform..."
    docker-compose up -d
    
    echo "✅ Demo platform deployed with Docker"
    echo "🌍 Access at: http://localhost:$DEMO_PORT"
    
elif command -v node &> /dev/null; then
    echo "📦 Node.js detected - using direct deployment"
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Start the demo platform
    echo "🚀 Starting demo platform..."
    npm start &
    DEMO_PID=$!
    echo $DEMO_PID > demo.pid
    
    echo "✅ Demo platform started (PID: $DEMO_PID)"
    echo "🌍 Access at: http://localhost:$DEMO_PORT"
    
else
    echo "❌ Neither Docker nor Node.js found"
    echo "Please install Node.js 18+ or Docker to deploy the demo platform"
    exit 1
fi

echo ""
echo "🎯 Demo URLs:"
echo "  Main Demo: http://localhost:$DEMO_PORT"
echo "  Provider Demo: http://localhost:$DEMO_PORT/provider-demo"
echo "  MenoWellness Demo: http://localhost:$DEMO_PORT/menowellness-demo"
echo "  SupportivePartner Demo: http://localhost:$DEMO_PORT/supportivepartner-demo"
echo ""
echo "🎭 Demo Credentials:"
echo "  Username: demo@dralexai.com"
echo "  Password: DrAlexDemo2024!"
echo ""
echo "📧 Sales Contact: sales@dralexai.com"
echo "📅 Demo Booking: https://calendly.com/dralexai/enterprise-demo"
echo ""
echo "⚠️  DEMO MODE ACTIVE - All data is simulated for sales purposes"
echo "🛡️  No real patient data - HIPAA compliant demonstration"

# Health check
sleep 5
echo ""
echo "🔍 Health check..."
if curl -s http://localhost:$DEMO_PORT/health > /dev/null; then
    echo "✅ Demo platform is healthy and ready for presentations"
else
    echo "⚠️  Health check failed - platform may still be starting"
    echo "   Try accessing http://localhost:$DEMO_PORT in a few moments"
fi

echo ""
echo "🎉 Demo Platform Deployment Complete!"
echo "Ready for enterprise sales presentations."