-- Bundle Subscriptions Table
-- Handles shared subscriptions between MenoWellness and SupportPartner apps

CREATE TABLE IF NOT EXISTS bundle_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User References
  primary_user_id UUID NOT NULL, -- MenoWellness user
  partner_user_id UUID, -- SupportPartner user (can be null initially)
  
  -- Subscription Details
  bundle_tier TEXT NOT NULL CHECK (bundle_tier IN ('couples_bundle', 'ultimate_couples')),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Contact Information
  primary_user_email TEXT NOT NULL,
  partner_email TEXT,
  
  -- Subscription Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'cancel_at_period_end')),
  
  -- Billing Periods
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_end TIMESTAMPTZ,
  
  -- Feature Usage Tracking
  shared_ai_queries_used INTEGER DEFAULT 0,
  shared_ai_queries_limit INTEGER DEFAULT 100,
  
  -- Bundle-specific Features
  cross_app_insights_enabled BOOLEAN DEFAULT true,
  relationship_analytics_enabled BOOLEAN DEFAULT true,
  priority_support_enabled BOOLEAN DEFAULT false,
  couples_therapy_tools_enabled BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_bundle_tier CHECK (bundle_tier IN ('couples_bundle', 'ultimate_couples')),
  CONSTRAINT positive_query_limits CHECK (shared_ai_queries_limit >= 0),
  CONSTRAINT valid_usage CHECK (shared_ai_queries_used >= 0 AND shared_ai_queries_used <= COALESCE(NULLIF(shared_ai_queries_limit, -1), 999999))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bundle_subscriptions_primary_user ON bundle_subscriptions(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_subscriptions_partner_user ON bundle_subscriptions(partner_user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_subscriptions_stripe_id ON bundle_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_bundle_subscriptions_status ON bundle_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_bundle_subscriptions_bundle_tier ON bundle_subscriptions(bundle_tier);

-- RLS (Row Level Security) Policies
ALTER TABLE bundle_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own bundle subscriptions
CREATE POLICY "Users can read own bundle subscriptions" ON bundle_subscriptions
  FOR SELECT USING (
    auth.uid()::text = primary_user_id::text OR 
    auth.uid()::text = partner_user_id::text
  );

-- Primary users can insert bundle subscriptions
CREATE POLICY "Primary users can create bundle subscriptions" ON bundle_subscriptions
  FOR INSERT WITH CHECK (auth.uid()::text = primary_user_id::text);

-- Users can update their own bundle subscriptions
CREATE POLICY "Users can update own bundle subscriptions" ON bundle_subscriptions
  FOR UPDATE USING (
    auth.uid()::text = primary_user_id::text OR 
    auth.uid()::text = partner_user_id::text
  );

-- Partner Connection Invites Table
-- Handles partner invitation flow for bundle subscriptions
CREATE TABLE IF NOT EXISTS bundle_partner_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Invitation Details
  bundle_subscription_id UUID REFERENCES bundle_subscriptions(id) ON DELETE CASCADE,
  inviter_user_id UUID NOT NULL, -- User who sent the invite
  invite_code TEXT UNIQUE NOT NULL, -- Unique code for partner to join
  
  -- Partner Information
  partner_email TEXT NOT NULL,
  partner_user_id UUID, -- Set when partner accepts invite
  
  -- Invitation Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'canceled')),
  
  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_invite_status CHECK (status IN ('pending', 'accepted', 'expired', 'canceled'))
);

-- Indexes for partner invites
CREATE INDEX IF NOT EXISTS idx_partner_invites_bundle_subscription ON bundle_partner_invites(bundle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_partner_invites_code ON bundle_partner_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_partner_invites_email ON bundle_partner_invites(partner_email);
CREATE INDEX IF NOT EXISTS idx_partner_invites_status ON bundle_partner_invites(status);

-- RLS for partner invites
ALTER TABLE bundle_partner_invites ENABLE ROW LEVEL SECURITY;

-- Users can read invites they sent or received
CREATE POLICY "Users can read relevant partner invites" ON bundle_partner_invites
  FOR SELECT USING (
    auth.uid()::text = inviter_user_id::text OR
    auth.uid()::text = partner_user_id::text OR
    auth.email() = partner_email
  );

-- Inviter can create invites
CREATE POLICY "Inviters can create partner invites" ON bundle_partner_invites
  FOR INSERT WITH CHECK (auth.uid()::text = inviter_user_id::text);

-- Users can update invites they're involved with
CREATE POLICY "Users can update relevant partner invites" ON bundle_partner_invites
  FOR UPDATE USING (
    auth.uid()::text = inviter_user_id::text OR
    auth.uid()::text = partner_user_id::text
  );

-- Bundle Usage Tracking Table
-- Tracks shared usage across both apps
CREATE TABLE IF NOT EXISTS bundle_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  bundle_subscription_id UUID REFERENCES bundle_subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Which user made the request
  
  -- Usage Details
  feature_type TEXT NOT NULL, -- 'ai_query', 'symptom_entry', 'insight_generation', etc.
  app_source TEXT NOT NULL CHECK (app_source IN ('menowellness', 'supportpartner')),
  usage_count INTEGER DEFAULT 1,
  
  -- Metadata
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_usage_count CHECK (usage_count > 0),
  CONSTRAINT valid_app_source CHECK (app_source IN ('menowellness', 'supportpartner'))
);

