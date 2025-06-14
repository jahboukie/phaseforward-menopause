import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckIcon } from '@heroicons/react/24/outline';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Support',
    price: 9.99,
    priceId: 'price_basic_monthly',
    description: 'Essential menopause tracking and basic AI guidance',
    features: [
      'Daily symptom tracking',
      'Basic AI insights',
      'Mood and energy monitoring',
      'Educational content library',
      'Progress tracking'
    ]
  },
  {
    id: 'premium',
    name: 'Complete Care',
    price: 19.99,
    priceId: 'price_premium_monthly',
    description: 'Comprehensive menopause support with personalized care',
    features: [
      'Advanced symptom tracking',
      'Personalized AI recommendations',
      'HRT optimization guidance',
      'Nutrition and exercise plans',
      'Sleep quality monitoring',
      'Stress management tools',
      'Priority customer support'
    ],
    popular: true
  },
  {
    id: 'ultimate',
    name: 'Ultimate Wellness',
    price: 29.99,
    priceId: 'price_ultimate_monthly',
    description: 'Complete menopause wellness with premium features',
    features: [
      'Everything in Complete Care',
      'Weekly AI wellness coaching',
      'Provider integration support',
      'Advanced analytics dashboard',
      'Custom meal planning',
      'Live expert consultations',
      'Family support resources'
    ]
  }
];

interface CheckoutFormProps {
  selectedPlan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ selectedPlan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      setIsLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh and try again.');
      setIsLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (paymentError) {
        setError(paymentError.message || 'An error occurred with your payment method.');
        setIsLoading(false);
        return;
      }

      // Create subscription
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId: selectedPlan.priceId,
        }),
      });

      const subscription = await response.json();

      if (subscription.error) {
        setError(subscription.error);
        setIsLoading(false);
        return;
      }

      // Handle subscription confirmation if needed
      if (subscription.status === 'requires_action') {
        const { error: confirmError } = await stripe.confirmCardPayment(
          subscription.client_secret
        );

        if (confirmError) {
          setError(confirmError.message || 'Payment confirmation failed.');
          setIsLoading(false);
          return;
        }
      }

      onSuccess();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Complete Your Subscription
        </h3>
        <div className="bg-pink-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-pink-900 font-medium">{selectedPlan.name}</span>
            <span className="text-pink-900 font-bold">${selectedPlan.price}/month</span>
          </div>
          <p className="text-pink-700 text-sm mt-1">{selectedPlan.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Information
          </label>
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isLoading}
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : `Subscribe for $${selectedPlan.price}/month`}
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Your subscription will automatically renew monthly. Cancel anytime in your account settings.
      </p>
    </div>
  );
};

const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
    // Redirect to dashboard or show success message
    window.location.href = '/dashboard';
  };

  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setSelectedPlan(null);
  };

  if (showCheckout && selectedPlan) {
    return (
      <Elements stripe={stripePromise}>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CheckoutForm
              selectedPlan={selectedPlan}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCheckoutCancel}
            />
          </div>
        </div>
      </Elements>
    );
  }

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose Your Menopause Support Plan
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get personalized AI-powered guidance for your menopause journey
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? 'border-pink-500 shadow-lg ring-2 ring-pink-500'
                  : 'border-gray-200 shadow-sm'
              } bg-white p-8`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-lg text-gray-600">/month</span>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-pink-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`mt-8 w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                    : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            All plans include a 7-day free trial. No commitment, cancel anytime.
          </p>
          <div className="mt-4 flex justify-center items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
              Secure payments
            </span>
            <span className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
              Cancel anytime
            </span>
            <span className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
              24/7 support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;