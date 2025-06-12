# DNS Configuration Guide - Namecheap to Vercel

## 🌐 Domain Mapping

### **Your Domains**
- **MenoWellness**: `www.phaseforward.app` (Namecheap)
- **SupportPartner**: `www.hotsupport.app` (Namecheap)

### **Existing Live Platforms**
- **SentimentAsAService**: `sentimentasaservice.com`
- **Dr. Alex AI**: `dralexai.com`

---

## ⚙️ Namecheap DNS Configuration

### **Step 1: Configure MenoWellness (phaseforward.app)**

**In Namecheap DNS Management:**

```
Type    Name    Value                           TTL
A       @       76.76.19.61                     300
CNAME   www     cname.vercel-dns.com.           300
CNAME   *       cname.vercel-dns.com.           300
```

**Alternative Vercel Method:**
```
Type    Name    Value                           TTL
CNAME   @       alias.vercel-dns.com.           300
CNAME   www     cname.vercel-dns.com.           300
```

### **Step 2: Configure SupportPartner (hotsupport.app)**

**In Namecheap DNS Management:**

```
Type    Name    Value                           TTL
A       @       76.76.19.61                     300
CNAME   www     cname.vercel-dns.com.           300
CNAME   *       cname.vercel-dns.com.           300
```

---

## 🚀 Vercel Domain Configuration

### **Step 1: Deploy Apps First**
```bash
# Deploy MenoWellness
cd web-apps/menowellness-web
vercel --prod

# Deploy SupportPartner
cd web-apps/supportivepartner-web
vercel --prod
```

### **Step 2: Add Custom Domains in Vercel Dashboard**

**For MenoWellness Project:**
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add domains:
   - `phaseforward.app`
   - `www.phaseforward.app`
3. Vercel will provide DNS instructions
4. Configure SSL (automatic)

**For SupportPartner Project:**
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add domains:
   - `hotsupport.app`
   - `www.hotsupport.app`
3. Vercel will provide DNS instructions
4. Configure SSL (automatic)

---

## 📋 Complete Deployment Checklist

### **Pre-Deployment**
- [ ] Namecheap domains ready: ✅ phaseforward.app, hotsupport.app
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Environment variables prepared

### **MenoWellness Deployment**
```bash
cd web-apps/menowellness-web

# 1. Test build
npm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Note the Vercel URL (e.g., menowellness-web-xyz.vercel.app)

# 4. Add custom domain in Vercel dashboard
# - Go to project settings → Domains
# - Add: phaseforward.app and www.phaseforward.app

# 5. Configure DNS in Namecheap
# - Use the exact DNS records Vercel provides
```

### **SupportPartner Deployment**
```bash
cd web-apps/supportivepartner-web

# 1. Test build (already confirmed working ✅)
npm run build

# 2. Deploy to Vercel
vercel --prod

# 3. Note the Vercel URL (e.g., supportivepartner-web-xyz.vercel.app)

# 4. Add custom domain in Vercel dashboard
# - Go to project settings → Domains
# - Add: hotsupport.app and www.hotsupport.app

# 5. Configure DNS in Namecheap
# - Use the exact DNS records Vercel provides
```

---

## 🎯 Updated VC Demo URLs

### **Complete Ecosystem Live URLs**
```
1. SentimentAsAService: https://sentimentasaservice.com
   └── Master data brain ($8,990-$24,990/month)

2. Dr. Alex AI: https://dralexai.com
   └── Provider platform ($299-$1,999/month)

3. MenoWellness: https://www.phaseforward.app
   └── Women's menopause platform ($9.99-$29.99/month)

4. SupportPartner: https://www.hotsupport.app
   └── Partner support platform ($9.99-$29.99/month)
```

---

## 🔧 Environment Variables for Production

### **MenoWellness (phaseforward.app)**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # Use live keys for production
VITE_SENTIMENTASASERVICE_API_KEY=saas_enterprise_key
VITE_DRALEXAI_API_KEY=dralexai_integration_key
VITE_API_BASE_URL=https://www.phaseforward.app
```

### **SupportPartner (hotsupport.app)**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # Use live keys for production
VITE_SENTIMENTASASERVICE_API_KEY=saas_enterprise_key
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_DRALEXAI_API_KEY=dralexai_integration_key
VITE_API_BASE_URL=https://www.hotsupport.app
STRIPE_SECRET_KEY=sk_live_... # Use live key for production
```

---

## ⚡ Quick Deploy Script

```bash
#!/bin/bash
echo "🚀 Deploying Complete Healthcare Intelligence Ecosystem"
echo ""
echo "Target URLs:"
echo "• MenoWellness: https://www.phaseforward.app"
echo "• SupportPartner: https://www.hotsupport.app"
echo ""

# Deploy MenoWellness
echo "📱 Deploying MenoWellness to phaseforward.app..."
cd web-apps/menowellness-web
npm run build && vercel --prod

# Deploy SupportPartner
echo "💝 Deploying SupportPartner to hotsupport.app..."
cd ../supportivepartner-web
npm run build && vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Add custom domains in Vercel dashboard"
echo "2. Configure DNS records in Namecheap"
echo "3. Wait for SSL certificates (5-10 minutes)"
echo "4. Test complete ecosystem integration"
echo ""
echo "🎉 Healthcare Intelligence Ecosystem LIVE!"
```

---

## 🎬 Updated VC Demo Flow

### **1. Master Data Brain (1 min)**
**URL**: https://sentimentasaservice.com
- "This is our master data brain processing 1.2M+ healthcare interactions"

### **2. Provider Intelligence (2 min)**  
**URL**: https://dralexai.com
- "Healthcare providers use this for $1,999/month clinical intelligence"

### **3. Patient Journey (2 min)**
**URL**: https://www.phaseforward.app
- "Women track their menopause journey here - 'Phase Forward' into wellness"

### **4. Partner Support (2 min)**
**URL**: https://www.hotsupport.app  
- "Their partners get 'Hot Support' - because menopause is hot flashes!"

### **5. Complete Integration (3 min)**
- Show data flowing between all 4 platforms
- Demonstrate insights impossible to get anywhere else

---

## 🚀 Execute Deployment

**Ready to go live with your branded domains?**

```bash
# 1. Deploy both apps
cd web-apps/menowellness-web && npm run build && vercel --prod
cd ../supportivepartner-web && npm run build && vercel --prod

# 2. Configure custom domains in Vercel dashboard
# 3. Set up DNS records in Namecheap
# 4. Test complete ecosystem

echo "🌟 www.phaseforward.app and www.hotsupport.app LIVE!"
```

The ecosystem is ready for your branded domains! 🎯