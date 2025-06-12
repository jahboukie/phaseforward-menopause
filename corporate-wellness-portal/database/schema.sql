-- Corporate Wellness Portal - Multi-Tenant Database Schema
-- Dr. Alex AI-grade security with tenant isolation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas for multi-tenant architecture
CREATE SCHEMA IF NOT EXISTS tenant_main;
CREATE SCHEMA IF NOT EXISTS tenant_analytics;
CREATE SCHEMA IF NOT EXISTS tenant_audit;
CREATE SCHEMA IF NOT EXISTS tenant_integration;

-- =============================================
-- TENANT MANAGEMENT TABLES
-- =============================================

-- Companies (Tenants)
CREATE TABLE tenant_main.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(50) NOT NULL DEFAULT 'startup',
    max_employees INTEGER NOT NULL DEFAULT 500,
    encryption_key TEXT NOT NULL,
    
    -- Configuration
    white_label_config JSONB DEFAULT '{}',
    sso_config JSONB DEFAULT '{}',
    integration_config JSONB DEFAULT '{}',
    billing_config JSONB DEFAULT '{}',
    
    -- Subscription details
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'startup',
    subscription_status VARCHAR(50) NOT NULL DEFAULT 'active',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Contact information
    primary_contact_email VARCHAR(255) NOT NULL,
    primary_contact_name VARCHAR(255) NOT NULL,
    billing_email VARCHAR(255),
    
    -- Metadata
    industry VARCHAR(100),
    company_size VARCHAR(50),
    headquarters_location VARCHAR(255),
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Security
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    security_level VARCHAR(50) NOT NULL DEFAULT 'enterprise',
    compliance_requirements TEXT[],
    
    CONSTRAINT valid_tier CHECK (tier IN ('startup', 'enterprise', 'fortune500')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'cancelled')),
    CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'cancelled', 'suspended', 'trial'))
);

-- Employees
CREATE TABLE tenant_main.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES tenant_main.companies(id) ON DELETE CASCADE,
    
    -- Personal Information (Encrypted)
    email VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    first_name_encrypted TEXT,
    last_name_encrypted TEXT,
    
    -- Work Information
    department VARCHAR(100),
    role VARCHAR(100),
    manager_id UUID REFERENCES tenant_main.employees(id),
    location VARCHAR(255),
    
    -- Demographics (for app recommendations)
    birth_year INTEGER,
    gender VARCHAR(20),
    marital_status VARCHAR(50),
    has_dependents BOOLEAN DEFAULT FALSE,
    
    -- App assignments
    apps_assigned JSONB DEFAULT '[]',
    app_preferences JSONB DEFAULT '{}',
    
    -- Onboarding status
    onboarded_at TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Security
    mfa_enabled BOOLEAN DEFAULT FALSE,
    last_password_change TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT valid_account_status CHECK (account_status IN ('pending', 'active', 'suspended', 'terminated')),
    CONSTRAINT unique_employee_per_company UNIQUE (company_id, email)
);

-- App Assignments (Track individual app access)
CREATE TABLE tenant_main.app_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES tenant_main.employees(id) ON DELETE CASCADE,
    app_name VARCHAR(100) NOT NULL,
    access_level VARCHAR(50) NOT NULL DEFAULT 'basic',
    
    -- Provisioning details
    provisioned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_token_encrypted TEXT,
    
    -- Configuration
    app_config JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Family/spouse assignments
    assigned_to_spouse BOOLEAN DEFAULT FALSE,
    spouse_email VARCHAR(255),
    
    CONSTRAINT valid_app_name CHECK (app_name IN (
        'fertilitytracker', 'pregnancycompanion', 'postpartumsupport',
        'menowellness', 'supportpartner', 'myconfidant', 
        'soberpal', 'innerarchitect'
    )),
    CONSTRAINT valid_access_level CHECK (access_level IN ('basic', 'premium', 'complete')),
    CONSTRAINT valid_assignment_status CHECK (status IN ('active', 'suspended', 'expired')),
    CONSTRAINT unique_employee_app UNIQUE (employee_id, app_name)
);

-- =============================================
-- ANALYTICS TABLES (Tenant-Isolated)
-- =============================================

-- Employee engagement metrics
CREATE TABLE tenant_analytics.engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_main.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL,
    
    -- App usage data
    app_name VARCHAR(100) NOT NULL,
    session_duration INTEGER, -- seconds
    pages_viewed INTEGER,
    features_used JSONB DEFAULT '[]',
    
    -- Engagement scoring
    engagement_score DECIMAL(3,2), -- 0.00 to 1.00
    wellness_score DECIMAL(3,2),
    productivity_indicator DECIMAL(3,2),
    
    -- Temporal data
    date_recorded DATE NOT NULL,
    week_of_year INTEGER,
    month_of_year INTEGER,
    quarter_of_year INTEGER,
    
    -- Metadata
    device_type VARCHAR(50),
    browser VARCHAR(100),
    location VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_daily_metric UNIQUE (tenant_id, employee_id, app_name, date_recorded)
);

