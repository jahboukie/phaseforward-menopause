// React component for managing MenoWellness subscriptions
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../contexts/AuthContext';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RB0ZzELGHd3NbdJjwtjOoYPrM0n2ZMrlMoEIodPQOopWDTxZj71L186iPaRLCEPxvecJllsZhIKcMDIbQcZbisU00M8rgsX5K');

const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Support',
    price: 9.99,
    priceId: 'price_1RYF6XELGHd3NbdJCmqH4bIp',
    features: [
      'Essential symptom tracking',
      'Basic AI insights',
      'Mood & energy monitoring',
      'Educational content library',
      'Progress tracking'
    ]
  },
  complete: {
    name: 'Complete Care',
    price: 19.99,
    priceId: 'price_1RYF80ELGHd3NbdJl8RZk76O',
    features: [
      'All Basic features',
      'Advanced symptom tracking',
      'Personalized AI recommendations',
      'HRT optimization guidance',
      'SupportivePartner integration',
      'Provider data sharing'
    ],
    popular: true
  },
  ultimate: {
    name: 'Ultimate Wellness',
    price: 29.99,
    priceId: 'price_1RYFBQELGHd3NbdJf7OlMQig',
    features: [
      'All Complete Care features',
      'Weekly AI coaching sessions',
      'Provider integration & alerts',
      'Advanced analytics & predictions',
      'Family support coordination',
      'Priority customer support'
    ]
  }
};

export default function SubscriptionManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState({});
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserSubscription();
    }
  }, [user]);

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/user-subscription', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });
      
      if (response.ok) {
        const subscription = await response.json();
        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (tier) => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    setLoading(prev => ({ ...prev, [tier]: true }));
    
    try {
      const plan = SUBSCRIPTION_PLANS[tier];
      
      // Create checkout session
      const response = await fetch('/api/stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          tier: tier
        })
      });

      const { sessionId, url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription process. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [tier]: false }));
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Failed to access billing portal. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view subscription options.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your MenoWellness Plan
        </h2>
        <p className="text-lg text-gray-600">
          Start your menopause wellness journey with the right level of support
        </p>
      </div>

      {userSubscription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Current Plan: {SUBSCRIPTION_PLANS[userSubscription.tier]?.name || 'Unknown'}
              </h3>
              <p className="text-green-600">
                Status: {userSubscription.status}
                {userSubscription.current_period_end && (
                  <span className="ml-2">
                    (Renews {new Date(userSubscription.current_period_end).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={handleManageBilling}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Manage Billing
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {Object.entries(SUBSCRIPTION_PLANS).map(([tier, plan]) => (
          <div
            key={tier}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
              plan.popular ? 'border-pink-500' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600 ml-2">per month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(tier)}
                disabled={loading[tier] || (userSubscription?.tier === tier && userSubscription?.status === 'active')}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  userSubscription?.tier === tier && userSubscription?.status === 'active'
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${loading[tier] ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading[tier] ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : userSubscription?.tier === tier && userSubscription?.status === 'active' ? (
                  'Current Plan'
                ) : (
                  `Start ${plan.name}`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          🔒 Secure payments powered by Stripe • Cancel anytime • HIPAA compliant
        </p>
        <p className="text-sm text-gray-500">
          All plans include 7-day free trial • No setup fees • Instant access
        </p>
      </div>
    </div>
  );
}