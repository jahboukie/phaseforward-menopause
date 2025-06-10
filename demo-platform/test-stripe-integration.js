// Quick test script to verify Stripe integration
// Run with: node test-stripe-integration.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_secret_key_here');

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe Integration...\n');

  try {
    // Test 1: Verify Price IDs exist
    console.log('1️⃣ Testing Price IDs...');
    
    const priceIds = [
      'price_1RYF6XELGHd3NbdJCmqH4bIp', // Basic $9.99
      'price_1RYF80ELGHd3NbdJl8RZk76O', // Complete $19.99
      'price_1RYFBQELGHd3NbdJf7OlMQig'  // Ultimate $29.99
    ];

    for (const priceId of priceIds) {
      try {
        const price = await stripe.prices.retrieve(priceId);
        console.log(`✅ ${priceId}: $${price.unit_amount / 100} ${price.currency.toUpperCase()} - ${price.recurring.interval}ly`);
      } catch (error) {
        console.log(`❌ ${priceId}: ${error.message}`);
      }
    }

    // Test 2: Create test checkout session
    console.log('\n2️⃣ Testing Checkout Session Creation...');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: 'price_1RYF80ELGHd3NbdJl8RZk76O', // Complete Care
          quantity: 1,
        },
      ],
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      metadata: {
        userId: 'test-user-123',
        tier: 'complete',
        app: 'menowellness'
      }
    });

    console.log(`✅ Checkout session created: ${session.id}`);
    console.log(`   URL: ${session.url}`);

    console.log('\n🎉 Stripe integration test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Set up webhook endpoint in Stripe Dashboard');
    console.log('   2. Run database schema in Supabase');
    console.log('   3. Update environment variables');
    console.log('   4. Test full subscription flow');

  } catch (error) {
    console.error('❌ Stripe integration test failed:', error.message);
  }
}

testStripeIntegration();