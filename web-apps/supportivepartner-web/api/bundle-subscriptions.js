import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Bundle pricing configuration
const BUNDLE_PRICING = {
  COUPLES_BUNDLE: {
    priceId: 'price_couples_bundle_1999',
    amount: 1999, // $19.99 in cents
    name: 'Couples Bundle',
    description: 'MenoWellness Basic + SupportPartner Basic with enhanced features',
    features: {
      menoWellnessFeatures: [
        '50 symptom entries/month',
        '75 AI insights/month (shared pool)',
        'Basic health tracking',
        'Progress analytics',
        'Mood correlation insights'
      ],
      supportPartnerFeatures: [
        'Mama Grace AI guidance',
        'Advanced communication tips',
        'Educational content library',
        'Partner mood tracking',
        'Weekly check-ins'
      ],
      sharedFeatures: [
        'Cross-app insights & analytics',
        'Basic relationship health tracking',
        'Shared progress dashboard',
        'Partner connection alerts',
        'Family support integration'
      ]
    }
  },
  ULTIMATE_COUPLES: {
    priceId: 'price_ultimate_couples_2999',
    amount: 2999, // $29.99 in cents
    name: 'Ultimate Couples',
    description: 'Unlimited access with advanced analytics for both partners',
    features: {
      menoWellnessFeatures: [
        'Unlimited symptom entries',
        'Unlimited AI insights & queries',
        'Advanced health tracking',
        'Complete education library',
        'Advanced progress analytics'
      ],
      supportPartnerFeatures: [
        'Unlimited Mama Grace queries',
        'Complete education access',
        'Advanced communication guides',
        'Partner mood correlation',
        'Weekly relationship insights'
      ],
      sharedFeatures: [
        'Advanced relationship analytics',
        'Complete cross-app data sharing',
        'Enterprise analytics dashboard',
        'Advanced correlation insights',
        'Full family support integration'
      ]
    }
  }
};

// Create bundle subscription
router.post('/create-bundle', async (req, res) => {
  try {
    const { 
      paymentMethodId, 
      bundleTier, 
      primaryUserEmail, 
      partnerEmail,
      primaryUserId,
      partnerUserId 
    } = req.body;

    // Validate bundle tier
    if (!BUNDLE_PRICING[bundleTier]) {
      return res.status(400).json({
        error: 'Invalid bundle tier specified'
      });
    }

    const bundleConfig = BUNDLE_PRICING[bundleTier];

    // Create or get primary customer
    let primaryCustomer;
    try {
      const existingCustomers = await stripe.customers.list({
        email: primaryUserEmail,
        limit: 1
      });
      
      if (existingCustomers.data.length > 0) {
        primaryCustomer = existingCustomers.data[0];
      } else {
        primaryCustomer = await stripe.customers.create({
          email: primaryUserEmail,
          metadata: {
            userId: primaryUserId,
            appType: 'menowellness',
            bundleType: bundleTier
          }
        });
      }
    } catch (error) {
      console.error('Customer creation error:', error);
      return res.status(400).json({
        error: 'Failed to create customer'
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: primaryCustomer.id,
    });

    // Create bundle subscription
    const subscription = await stripe.subscriptions.create({
      customer: primaryCustomer.id,
      items: [{ price: bundleConfig.priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: 7, // 7-day free trial
      metadata: {
        bundleTier: bundleTier,
        primaryUserId: primaryUserId,
        partnerUserId: partnerUserId || '',
        primaryUserEmail: primaryUserEmail,
        partnerEmail: partnerEmail || '',
        createdAt: new Date().toISOString()
      }
    });

    // Store bundle subscription in database
    const { error: dbError } = await supabase
      .from('bundle_subscriptions')
      .insert({
        primary_user_id: primaryUserId,
        partner_user_id: partnerUserId,
        bundle_tier: bundleTier,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: primaryCustomer.id,
        primary_user_email: primaryUserEmail,
        partner_email: partnerEmail,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        created_at: new Date(),
        updated_at: new Date()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if DB insert fails - subscription is created in Stripe
    }

    res.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: primaryCustomer.id,
      status: subscription.status,
      trialEnd: subscription.trial_end,
      bundleTier: bundleTier,
      bundleFeatures: bundleConfig.features,
      client_secret: subscription.latest_invoice.payment_intent?.client_secret,
    });

  } catch (error) {
    console.error('Bundle subscription creation error:', error);
    res.status(400).json({
      error: error.message || 'Failed to create bundle subscription'
    });
  }
});

// Get bundle subscription status
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user has a bundle subscription
    const { data: bundleSubscription, error } = await supabase
      .from('bundle_subscriptions')
      .select('*')
      .or(`primary_user_id.eq.${userId},partner_user_id.eq.${userId}`)
      .eq('status', 'active')
      .single();

    if (error || !bundleSubscription) {
      return res.json({
        hasBundleSubscription: false,
        message: 'No active bundle subscription found'
      });
    }

    // Get Stripe subscription details
    const stripeSubscription = await stripe.subscriptions.retrieve(
      bundleSubscription.stripe_subscription_id
    );

    // Get bundle configuration
    const bundleConfig = BUNDLE_PRICING[bundleSubscription.bundle_tier];

    res.json({
      hasBundleSubscription: true,
      bundleSubscription: {
        id: bundleSubscription.id,
        bundleTier: bundleSubscription.bundle_tier,
        status: stripeSubscription.status,
        currentPeriodStart: stripeSubscription.current_period_start,
        currentPeriodEnd: stripeSubscription.current_period_end,
        trialEnd: stripeSubscription.trial_end,
        isPrimaryUser: bundleSubscription.primary_user_id === userId,
        partnerConnected: !!bundleSubscription.partner_user_id,
        bundleFeatures: bundleConfig?.features || {},
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
      }
    });

  } catch (error) {
    console.error('Bundle subscription status error:', error);
    res.status(400).json({
      error: error.message || 'Failed to fetch bundle subscription status'
    });
  }
});

