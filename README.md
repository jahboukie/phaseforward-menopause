# MenoWellness Ecosystem

Full-stack healthcare platform with microservices architecture for menopause support and wellness tracking.

## Project Structure

```
menowellness-web/
├── frontend/              # React frontend application
│   ├── src/              # React components and logic
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── ai-orchestration/     # AI conversation service
├── analytics-engine/     # Data processing service
├── api-gateway/          # Main API gateway
├── sso-service/          # Authentication service
├── scripts/              # Database and setup scripts
└── docker-compose.yml    # Multi-service orchestration
```

## Quick Start

### Frontend Development
```bash
# Install all dependencies
npm run install:all

# Start frontend development server
npm run dev

# Or specifically start frontend
npm run dev:frontend
```

### Full Stack Development
```bash
# Start all backend services
npm run dev:backend

# Start frontend + backend
npm run dev:all
```

### Backend Services
```bash
# Start with Docker Compose
docker-compose up -d

# Initialize database
npm run setup:db

# Test HIPAA compliance
npm run test:hipaa
```

## Frontend (Port 3013)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Auth**: Supabase
- **State**: React Query

## Backend Services
- **AI Orchestration** (Port 3001): Conversation and persona management
- **Analytics Engine** (Port 3002): Data processing and insights
- **API Gateway** (Port 3000): Main API with authentication
- **SSO Service** (Port 3003): Single sign-on authentication

## Environment Setup

1. Copy `.env.example` to `.env` in frontend directory
2. Configure Supabase, Stripe, and other service credentials
3. Run database migrations: `npm run setup:db`
4. Start development: `npm run dev:all`

## HIPAA Compliance
This platform includes HIPAA-compliant features:
- Data encryption at rest and in transit
- Audit trails for all data access
- Secure authentication and authorization
- PHI data routing and anonymization