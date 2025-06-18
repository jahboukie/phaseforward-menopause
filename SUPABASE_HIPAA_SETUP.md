# Supabase HIPAA Compliance Setup Guide

## 🏥 **HIPAA Requirements for MenoWellness**

Since MenoWellness handles Protected Health Information (PHI), we need to ensure full HIPAA compliance.

## 🔐 **Step 1: Enable HIPAA Features in Supabase**

### **1.1 Upgrade to Pro Plan (if not already)**
- Go to: https://app.supabase.com/project/your-project/settings/billing
- Ensure you're on **Pro plan** ($25/month) - HIPAA features require Pro
- ✅ You mentioned you already have this!

### **1.2 Enable HIPAA Compliance**
1. Go to: https://app.supabase.com/project/your-project/settings/general
2. Look for **"HIPAA Compliance"** section
3. Click **"Enable HIPAA Compliance"**
4. Review and accept the Business Associate Agreement (BAA)

### **1.3 Configure Encryption Settings**
1. Go to: Settings > Security
2. Enable **"Encryption at Rest"** (should be automatic with HIPAA)
3. Configure **"Database Encryption"** with custom keys if available

## 🛡️ **Step 2: Database Security Configuration**

### **2.1 Row Level Security (RLS)**
Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables with PHI
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE menopause_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Strict user isolation policies
CREATE POLICY "users_own_data_only" ON user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "symptoms_own_data_only" ON menopause_symptoms
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_own_data_only" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Service role access for webhooks
CREATE POLICY "service_role_access" ON user_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "service_usage_tracking" ON usage_tracking
    FOR ALL USING (auth.role() = 'service_role');
```

### **2.2 Audit Logging**
```sql
-- Create audit log table
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "audit_service_only" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, operation, user_id, old_data)
        VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, operation, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, operation, user_id, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), row_to_json(NEW));
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
```

## 🔒 **Step 3: Data Retention & Deletion**

```sql
-- Data retention function (7 years for HIPAA)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old audit logs (keep 7 years)
    DELETE FROM audit_logs 
    WHERE timestamp < NOW() - INTERVAL '7 years';
    
    -- Archive old symptoms data (configurable)
    -- This is an example - customize based on your needs
    UPDATE menopause_symptoms 
    SET notes = '[ARCHIVED]'
    WHERE created_at < NOW() - INTERVAL '5 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run monthly)
SELECT cron.schedule('cleanup-old-data', '0 0 1 * *', 'SELECT cleanup_old_data();');
```

## 🛠️ **Step 4: Application-Level Security**

### **4.1 Environment Variables for HIPAA**
Add to your `.env.local`:

```env
# HIPAA Compliance Settings
ENABLE_HIPAA_LOGGING=true
DATA_RETENTION_YEARS=7
REQUIRE_2FA=false
ENABLE_SESSION_TIMEOUT=true
SESSION_TIMEOUT_MINUTES=30

# Audit Settings
AUDIT_ALL_ACTIONS=true
LOG_IP_ADDRESSES=true
LOG_USER_AGENTS=true
```

### **4.2 HIPAA Middleware**
Create `middleware/hipaa-compliance.js`:

```javascript
// HIPAA compliance middleware
export function hipaaMiddleware(req, res, next) {
  // Log all PHI access
  if (req.url.includes('/api/symptoms') || req.url.includes('/api/profile')) {
    console.log(`PHI Access: ${req.method} ${req.url} by ${req.user?.id} from ${req.ip}`);
  }
  
  // Session timeout enforcement
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  if (req.session?.lastActivity && Date.now() - req.session.lastActivity > sessionTimeout) {
    return res.status(401).json({ error: 'Session expired for security' });
  }
  
  next();
}
```

## 📋 **Step 5: HIPAA Compliance Checklist**

### **Technical Safeguards**
- [ ] Encryption at rest enabled
- [ ] Encryption in transit (HTTPS only)
- [ ] Row Level Security implemented
- [ ] Audit logging enabled
- [ ] Session management with timeouts
- [ ] Data backup encryption
- [ ] Access controls and authentication

### **Administrative Safeguards**
- [ ] Business Associate Agreement signed with Supabase
- [ ] Data retention policies defined
- [ ] Incident response plan created
- [ ] Staff training on HIPAA compliance
- [ ] Regular security assessments

### **Physical Safeguards**
- [ ] Supabase data centers are SOC 2 compliant
- [ ] Physical access controls (handled by Supabase)
- [ ] Workstation security guidelines

## 🚨 **Step 6: Data Breach Response Plan**

```javascript
// Breach detection and response
export async function detectPotentialBreach(userId, actionType) {
  const suspiciousActions = [
    'bulk_data_download',
    'rapid_sequential_access',
    'unusual_time_access'
  ];
  
  if (suspiciousActions.includes(actionType)) {
    // Log security event
    await supabase.from('security_events').insert({
      user_id: userId,
      event_type: 'potential_breach',
      details: actionType,
      timestamp: new Date()
    });
    
    // Alert security team
    // await sendSecurityAlert(userId, actionType);
  }
}
```

## ✅ **Verification Steps**

1. **Test RLS**: Try accessing another user's data (should fail)
2. **Check Audit Logs**: Verify all actions are logged
3. **Test Session Timeout**: Leave session idle and confirm logout
4. **Verify Encryption**: Check Supabase dashboard for encryption status
5. **Review BAA**: Ensure Business Associate Agreement is signed

## 📞 **HIPAA Support**

- **Supabase HIPAA Support**: support@supabase.com
- **Documentation**: https://supabase.com/docs/guides/platform/hipaa
- **Security Center**: https://app.supabase.com/project/your-project/settings/security

## ⚖️ **Legal Considerations**

- Obtain legal review of your privacy policy
- Ensure patient consent forms are HIPAA compliant
- Consider cyber liability insurance
- Regular HIPAA compliance audits
- Staff training and certification

Remember: HIPAA compliance is ongoing, not a one-time setup!