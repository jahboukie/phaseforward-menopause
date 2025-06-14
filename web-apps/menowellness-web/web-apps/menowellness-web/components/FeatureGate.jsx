// Feature gate component for subscription-based access control
import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useAuth } from '../contexts/AuthContext';

const FEATURE_INFO = {
  daily_symptom_tracking: {
    name: 'Daily Symptom Tracking',
    description: 'Track your menopause symptoms daily with comprehensive logging',
    requiredTier: 'basic',
    icon: '📊'
  },
  basic_ai_insights: {
    name: 'AI Insights',
    description: 'Get AI-powered insights about your symptom patterns',
    requiredTier: 'basic',
    icon: '🤖'
  },
  personalized_ai_recommendations: {
    name: 'Personalized Recommendations',
    description: 'Receive personalized AI recommendations for managing symptoms',
    requiredTier: 'complete',
    icon: '🎯'
  },
  advanced_tracking: {
    name: 'Advanced Tracking',
    description: 'Track medications, supplements, and detailed lifestyle factors',
    requiredTier: 'complete',
    icon: '💊'
  },
  partner_integration: {
    name: 'Partner Integration',
    description: 'Connect with SupportivePartner app for comprehensive couple support',
    requiredTier: 'complete',
    icon: '💑'
  },
  provider_data_sharing: {
    name: 'Provider Data Sharing',
    description: 'Share your symptom data securely with healthcare providers',
    requiredTier: 'complete',
    icon: '🏥'
  },
  weekly_ai_coaching: {
    name: 'Weekly AI Coaching',
    description: 'Get weekly personalized coaching sessions with Dr. Alex AI',
    requiredTier: 'ultimate',
    icon: '👩‍⚕️'
  }
};

const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic Support',
    price: '$9.99/month',
    color: 'blue'
  },
  complete: {
    name: 'Complete Care',
    price: '$19.99/month',
    color: 'pink'
  },
  ultimate: {
    name: 'Ultimate Wellness',
    price: '$29.99/month',
    color: 'purple'
  }
};

export default function FeatureGate({ feature, children, fallback = null }) {
  const { user } = useAuth();
  const { canAccessFeature, getUserTier } = useSubscription();

  // If user is not logged in
  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Sign In Required</h3>
        <p className="text-yellow-700 mb-4">
          Please sign in to access this feature.
        </p>
        <button
          onClick={() => window.location.href = '/auth'}
          className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // If user has access to the feature
  if (canAccessFeature(feature)) {
    return children;
  }

  // If fallback is provided, use it
  if (fallback) {
    return fallback;
  }

  // Show upgrade prompt
  const featureInfo = FEATURE_INFO[feature];
  const requiredPlan = SUBSCRIPTION_PLANS[featureInfo?.requiredTier];
  const currentTier = getUserTier();

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-8 text-center">
      <div className="text-6xl mb-4">{featureInfo?.icon || '🔒'}</div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {featureInfo?.name || 'Premium Feature'}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {featureInfo?.description || 'This feature requires a subscription upgrade.'}
      </p>

      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              requiredPlan?.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              requiredPlan?.color === 'pink' ? 'bg-pink-100 text-pink-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {requiredPlan?.name || 'Premium Plan'} Required
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-2">
              {requiredPlan?.price || 'Upgrade today'}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Current plan: <span className="font-semibold capitalize">{currentTier}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/subscription'}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              requiredPlan?.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
              requiredPlan?.color === 'pink' ? 'bg-pink-600 hover:bg-pink-700' :
              'bg-purple-600 hover:bg-purple-700'
            } text-white`}
          >
            Upgrade to {requiredPlan?.name || 'Premium'}
          </button>
          
          <button
            onClick={() => window.location.href = '/subscription'}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View All Plans
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        ✨ Upgrade anytime • Cancel anytime • 30-day money-back guarantee
      </div>
    </div>
  );
}

// Higher-order component version
export function withFeatureGate(Component, feature) {
  return function WrappedComponent(props) {
    return (
      <FeatureGate feature={feature}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}

// Hook for checking feature access in logic
export function useFeatureAccess(feature) {
  const { canAccessFeature, getUserTier } = useSubscription();
  const { user } = useAuth();

  return {
    hasAccess: user && canAccessFeature(feature),
    currentTier: getUserTier(),
    isLoggedIn: !!user,
    requiredTier: FEATURE_INFO[feature]?.requiredTier
  };
}