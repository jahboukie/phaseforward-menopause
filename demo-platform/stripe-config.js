// Stripe Configuration for MenoWellness Production
// This file contains the setup instructions and configuration for Stripe integration

/*
=== STRIPE DASHBOARD SETUP INSTRUCTIONS ===

1. Go to https://dashboard.stripe.com/products
2. Create these 3 subscription products:

PRODUCT 1: Basic Support
- Name: "MenoWellness Basic Support"
- Price: $9.99 USD
- Billing: Monthly recurring
- Price ID: Copy this after creation (e.g., price_xxx)

PRODUCT 2: Complete Care  
- Name: "MenoWellness Complete Care"
- Price: $19.99 USD
- Billing: Monthly recurring
- Price ID: Copy this after creation (e.g., price_xxx)

PRODUCT 3: Ultimate Wellness
- Name: "MenoWellness Ultimate Wellness" 
- Price: $29.99 USD
- Billing: Monthly recurring
- Price ID: Copy this after creation (e.g., price_xxx)

3. Get your API keys from https://dashboard.stripe.com/apikeys
- Publishable key (starts with pk_)
- Secret key (starts with sk_)

4. Set up webhook endpoint:
- URL: https://yourdomain.com/api/webhooks/stripe
- Events to listen for:
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
  - invoice.payment_succeeded
  - invoice.payment_failed
*/

// Environment Variables to Add
const STRIPE_CONFIG = {
  // Add these to your .env file:
  STRIPE_PUBLISHABLE_KEY: 'pk_live_xxx', // From Stripe Dashboard
  STRIPE_SECRET_KEY: 'sk_live_xxx',     // From Stripe Dashboard (keep secret!)
  STRIPE_WEBHOOK_SECRET: 'whsec_xxx',   // From webhook setup
  
  // Price IDs (from your Stripe Dashboard)
  PRICE_IDS: {
    BASIC: 'price_1RYF6XELGHd3NbdJCmqH4bIp',      // $9.99 Basic Support
    COMPLETE: 'price_1RYF80ELGHd3NbdJl8RZk76O',   // $19.99 Complete Care  
    ULTIMATE: 'price_1RYFBQELGHd3NbdJf7OlMQig'    // $29.99 Ultimate Wellness
  }
};

// Subscription tier mapping
const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic Support',
    price: 9.99,
    priceId: 'price_1RYF6XELGHd3NbdJCmqH4bIp',
    features: {
      dailySymptomTracking: true,
      basicAIInsights: true,
      personalizedAIRecommendations: false,
      partnerIntegration: false,
      providerDataSharing: false,
      weeklyAICoaching: false,
      maxSymptomEntries: 30,
      maxAIQueries: 10
    }
  },
  complete: {
    name: 'Complete Care',
    price: 19.99,
    priceId: 'price_1RYF80ELGHd3NbdJl8RZk76O',
    features: {
      dailySymptomTracking: true,
      basicAIInsights: true,
      personalizedAIRecommendations: true,
      partnerIntegration: true,
      providerDataSharing: true,
      weeklyAICoaching: false,
      maxSymptomEntries: 100,
      maxAIQueries: 50
    }
  },
  ultimate: {
    name: 'Ultimate Wellness',
    price: 29.99,
    priceId: 'price_1RYFBQELGHd3NbdJf7OlMQig',
    features: {
      dailySymptomTracking: true,
      basicAIInsights: true,
      personalizedAIRecommendations: true,
      partnerIntegration: true,
      providerDataSharing: true,
      weeklyAICoaching: true,
      maxSymptomEntries: -1, // unlimited
      maxAIQueries: -1       // unlimited
    }
  }
};

module.exports = {
  STRIPE_CONFIG,
  SUBSCRIPTION_TIERS
};