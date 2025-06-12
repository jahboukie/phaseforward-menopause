#!/bin/bash

echo "🚀 Deploying SupportPartner to Vercel..."

# Navigate to SupportPartner directory
cd web-apps/supportivepartner-web

# Test build first (we know this works)
echo "📦 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 SupportPartner deployment complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Vercel dashboard"
    echo "2. Configure custom domain (supportpartner.health)"
    echo "3. Test Mama Grace AI integration"
    echo "4. Verify Stripe payment flow"
    echo "5. Test cross-app correlation with MenoWellness"
    
else
    echo "❌ Build failed. Please check errors above."
    exit 1
fi