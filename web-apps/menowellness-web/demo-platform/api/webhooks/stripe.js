// Stripe Webhook Handler
// Handles subscription events from Stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

async function handleSubscriptionCreated(subscription) {
  const userId = subscription.metadata.userId;
  const tier = subscription.metadata.tier;
  
  console.log('Subscription created:', { userId, tier, subscriptionId: subscription.id });

  // Update user subscription in database
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      tier: tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      created_at: new Date(),
      updated_at: new Date()
    });

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  // Update user profile
  await supabase
    .from('users')
    .update({ 
      subscription_tier: tier,
      subscription_status: 'active',
      updated_at: new Date()
    })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(subscription) {
  const userId = subscription.metadata.userId;
  const tier = subscription.metadata.tier;
  
  console.log('Subscription updated:', { userId, tier, subscriptionId: subscription.id });

  // Update subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      tier: tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      updated_at: new Date()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  // Update user profile
  await supabase
    .from('users')
    .update({ 
      subscription_tier: tier,
      subscription_status: subscription.status,
      updated_at: new Date()
    })
    .eq('id', userId);
}

async function handleSubscriptionDeleted(subscription) {
  const userId = subscription.metadata.userId;
  
  console.log('Subscription deleted:', { userId, subscriptionId: subscription.id });

  // Update subscription status
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date(),
      updated_at: new Date()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating canceled subscription:', error);
    throw error;
  }

  // Update user profile to free tier
  await supabase
    .from('users')
    .update({ 
      subscription_tier: 'free',
      subscription_status: 'canceled',
      updated_at: new Date()
    })
    .eq('id', userId);
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  
  console.log('Payment succeeded for subscription:', subscriptionId);

  // Update subscription payment status
  await supabase
    .from('user_subscriptions')
    .update({
      last_payment_date: new Date(),
      payment_status: 'paid',
      updated_at: new Date()
    })
    .eq('stripe_subscription_id', subscriptionId);
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  console.log('Payment failed for subscription:', subscriptionId);

  // Update subscription payment status
  await supabase
    .from('user_subscriptions')
    .update({
      payment_status: 'failed',
      updated_at: new Date()
    })
    .eq('stripe_subscription_id', subscriptionId);

  // TODO: Send notification to user about failed payment
}