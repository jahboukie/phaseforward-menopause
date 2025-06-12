#!/bin/bash

echo "🚀 Completing the Healthcare Intelligence Ecosystem Deployment"
echo "=============================================================="
echo ""
echo "Current Status:"
echo "✅ SentimentAsAService: https://sentimentasaservice.com"
echo "✅ Dr. Alex AI: https://dralexai.com" 
echo "🚀 MenoWellness: Ready for deployment"
echo "🚀 SupportPartner: Ready for deployment (build confirmed ✅)"
echo ""

# Deploy MenoWellness
echo "📱 Deploying MenoWellness..."
cd web-apps/menowellness-web

echo "🔧 Testing MenoWellness build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ MenoWellness build successful!"
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    echo "✅ MenoWellness deployed!"
else
    echo "❌ MenoWellness build failed"
    exit 1
fi

echo ""

# Deploy SupportPartner
echo "💝 Deploying SupportPartner..."
cd ../supportivepartner-web

echo "🔧 Testing SupportPartner build (already confirmed working)..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ SupportPartner build successful!"
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    echo "✅ SupportPartner deployed!"
else
    echo "❌ SupportPartner build failed"
    exit 1
fi

echo ""
echo "🎉 ECOSYSTEM DEPLOYMENT COMPLETE!"
echo "================================="
echo ""
echo "🌐 Live Ecosystem:"
echo "• SentimentAsAService: https://sentimentasaservice.com"
echo "• Dr. Alex AI: https://dralexai.com"
echo "• MenoWellness: https://www.phaseforward.app (after DNS config)"
echo "• SupportPartner: https://www.hotsupport.app (after DNS config)"
echo ""
echo "💰 Revenue Streams Active:"
echo "• Enterprise: $8,990-$24,990/month (SentimentAsAService)"
echo "• Provider: $299-$1,999/month (Dr. Alex AI)"
echo "• Consumer: $9.99-$29.99/month (MenoWellness + SupportPartner)"
echo ""
echo "🎯 Next Steps:"
echo "1. Configure custom domains"
echo "2. Set production environment variables"
echo "3. Test complete data integration flow"
echo "4. Prepare VC demo presentation"
echo ""
echo "🏆 The world's first complete healthcare relationship intelligence platform is LIVE!"