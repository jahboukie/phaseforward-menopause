#!/bin/bash

echo "🚀 Deploying MenoWellness to Vercel..."

# Navigate to MenoWellness directory
cd web-apps/menowellness-web

# Test build first
echo "📦 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    
    echo "🎉 MenoWellness deployment complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set environment variables in Vercel dashboard"
    echo "2. Configure custom domain (menowellness.health)"
    echo "3. Test payment integration"
    echo "4. Verify HIPAA compliance"
    
else
    echo "❌ Build failed. Please check errors above."
    exit 1
fi