-- Ecosystem Intelligence Platform Database Schema
-- Initialize database with core tables for all services

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (shared across all services)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    profile_data JSONB DEFAULT '{}'::jsonb
);

-- User sessions for SSO
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- App registrations (for each individual app in ecosystem)
CREATE TABLE app_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_name VARCHAR(100) UNIQUE NOT NULL,
    app_key VARCHAR(255) UNIQUE NOT NULL,
    app_secret VARCHAR(255) NOT NULL,
    api_endpoint VARCHAR(255) NOT NULL,
    webhook_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    app_metadata JSONB DEFAULT '{}'::jsonb
);

-- User app subscriptions (track which apps each user has access to)
CREATE TABLE user_app_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    subscription_status VARCHAR(50) DEFAULT 'active',
    subscription_tier VARCHAR(50),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id)
);

-- Analytics events (cross-app data ingestion)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    session_id VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- AI conversations (unified conversation history)
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL,
    ai_persona VARCHAR(100) NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
    message_content TEXT NOT NULL,
    message_metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sentiment_score DECIMAL(3,2),
    emotion_tags TEXT[]
);

-- AI context sharing (cross-app context without merging personas)
CREATE TABLE ai_context_sharing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    target_app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    context_type VARCHAR(100) NOT NULL,
    context_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    relevance_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Provider accounts (healthcare providers using dashboard)
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(100),
    specialty VARCHAR(100),
    organization VARCHAR(200),
    phone VARCHAR(20),
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Provider patient relationships
CREATE TABLE provider_patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'primary', -- primary, consulting, etc.
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(provider_id, patient_id)
);

-- Correlation insights (cross-app analytics for providers)
CREATE TABLE correlation_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    insight_type VARCHAR(100) NOT NULL,
    insight_name VARCHAR(200) NOT NULL,
    insight_description TEXT,
    correlation_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2),
    sample_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_app_id ON analytics_events(app_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_app_id ON ai_conversations(app_id);
CREATE INDEX idx_ai_conversations_timestamp ON ai_conversations(timestamp);
CREATE INDEX idx_provider_patients_provider_id ON provider_patients(provider_id);
CREATE INDEX idx_provider_patients_patient_id ON provider_patients(patient_id);

-- Insert initial app registrations
-- Analytics-specific tables
CREATE TABLE analytics_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES analytics_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    metrics_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id)
);

-- User engagement scores
CREATE TABLE user_engagement_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    daily_score INTEGER DEFAULT 0,
    weekly_score INTEGER DEFAULT 0,
    monthly_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, app_id, date)
);

-- User alerts for real-time monitoring
CREATE TABLE user_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    app_id UUID REFERENCES app_registrations(id) ON DELETE CASCADE,
    alert_level INTEGER NOT NULL DEFAULT 1,
    alert_type VARCHAR(100) DEFAULT 'general',
    patterns JSONB DEFAULT '{}'::jsonb,
    recommendations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Correlation analysis results
CREATE TABLE correlation_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_type VARCHAR(100) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    results JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'processing',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Provider platform tables
CREATE TABLE provider_practices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    practice_name VARCHAR(200) NOT NULL,
    practice_type VARCHAR(100), -- 'individual', 'group', 'hospital', 'clinic'
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    tax_id VARCHAR(50),
    npi_number VARCHAR(20),
    license_numbers JSONB DEFAULT '{}'::jsonb,
    specialties TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Provider practice relationships (for multi-provider practices)
CREATE TABLE provider_practice_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES provider_practices(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'provider', -- 'owner', 'admin', 'provider', 'staff'
    permissions JSONB DEFAULT '{}'::jsonb,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(provider_id, practice_id)
);

-- Patient onboarding workflows
CREATE TABLE patient_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES provider_practices(id) ON DELETE CASCADE,
    onboarding_status VARCHAR(50) DEFAULT 'initiated', -- 'initiated', 'consent_pending', 'forms_pending', 'completed', 'cancelled'
    intake_form_data JSONB DEFAULT '{}'::jsonb,
    consent_forms JSONB DEFAULT '{}'::jsonb,
    medical_history JSONB DEFAULT '{}'::jsonb,
    current_medications JSONB DEFAULT '{}'::jsonb,
    allergies TEXT[],
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    insurance_info JSONB DEFAULT '{}'::jsonb,
    referral_source VARCHAR(100),
    chief_complaint TEXT,
    goals TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient communication history
CREATE TABLE patient_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    communication_type VARCHAR(50) NOT NULL, -- 'message', 'call', 'email', 'appointment', 'note'
    direction VARCHAR(20) NOT NULL, -- 'inbound', 'outbound'
    subject VARCHAR(255),
    content TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_urgent BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Clinical notes and assessments
CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    note_type VARCHAR(50) NOT NULL, -- 'progress', 'assessment', 'treatment_plan', 'discharge'
    title VARCHAR(255),
    content TEXT NOT NULL,
    assessment_scores JSONB DEFAULT '{}'::jsonb,
    treatment_recommendations TEXT,
    follow_up_plan TEXT,
    next_appointment TIMESTAMP WITH TIME ZONE,
    is_signed BOOLEAN DEFAULT false,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider billing and subscriptions
CREATE TABLE provider_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES provider_practices(id) ON DELETE CASCADE,
    subscription_tier VARCHAR(50) NOT NULL, -- 'basic', 'professional', 'enterprise'
    billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
    price_per_month DECIMAL(10,2),
    max_patients INTEGER,
    features JSONB DEFAULT '{}'::jsonb,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'past_due', 'cancelled', 'unpaid'
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider usage tracking
CREATE TABLE provider_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES provider_practices(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    patients_accessed INTEGER DEFAULT 0,
    reports_generated INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    data_exported_mb DECIMAL(10,2) DEFAULT 0,
    features_used JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, practice_id, usage_date)
);

-- Clinical reports
CREATE TABLE clinical_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    practice_id UUID REFERENCES provider_practices(id) ON DELETE CASCADE,
    report_type VARCHAR(100) NOT NULL, -- 'patient_summary', 'progress_report', 'outcome_analysis', 'population_health'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    patient_ids UUID[],
    date_range JSONB DEFAULT '{}'::jsonb,
    report_data JSONB DEFAULT '{}'::jsonb,
    file_path VARCHAR(500),
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'generating', -- 'generating', 'completed', 'failed'
    generated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional indexes for provider platform
CREATE INDEX idx_provider_practices_active ON provider_practices(is_active);
CREATE INDEX idx_provider_practice_memberships_provider ON provider_practice_memberships(provider_id, is_active);
CREATE INDEX idx_patient_onboarding_status ON patient_onboarding(onboarding_status, provider_id);
CREATE INDEX idx_patient_communications_patient_provider ON patient_communications(patient_id, provider_id);
CREATE INDEX idx_patient_communications_created ON patient_communications(created_at);
CREATE INDEX idx_clinical_notes_patient_provider ON clinical_notes(patient_id, provider_id);
CREATE INDEX idx_provider_subscriptions_provider ON provider_subscriptions(provider_id, status);
CREATE INDEX idx_provider_usage_date ON provider_usage(provider_id, usage_date);
CREATE INDEX idx_clinical_reports_provider_status ON clinical_reports(provider_id, status);

-- Additional indexes for analytics performance
CREATE INDEX idx_analytics_metrics_user_app ON analytics_metrics(user_id, app_id);
CREATE INDEX idx_analytics_metrics_timestamp ON analytics_metrics(timestamp);
CREATE INDEX idx_user_engagement_user_app_date ON user_engagement_scores(user_id, app_id, date);
CREATE INDEX idx_user_alerts_user_active ON user_alerts(user_id, is_active);
CREATE INDEX idx_correlation_analyses_status ON correlation_analyses(status);

INSERT INTO app_registrations (app_name, app_key, app_secret, api_endpoint, app_metadata) VALUES
('MyConfidant', 'myconfidant_key', 'myconfidant_secret', 'https://api.myconfidant.health', '{"persona": "Clinical ALEX", "focus": "ED treatment", "revenue": 29.99}'),
('DrAlexAI', 'dralexai_key', 'dralexai_secret', 'https://api.dralexai.com', '{"persona": "Experienced husband ALEX", "focus": "Menopause support", "revenue": 19.99}'),
('SoberPal', 'soberpal_key', 'soberpal_secret', 'https://api.soberpal.com', '{"persona": "Recovery-focused AI", "focus": "Addiction recovery", "revenue": 19.99}'),
('Inner Architect', 'innerarchitect_key', 'innerarchitect_secret', 'https://api.innerarchitect.com', '{"persona": "Growth-oriented AI", "focus": "Personal development", "revenue": 14.99}'),
('MenoTracker', 'menotracker_key', 'menotracker_secret', 'https://api.menotracker.com', '{"persona": "Empathetic medical AI", "focus": "Menopause tracking", "revenue": 24.99}'),
('MenoPartner', 'menopartner_key', 'menopartner_secret', 'https://api.menopartner.com', '{"persona": "Partner-supportive AI", "focus": "Partner support", "revenue": 19.99}'),
('Meno Community', 'menocommunity_key', 'menocommunity_secret', 'https://api.menocommunity.com', '{"persona": "Community AI", "focus": "Peer support", "revenue": 9.99}');