-- Indexes for usage tracking
CREATE INDEX IF NOT EXISTS idx_bundle_usage_subscription ON bundle_usage_tracking(bundle_subscription_id);
CREATE INDEX IF NOT EXISTS idx_bundle_usage_user ON bundle_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_usage_date ON bundle_usage_tracking(usage_date);
CREATE INDEX IF NOT EXISTS idx_bundle_usage_feature ON bundle_usage_tracking(feature_type);
CREATE INDEX IF NOT EXISTS idx_bundle_usage_app ON bundle_usage_tracking(app_source);

-- RLS for usage tracking
ALTER TABLE bundle_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can read usage for their bundle subscriptions
CREATE POLICY "Users can read bundle usage" ON bundle_usage_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bundle_subscriptions bs 
      WHERE bs.id = bundle_subscription_id 
      AND (bs.primary_user_id::text = auth.uid()::text OR bs.partner_user_id::text = auth.uid()::text)
    )
  );

-- Users can insert their own usage
CREATE POLICY "Users can track their bundle usage" ON bundle_usage_tracking
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Functions for bundle management

-- Function to get current bundle usage
CREATE OR REPLACE FUNCTION get_bundle_usage_summary(bundle_sub_id UUID)
RETURNS JSON AS $$
DECLARE
  usage_summary JSON;
BEGIN
  SELECT json_build_object(
    'total_ai_queries', COALESCE(SUM(CASE WHEN feature_type = 'ai_query' THEN usage_count ELSE 0 END), 0),
    'menowellness_queries', COALESCE(SUM(CASE WHEN feature_type = 'ai_query' AND app_source = 'menowellness' THEN usage_count ELSE 0 END), 0),
    'supportpartner_queries', COALESCE(SUM(CASE WHEN feature_type = 'ai_query' AND app_source = 'supportpartner' THEN usage_count ELSE 0 END), 0),
    'current_period_start', (SELECT current_period_start FROM bundle_subscriptions WHERE id = bundle_sub_id),
    'current_period_end', (SELECT current_period_end FROM bundle_subscriptions WHERE id = bundle_sub_id),
    'queries_limit', (SELECT shared_ai_queries_limit FROM bundle_subscriptions WHERE id = bundle_sub_id)
  ) INTO usage_summary
  FROM bundle_usage_tracking 
  WHERE bundle_subscription_id = bundle_sub_id 
  AND usage_date >= (SELECT current_period_start::date FROM bundle_subscriptions WHERE id = bundle_sub_id)
  AND usage_date <= (SELECT current_period_end::date FROM bundle_subscriptions WHERE id = bundle_sub_id);
  
  RETURN usage_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can make AI query
CREATE OR REPLACE FUNCTION can_use_bundle_ai_query(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  bundle_sub bundle_subscriptions%ROWTYPE;
  current_usage INTEGER;
BEGIN
  -- Get user's bundle subscription
  SELECT * INTO bundle_sub
  FROM bundle_subscriptions
  WHERE (primary_user_id = user_uuid OR partner_user_id = user_uuid)
  AND status = 'active'
  LIMIT 1;
  
  -- If no bundle subscription, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If unlimited queries (-1), return true
  IF bundle_sub.shared_ai_queries_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Count current period usage
  SELECT COALESCE(SUM(usage_count), 0) INTO current_usage
  FROM bundle_usage_tracking
  WHERE bundle_subscription_id = bundle_sub.id
  AND feature_type = 'ai_query'
  AND usage_date >= bundle_sub.current_period_start::date
  AND usage_date <= bundle_sub.current_period_end::date;
  
  -- Check if under limit
  RETURN current_usage < bundle_sub.shared_ai_queries_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track bundle AI query usage
CREATE OR REPLACE FUNCTION track_bundle_ai_query(user_uuid UUID, app_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  bundle_sub_id UUID;
BEGIN
  -- Get user's bundle subscription ID
  SELECT id INTO bundle_sub_id
  FROM bundle_subscriptions
  WHERE (primary_user_id = user_uuid OR partner_user_id = user_uuid)
  AND status = 'active'
  LIMIT 1;
  
  -- If no bundle subscription, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Insert usage record
  INSERT INTO bundle_usage_tracking (
    bundle_subscription_id,
    user_id,
    feature_type,
    app_source,
    usage_count
  ) VALUES (
    bundle_sub_id,
    user_uuid,
    'ai_query',
    app_name,
    1
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update bundle subscription updated_at
CREATE OR REPLACE FUNCTION update_bundle_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bundle_subscriptions_updated_at
  BEFORE UPDATE ON bundle_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_bundle_subscription_timestamp();

-- Comments for documentation
COMMENT ON TABLE bundle_subscriptions IS 'Stores shared subscription information for MenoWellness + SupportPartner bundles';
COMMENT ON TABLE bundle_partner_invites IS 'Manages partner invitation flow for bundle subscriptions';
COMMENT ON TABLE bundle_usage_tracking IS 'Tracks shared feature usage across both apps in bundle subscriptions';
COMMENT ON FUNCTION get_bundle_usage_summary(UUID) IS 'Returns current billing period usage summary for a bundle subscription';
COMMENT ON FUNCTION can_use_bundle_ai_query(UUID) IS 'Checks if user has remaining AI queries in their bundle subscription';
COMMENT ON FUNCTION track_bundle_ai_query(UUID, TEXT) IS 'Records an AI query usage for bundle subscription tracking';