-- Population health insights
CREATE TABLE tenant_analytics.population_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_main.companies(id) ON DELETE CASCADE,
    
    -- Population segments
    department VARCHAR(100),
    age_group VARCHAR(50),
    gender VARCHAR(20),
    
    -- Health metrics (anonymized aggregates)
    total_employees INTEGER,
    engagement_rate DECIMAL(5,2),
    wellness_score_avg DECIMAL(3,2),
    risk_score_avg DECIMAL(3,2),
    
    -- Specific health indicators
    stress_level_avg DECIMAL(3,2),
    sleep_quality_avg DECIMAL(3,2),
    exercise_frequency_avg DECIMAL(3,2),
    mental_health_score_avg DECIMAL(3,2),
    
    -- Trends
    trend_direction VARCHAR(20), -- improving, declining, stable
    trend_percentage DECIMAL(5,2),
    
    -- Analysis period
    analysis_date DATE NOT NULL,
    analysis_period VARCHAR(50), -- daily, weekly, monthly, quarterly
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_trend_direction CHECK (trend_direction IN ('improving', 'declining', 'stable'))
);

-- Corporate wellness ROI metrics
CREATE TABLE tenant_analytics.wellness_roi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_main.companies(id) ON DELETE CASCADE,
    
    -- Financial metrics
    healthcare_cost_reduction DECIMAL(12,2),
    productivity_increase_percent DECIMAL(5,2),
    absenteeism_reduction_percent DECIMAL(5,2),
    retention_improvement_percent DECIMAL(5,2),
    
    -- Wellness program costs
    program_investment DECIMAL(12,2),
    cost_per_employee DECIMAL(8,2),
    
    -- ROI calculations
    total_savings DECIMAL(12,2),
    net_roi_percent DECIMAL(5,2),
    payback_period_months INTEGER,
    
    -- Benchmarking
    industry_benchmark_roi DECIMAL(5,2),
    percentile_ranking INTEGER, -- 1-100
    
    -- Time period
    calculation_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDIT TABLES (Compliance & Security)
-- =============================================

-- Comprehensive audit log
CREATE TABLE tenant_audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenant_main.companies(id),
    
    -- User context
    user_id UUID,
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    session_id VARCHAR(255),
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changes_summary TEXT,
    
    -- Security
    risk_score INTEGER DEFAULT 0, -- 0-100
    flagged_for_review BOOLEAN DEFAULT FALSE,
    compliance_category VARCHAR(100),
    
    -- Temporal
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    duration_ms INTEGER
);

-- Security events
CREATE TABLE tenant_audit.security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenant_main.companies(id),
    
    -- Event classification
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'low',
    category VARCHAR(100),
    
    -- Event details
    description TEXT NOT NULL,
    affected_user_id UUID,
    affected_resource VARCHAR(255),
    
    -- Source information
    source_ip INET,
    source_location VARCHAR(255),
    user_agent TEXT,
    
    -- Detection
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detection_method VARCHAR(100),
    
    -- Response
    status VARCHAR(50) DEFAULT 'open',
    assigned_to UUID,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Risk assessment
    risk_score INTEGER, -- 0-100
    impact_assessment TEXT,
    
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_event_status CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive'))
);

-- =============================================
-- INTEGRATION TABLES
-- =============================================

-- Dr. Alex AI Integration tracking
CREATE TABLE tenant_integration.dralexai_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_main.companies(id) ON DELETE CASCADE,
    
    -- Session details
    session_token_encrypted TEXT NOT NULL,
    request_type VARCHAR(100) NOT NULL,
    
    -- Request/Response (encrypted)
    request_data_encrypted TEXT,
    response_data_encrypted TEXT,
    
    -- Analytics
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    model_version VARCHAR(50),
    
    -- Population health context
    employee_count INTEGER,
    anonymized_demographics JSONB,
    
    -- Temporal
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed',
    error_message TEXT,
    
    CONSTRAINT valid_dralexai_status CHECK (status IN ('pending', 'completed', 'failed', 'expired'))
);

