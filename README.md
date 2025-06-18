# MenoWellness - PhaseForward App

> Central API Gateway Infrastructure for Life Transition Intelligence Platform

## 🎯 Project Overview

This repository contains the central orchestration system for a comprehensive healthcare app ecosystem that represents the world's first **Life Transition Intelligence Platform**. The platform integrates multiple specialized healthcare apps while maintaining their independence through a sophisticated microservices architecture.

### Business Value
- **Potential $100M+ ARR** business with unique acquisition value for Big Pharma
- **Unprecedented relationship and health correlation data**
- **Cross-app analytics** providing insights impossible to get elsewhere
- **Both sides of couples' health journeys** during major life transitions

## 🏗️ Architecture Overview

### Microservices Structure
```
ecosystem-intelligence/
├── api-gateway/          # Central API Gateway (Port 3000)
├── sso-service/          # Single Sign-On Authentication (Port 3001)
├── analytics-engine/     # Data Analytics & Correlation (Port 3002)
├── ai-orchestration/     # AI Persona Coordination (Port 3003)
├── provider-dashboard/   # Healthcare Provider Backend (Port 3004)
├── scripts/             # Database setup and migration scripts
└── docker-compose.yml   # Container orchestration
```

### Integrated Apps
- **MyConfidant** - Men's ED treatment ($29.99/month)
- **DrAlexAI** - Menopause support for partners ($19.99/month)
- **SoberPal** - Addiction recovery support ($19.99/month)
- **Inner Architect** - Personal development ($14.99/month)
- **MenoTracker** - Women's menopause tracking ($24.99/month)
- **MenoPartner** - Partner menopause support ($19.99/month)
- **Meno Community** - Peer support community ($9.99/month)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Environment Setup
1. Copy environment configuration:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ecosystem_intelligence

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (generate a secure key)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Supabase (optional, for consistency with existing apps)
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Setup
1. Create PostgreSQL database:
```bash
createdb ecosystem_intelligence
```

2. Run database initialization:
```bash
npm run setup:db
```

### Installation & Development

#### Option 1: Local Development
```bash
# Install dependencies for all services
npm install

# Start all services in development mode
npm run dev
```

#### Option 2: Docker Development
```bash
# Build and start all services
npm run docker:up

# View logs
docker-compose logs -f

# Stop services
npm run docker:down
```

### Service URLs
- **API Gateway**: http://localhost:3000
- **SSO Service**: http://localhost:3001
- **Analytics Engine**: http://localhost:3002
- **AI Orchestration**: http://localhost:3003
- **Provider Dashboard**: http://localhost:3004

## 📊 API Documentation

### Authentication Flow
1. **Register/Login** → `POST /auth/login` or `POST /auth/register`
2. **Get Access Token** → Use in `Authorization: Bearer <token>` header
3. **Access Services** → All requests routed through API Gateway

### Key Endpoints
```bash
# Health Checks
GET /health                    # API Gateway health
GET /auth/health              # SSO Service health
GET /analytics/health         # Analytics Engine health

# Authentication
POST /auth/register           # User registration
POST /auth/login             # User login
POST /auth/refresh           # Token refresh
GET /auth/validate           # Token validation

# API Gateway
GET /api/status              # Available apps status
GET /api/my-apps            # User's accessible apps

# App Proxies (requires authentication)
GET /api/myconfidant/*       # MyConfidant API proxy
GET /api/dralexai/*         # DrAlexAI API proxy
GET /api/soberpal/*         # SoberPal API proxy
# ... other app proxies
```

## 🔧 Development

### Project Structure
Each service is an independent Node.js application with:
- **Express.js** server
- **PostgreSQL** for persistent data
- **Redis** for caching and sessions
- **JWT** for authentication
- **Winston** for logging
- **Docker** for containerization

### Adding New Services
1. Create service directory: `mkdir new-service`
2. Add to `package.json` workspaces
3. Update `docker-compose.yml`
4. Add proxy routes in API Gateway
5. Update database schema if needed

### Database Migrations
```bash
# Run migrations
npm run migrate

# Create new migration
node scripts/create-migration.js migration_name
```

## 🔐 Security Features

- **JWT-based authentication** with refresh tokens
- **Rate limiting** on all endpoints
- **CORS protection** with configurable origins
- **Helmet.js** security headers
- **Input validation** with express-validator
- **SQL injection protection** with parameterized queries
- **Token blacklisting** for logout security

## 📈 Monitoring & Health Checks

### Health Check Endpoints
- `/health` - Basic service health
- `/health/detailed` - Health with dependency status
- `/health/ready` - Kubernetes readiness probe
- `/health/live` - Kubernetes liveness probe
- `/health/metrics` - Service metrics

### Logging
- **Winston** structured logging
- **Log levels**: error, warn, info, debug
- **Log files**: `logs/combined.log`, `logs/error.log`
- **Console output** in development

## 🚢 Deployment

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)
```bash
NODE_ENV=production
JWT_SECRET=<secure-production-secret>
DATABASE_URL=<production-database-url>
REDIS_URL=<production-redis-url>
```

## 🤝 Integration with Existing Apps

### App Registration
Each existing app needs to be registered in the system:
```sql
INSERT INTO app_registrations (app_name, app_key, app_secret, api_endpoint)
VALUES ('MyApp', 'generated_key', 'generated_secret', 'https://api.myapp.com');
```

### User App Subscriptions
Link users to their app subscriptions:
```sql
INSERT INTO user_app_subscriptions (user_id, app_id, subscription_status)
VALUES (user_uuid, app_uuid, 'active');
```

## 📋 Roadmap

### Phase 1: Core Infrastructure ✅
- [x] API Gateway Service
- [x] SSO Authentication Service
- [x] Database Schema
- [x] Docker Configuration

### Phase 2: Data & Intelligence ✅
- [x] Analytics Engine
- [x] AI Orchestration Service
- [x] Cross-app data correlation

### Phase 3: Provider Platform
- [ ] Provider Dashboard Backend
- [ ] Clinical insights APIs
- [ ] Billing integration

### Phase 4: Enterprise Features
- [ ] Enterprise API platform
- [ ] Advanced analytics
- [ ] Compliance features

## 🆘 Support

For technical support or questions:
- **Email**: team.mobileweb@gmail.com
- **GitHub Issues**: Create an issue in this repository
- **Documentation**: See `/docs` folder for detailed guides

## 📄 License

MIT License - see LICENSE file for details.

---

**🎯 Bottom Line**: This is the technical foundation for a potentially $100M+ healthcare intelligence platform with unique acquisition value. The architecture preserves individual app autonomy while enabling powerful cross-app analytics and AI orchestration.