// Link partner to existing bundle subscription
router.post('/link-partner', async (req, res) => {
  try {
    const { bundleSubscriptionId, partnerUserId, partnerEmail } = req.body;

    if (!bundleSubscriptionId || !partnerUserId) {
      return res.status(400).json({
        error: 'Bundle subscription ID and partner user ID are required'
      });
    }

    // Update bundle subscription with partner information
    const { data, error } = await supabase
      .from('bundle_subscriptions')
      .update({
        partner_user_id: partnerUserId,
        partner_email: partnerEmail,
        updated_at: new Date()
      })
      .eq('id', bundleSubscriptionId)
      .select()
      .single();

    if (error) {
      console.error('Partner linking error:', error);
      return res.status(400).json({
        error: 'Failed to link partner to bundle subscription'
      });
    }

    // Update Stripe subscription metadata
    await stripe.subscriptions.update(data.stripe_subscription_id, {
      metadata: {
        partnerUserId: partnerUserId,
        partnerEmail: partnerEmail || '',
        partnerLinkedAt: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: 'Partner successfully linked to bundle subscription',
      bundleSubscription: data
    });

  } catch (error) {
    console.error('Partner linking error:', error);
    res.status(400).json({
      error: error.message || 'Failed to link partner'
    });
  }
});

// Upgrade to bundle subscription
router.post('/upgrade-to-bundle', async (req, res) => {
  try {
    const { 
      currentSubscriptionId, 
      bundleTier, 
      userId, 
      userEmail,
      partnerUserId,
      partnerEmail 
    } = req.body;

    if (!BUNDLE_PRICING[bundleTier]) {
      return res.status(400).json({
        error: 'Invalid bundle tier specified'
      });
    }

    const bundleConfig = BUNDLE_PRICING[bundleTier];

    // Cancel current subscription
    if (currentSubscriptionId) {
      await stripe.subscriptions.update(currentSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    // Get or create customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
          bundleType: bundleTier
        }
      });
    }

    // Create new bundle subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: bundleConfig.priceId }],
      trial_period_days: 7,
      metadata: {
        bundleTier: bundleTier,
        primaryUserId: userId,
        partnerUserId: partnerUserId || '',
        primaryUserEmail: userEmail,
        partnerEmail: partnerEmail || '',
        upgradedFrom: currentSubscriptionId || '',
        createdAt: new Date().toISOString()
      }
    });

    // Store in database
    const { error: dbError } = await supabase
      .from('bundle_subscriptions')
      .insert({
        primary_user_id: userId,
        partner_user_id: partnerUserId,
        bundle_tier: bundleTier,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        primary_user_email: userEmail,
        partner_email: partnerEmail,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        created_at: new Date(),
        updated_at: new Date()
      });

    if (dbError) {
      console.error('Database error during upgrade:', dbError);
    }

    res.json({
      success: true,
      message: 'Successfully upgraded to bundle subscription',
      subscriptionId: subscription.id,
      bundleTier: bundleTier,
      bundleFeatures: bundleConfig.features
    });

  } catch (error) {
    console.error('Bundle upgrade error:', error);
    res.status(400).json({
      error: error.message || 'Failed to upgrade to bundle subscription'
    });
  }
});

// Cancel bundle subscription
router.post('/cancel-bundle', async (req, res) => {
  try {
    const { subscriptionId, userId } = req.body;

    if (!subscriptionId || !userId) {
      return res.status(400).json({
        error: 'Subscription ID and user ID are required'
      });
    }

    // Verify user has permission to cancel this subscription
    const { data: bundleSubscription, error } = await supabase
      .from('bundle_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .or(`primary_user_id.eq.${userId},partner_user_id.eq.${userId}`)
      .single();

    if (error || !bundleSubscription) {
      return res.status(403).json({
        error: 'Unauthorized to cancel this subscription'
      });
    }

    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    await supabase
      .from('bundle_subscriptions')
      .update({
        status: 'cancel_at_period_end',
        updated_at: new Date()
      })
      .eq('stripe_subscription_id', subscriptionId);

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
      }
    });

  } catch (error) {
    console.error('Bundle cancellation error:', error);
    res.status(400).json({
      error: error.message || 'Failed to cancel bundle subscription'
    });
  }
});

// Get bundle pricing and features
router.get('/pricing', (req, res) => {
  res.json({
    success: true,
    bundlePricing: BUNDLE_PRICING,
    recommendations: {
      mostPopular: 'COUPLES_BUNDLE',
      bestValue: 'ULTIMATE_COUPLES',
      savings: {
        COUPLES_BUNDLE: {
          individualPrice: 15.98, // $5.99 + $9.99
          bundlePrice: 19.99,
          savings: -4.01, // Actually costs more but includes extra features
          extraValue: 'Cross-app insights + Relationship analytics'
        },
        ULTIMATE_COUPLES: {
          individualPrice: 35.98, // $5.99 + $29.99
          bundlePrice: 29.99,
          savings: 5.99
        }
      }
    }
  });
});

export default router;