-- SentimentAsAService Integration
CREATE TABLE tenant_integration.sentiment_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenant_main.companies(id) ON DELETE CASCADE,
    
    -- Analysis details
    analysis_type VARCHAR(100) NOT NULL,
    data_points_analyzed INTEGER,
    
    -- Results (encrypted)
    correlation_results_encrypted TEXT,
    insights_summary_encrypted TEXT,
    recommendations_encrypted TEXT,
    
    -- Metrics
    confidence_score DECIMAL(3,2),
    statistical_significance DECIMAL(3,2),
    
    -- Processing
    processing_time_ms INTEGER,
    api_version VARCHAR(20),
    
    -- Temporal
    analysis_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed',
    
    CONSTRAINT valid_sentiment_status CHECK (status IN ('pending', 'completed', 'failed'))
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Companies
CREATE INDEX idx_companies_domain ON tenant_main.companies (domain);
CREATE INDEX idx_companies_tier ON tenant_main.companies (tier);
CREATE INDEX idx_companies_status ON tenant_main.companies (status);

-- Employees
CREATE INDEX idx_employees_company_id ON tenant_main.employees (company_id);
CREATE INDEX idx_employees_email ON tenant_main.employees (email);
CREATE INDEX idx_employees_department ON tenant_main.employees (department);
CREATE INDEX idx_employees_status ON tenant_main.employees (account_status);

-- App Assignments
CREATE INDEX idx_app_assignments_employee_id ON tenant_main.app_assignments (employee_id);
CREATE INDEX idx_app_assignments_app_name ON tenant_main.app_assignments (app_name);
CREATE INDEX idx_app_assignments_status ON tenant_main.app_assignments (status);

-- Analytics
CREATE INDEX idx_engagement_metrics_tenant_date ON tenant_analytics.engagement_metrics (tenant_id, date_recorded);
CREATE INDEX idx_population_health_tenant_date ON tenant_analytics.population_health (tenant_id, analysis_date);

-- Audit logs
CREATE INDEX idx_audit_logs_tenant_timestamp ON tenant_audit.audit_logs (tenant_id, timestamp);
CREATE INDEX idx_audit_logs_user_action ON tenant_audit.audit_logs (user_id, action);
CREATE INDEX idx_security_events_tenant_severity ON tenant_audit.security_events (tenant_id, severity);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tenant tables
ALTER TABLE tenant_main.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_main.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_main.app_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_analytics.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_analytics.population_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_analytics.wellness_roi ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit.security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (to be implemented per tenant)
-- These will be dynamically created based on tenant context

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON tenant_main.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON tenant_main.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Encryption helper functions
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT, tenant_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, tenant_key, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT, tenant_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), tenant_key, 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INITIAL ADMIN USER SETUP
-- =============================================

-- System admin user (for platform management)
INSERT INTO tenant_main.companies (
    id, name, domain, tier, max_employees, encryption_key,
    primary_contact_email, primary_contact_name,
    subscription_tier, industry, company_size
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Ecosystem Intelligence Platform',
    'admin.ecosystem-intelligence.com',
    'enterprise',
    999999,
    'system-admin-encryption-key-change-in-production',
    'admin@ecosystem-intelligence.com',
    'System Administrator',
    'enterprise',
    'Healthcare Technology',
    'Platform'
) ON CONFLICT (domain) DO NOTHING;

-- =============================================
-- ANALYTICS VIEWS
-- =============================================

-- Tenant dashboard summary view
CREATE OR REPLACE VIEW tenant_analytics.dashboard_summary AS
SELECT 
    c.id as tenant_id,
    c.name as company_name,
    c.tier as subscription_tier,
    
    -- Employee counts
    COUNT(DISTINCT e.id) as total_employees,
    COUNT(DISTINCT CASE WHEN e.account_status = 'active' THEN e.id END) as active_employees,
    COUNT(DISTINCT CASE WHEN e.onboarded_at > NOW() - INTERVAL '30 days' THEN e.id END) as recently_onboarded,
    
    -- App usage
    COUNT(DISTINCT aa.id) as total_app_assignments,
    COUNT(DISTINCT aa.app_name) as unique_apps_used,
    
    -- Engagement
    AVG(em.engagement_score) as avg_engagement_score,
    COUNT(DISTINCT CASE WHEN em.date_recorded > NOW() - INTERVAL '7 days' THEN em.employee_id END) as active_last_week
    
FROM tenant_main.companies c
LEFT JOIN tenant_main.employees e ON c.id = e.company_id
LEFT JOIN tenant_main.app_assignments aa ON e.id = aa.employee_id AND aa.status = 'active'
LEFT JOIN tenant_analytics.engagement_metrics em ON c.id = em.tenant_id AND em.date_recorded > NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name, c.tier;

COMMENT ON SCHEMA tenant_main IS 'Core tenant and employee data with multi-tenant isolation';
COMMENT ON SCHEMA tenant_analytics IS 'Tenant-isolated analytics and engagement metrics';
COMMENT ON SCHEMA tenant_audit IS 'Comprehensive audit trails for compliance and security';
COMMENT ON SCHEMA tenant_integration IS 'Dr. Alex AI and SentimentAsAService integration tracking';