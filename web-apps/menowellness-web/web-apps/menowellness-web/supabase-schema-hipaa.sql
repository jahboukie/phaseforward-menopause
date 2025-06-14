-- HIPAA-Compliant Database Schema for MenoWellness
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create user profiles table with HIPAA compliance
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    date_of_birth DATE, -- PHI: Store only if necessary
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'complete', 'ultimate')),
    subscription_status TEXT DEFAULT 'inactive',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    privacy_consent BOOLEAN DEFAULT FALSE,
    hipaa_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    data_retention_consent BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription tracking table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    tier TEXT NOT NULL CHECK (tier IN ('basic', 'complete', 'ultimate')),
    status TEXT NOT NULL,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    last_payment_date TIMESTAMPTZ,
    payment_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create menopause symptoms table (PHI)
CREATE TABLE IF NOT EXISTS menopause_symptoms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Physical symptoms
    hot_flashes_count INTEGER DEFAULT 0 CHECK (hot_flashes_count >= 0),
    hot_flashes_severity INTEGER CHECK (hot_flashes_severity BETWEEN 1 AND 10),
    night_sweats BOOLEAN DEFAULT FALSE,
    irregular_periods BOOLEAN DEFAULT FALSE,
    vaginal_dryness BOOLEAN DEFAULT FALSE,
    weight_changes BOOLEAN DEFAULT FALSE,
    joint_pain BOOLEAN DEFAULT FALSE,
    headaches BOOLEAN DEFAULT FALSE,
    breast_tenderness BOOLEAN DEFAULT FALSE,
    
    -- Emotional/Mental symptoms
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
    anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
    depression_symptoms BOOLEAN DEFAULT FALSE,
    irritability BOOLEAN DEFAULT FALSE,
    brain_fog BOOLEAN DEFAULT FALSE,
    memory_issues BOOLEAN DEFAULT FALSE,
    
    -- Sleep and Energy
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    fatigue_level INTEGER CHECK (fatigue_level BETWEEN 1 AND 10),
    
    -- Additional tracking
    exercise_minutes INTEGER DEFAULT 0,
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
    medication_taken TEXT[], -- Array of medications
    supplements_taken TEXT[], -- Array of supplements
    
    -- Notes (encrypted at application level)
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one entry per user per date
    UNIQUE(user_id, date)
);

-- Create usage tracking for feature limits
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL,
    usage_date DATE NOT NULL,
    usage_count INTEGER DEFAULT 1,
    metadata JSONB, -- Additional usage data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feature_type, usage_date)
);

-- Create audit log table for HIPAA compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    user_id UUID REFERENCES auth.users(id),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id TEXT
);

-- Create security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create data export requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT DEFAULT 'full' CHECK (request_type IN ('full', 'symptoms', 'profile')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    file_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menopause_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for menopause_symptoms (strict PHI protection)
CREATE POLICY "Users can manage own symptoms" ON menopause_symptoms
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage" ON usage_tracking
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for audit_logs (service role only)
CREATE POLICY "Service role audit access" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for security_events (service role only)
CREATE POLICY "Service role security access" ON security_events
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for data_export_requests
CREATE POLICY "Users can manage own export requests" ON data_export_requests
    FOR ALL USING (auth.uid() = user_id);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            table_name, operation, user_id, record_id, old_data, timestamp
        ) VALUES (
            TG_TABLE_NAME, TG_OP, current_user_id, OLD.id, row_to_json(OLD), NOW()
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            table_name, operation, user_id, record_id, old_data, new_data, timestamp
        ) VALUES (
            TG_TABLE_NAME, TG_OP, current_user_id, NEW.id, row_to_json(OLD), row_to_json(NEW), NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            table_name, operation, user_id, record_id, new_data, timestamp
        ) VALUES (
            TG_TABLE_NAME, TG_OP, current_user_id, NEW.id, row_to_json(NEW), NOW()
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to PHI tables
CREATE TRIGGER audit_user_profiles
    AFTER INSERT OR UPDATE OR DELETE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_menopause_symptoms
    AFTER INSERT OR UPDATE OR DELETE ON menopause_symptoms
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_subscriptions
    AFTER INSERT OR UPDATE OR DELETE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id, 
        email, 
        full_name,
        privacy_consent,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'privacy_consent')::boolean, false),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function for data cleanup (HIPAA 7-year retention)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old audit logs (keep 7 years)
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '7 years';
    
    -- Delete old security events (keep 3 years)
    DELETE FROM security_events 
    WHERE created_at < NOW() - INTERVAL '3 years' AND resolved = true;
    
    -- Clean up expired export requests
    DELETE FROM data_export_requests 
    WHERE expires_at < NOW();
    
    -- Log cleanup action
    INSERT INTO audit_logs (table_name, operation, user_id, new_data)
    VALUES ('system', 'CLEANUP', NULL, jsonb_build_object('cleaned_at', NOW()));
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule monthly cleanup (requires pg_cron extension)
SELECT cron.schedule('hipaa-data-cleanup', '0 2 1 * *', 'SELECT cleanup_old_data();');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menopause_symptoms_user_date ON menopause_symptoms(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature_date ON usage_tracking(user_id, feature_type, usage_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menopause_symptoms_updated_at 
    BEFORE UPDATE ON menopause_symptoms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to check feature access based on subscription
CREATE OR REPLACE FUNCTION check_feature_access(
    user_id UUID,
    feature_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier TEXT;
    access_granted BOOLEAN := FALSE;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier
    FROM user_profiles
    WHERE id = user_id;
    
    -- Feature access logic
    CASE feature_name
        WHEN 'daily_symptom_tracking' THEN
            access_granted := user_tier IN ('basic', 'complete', 'ultimate');
        WHEN 'basic_ai_insights' THEN
            access_granted := user_tier IN ('basic', 'complete', 'ultimate');
        WHEN 'personalized_ai_recommendations' THEN
            access_granted := user_tier IN ('complete', 'ultimate');
        WHEN 'partner_integration' THEN
            access_granted := user_tier IN ('complete', 'ultimate');
        WHEN 'provider_data_sharing' THEN
            access_granted := user_tier IN ('complete', 'ultimate');
        WHEN 'weekly_ai_coaching' THEN
            access_granted := user_tier = 'ultimate';
        ELSE
            access_granted := FALSE;
    END CASE;
    
    RETURN access_granted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for user dashboard data (non-PHI summary)
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    up.id,
    up.subscription_tier,
    up.subscription_status,
    up.onboarding_completed,
    COUNT(ms.id) as total_symptom_entries,
    MAX(ms.date) as last_symptom_entry,
    COALESCE(AVG(ms.mood_rating), 0) as avg_mood_rating,
    COALESCE(AVG(ms.energy_level), 0) as avg_energy_level,
    up.created_at
FROM user_profiles up
LEFT JOIN menopause_symptoms ms ON up.id = ms.user_id 
    AND ms.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY up.id, up.subscription_tier, up.subscription_status, up.onboarding_completed, up.created_at;

-- Grant access to the view
GRANT SELECT ON user_dashboard_summary TO authenticated;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'HIPAA-compliant database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Enable HIPAA compliance in Supabase dashboard';
    RAISE NOTICE '2. Sign Business Associate Agreement';
    RAISE NOTICE '3. Configure encryption settings';
    RAISE NOTICE '4. Test RLS policies';
    RAISE NOTICE '5. Verify audit logging is working';
END
$$;