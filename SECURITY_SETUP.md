# 🔒 **SECURITY SETUP GUIDE**

## 🚨 **IMMEDIATE SECURITY ACTIONS REQUIRED**

### **1. REGENERATE THE KEY YOU JUST SHARED**
The Supabase key you shared in chat is now compromised. **Regenerate it immediately:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to: **Settings > API**
3. Click **"Generate new anon key"**
4. Update your `.env` file with the NEW key
5. **Do NOT share the new key anywhere**

### **2. VERIFY OLD KEY IS DISABLED**
To check if the old exposed key is disabled:

```bash
# Test the old key (should fail):
curl -X GET 'https://xnxovbqqpdrmjzufevhe.supabase.co/rest/v1/' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueG92YnFxcGRybWp6dWZldmhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTQzMzczNCwiZXhwIjoyMDY1MDA5NzM0fQ.BCxuAfYP3aIpd5ZrMJ1fbY7mPJLRmMDJGeRIvLPhgtU"

# If it returns 401 or 403, the key is disabled ✅
# If it returns 200, the key is still active ⚠️
```

## 🛡️ **SECURE ENVIRONMENT VARIABLE MANAGEMENT**

### **Step 1: Create Secure .gitignore**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

### **Step 2: Use Environment-Specific Files**
```
.env.example          # Template (commit this)
.env                  # Local development (NEVER commit)
.env.production       # Production values (NEVER commit)
.env.staging          # Staging values (NEVER commit)
```

### **Step 3: Secure Production Deployment**

#### **Option A: Vercel/Netlify**
1. Add environment variables in dashboard
2. Never include in code
3. Use build-time injection

#### **Option B: Docker**
```dockerfile
# In Dockerfile
ENV NODE_ENV=production
# Variables passed at runtime, not build time
```

#### **Option C: Server Deployment**
```bash
# Create secure .env on server
sudo nano /var/www/your-app/.env
# Set proper permissions
sudo chmod 600 /var/www/your-app/.env
sudo chown www-data:www-data /var/www/your-app/.env
```

## 🔐 **SECURITY BEST PRACTICES**

### **1. Key Rotation Schedule**
- **JWT Secrets**: Rotate every 90 days
- **API Keys**: Rotate every 30 days
- **Database Passwords**: Rotate every 60 days

### **2. Access Control**
```bash
# Create separate keys for different environments
SUPABASE_ANON_KEY_DEV=...
SUPABASE_ANON_KEY_STAGING=...
SUPABASE_ANON_KEY_PROD=...
```

### **3. Monitoring**
- Set up Supabase audit logs
- Monitor unusual API usage
- Alert on failed authentication attempts

### **4. Backup Security**
```bash
# Encrypt environment backups
gpg --symmetric --cipher-algo AES256 .env.production
# Results in .env.production.gpg (safe to store)
```

## 🚀 **RECOMMENDED SETUP FOR YOUR ECOSYSTEM**

### **Development Environment:**
```bash
# .env (local only)
NODE_ENV=development
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
JWT_SECRET=dev-secret-key
```

### **Production Environment:**
```bash
# Deployed via secure environment variable injection
NODE_ENV=production
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
JWT_SECRET=your-strong-prod-jwt-secret
```

## ✅ **VERIFICATION CHECKLIST**

- [ ] Old Supabase key is disabled/regenerated
- [ ] New key is not shared anywhere
- [ ] .env is in .gitignore
- [ ] .env.example exists with placeholders
- [ ] Production environment variables are secure
- [ ] No hardcoded secrets in code
- [ ] Separate keys for dev/staging/prod
- [ ] Monitoring/alerts configured

## 🆘 **IF KEYS ARE COMPROMISED AGAIN**

1. **Immediately regenerate ALL keys**
2. **Revoke old keys in provider dashboard**
3. **Check access logs for suspicious activity**
4. **Update all environments**
5. **Notify team members**

---

**Remember: Security is not a one-time setup - it's an ongoing practice!**