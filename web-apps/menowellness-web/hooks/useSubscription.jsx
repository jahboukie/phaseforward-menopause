// Subscription management hook with feature gating
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Subscription tiers and their features
const SUBSCRIPTION_FEATURES = {
  free: {
    dailySymptomTracking: false,
    basicAIInsights: false,
    personalizedAIRecommendations: false,
    advancedTracking: false,
    partnerIntegration: false,
    providerDataSharing: false,
    weeklyAICoaching: false,
    maxSymptomEntries: 0,
    maxAIQueries: 0
  },
  basic: {
    dailySymptomTracking: true,
    basicAIInsights: true,
    personalizedAIRecommendations: false,
    advancedTracking: false,
    partnerIntegration: false,
    providerDataSharing: false,
    weeklyAICoaching: false,
    maxSymptomEntries: 30,
    maxAIQueries: 10
  },
  complete: {
    dailySymptomTracking: true,
    basicAIInsights: true,
    personalizedAIRecommendations: true,
    advancedTracking: true,
    partnerIntegration: true,
    providerDataSharing: true,
    weeklyAICoaching: false,
    maxSymptomEntries: 100,
    maxAIQueries: 50
  },
  ultimate: {
    dailySymptomTracking: true,
    basicAIInsights: true,
    personalizedAIRecommendations: true,
    advancedTracking: true,
    partnerIntegration: true,
    providerDataSharing: true,
    weeklyAICoaching: true,
    maxSymptomEntries: -1, // unlimited
    maxAIQueries: -1 // unlimited
  }
};

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
      fetchUsage();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/user-subscription', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchUsage = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/usage', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const getUserTier = () => {
    if (!user) return 'free';
    return subscription?.tier || 'free';
  };

  const getFeatures = () => {
    const tier = getUserTier();
    return SUBSCRIPTION_FEATURES[tier] || SUBSCRIPTION_FEATURES.free;
  };

  const canAccessFeature = (featureName) => {
    const features = getFeatures();
    return features[featureName] || false;
  };

  const hasUsageRemaining = (featureType) => {
    const features = getFeatures();
    const limit = features[`max${featureType.charAt(0).toUpperCase() + featureType.slice(1)}`];
    
    if (limit === -1) return true; // unlimited
    if (limit === 0) return false; // not allowed
    
    const currentUsage = usage[featureType] || 0;
    return currentUsage < limit;
  };

  const trackUsage = async (featureType) => {
    if (!user) return;

    try {
      const response = await fetch('/api/track-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify({ featureType })
      });

      if (response.ok) {
        // Refresh usage data
        await fetchUsage();
      }
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  const getUsageInfo = (featureType) => {
    const features = getFeatures();
    const limit = features[`max${featureType.charAt(0).toUpperCase() + featureType.slice(1)}`];
    const current = usage[featureType] || 0;

    return {
      current,
      limit,
      remaining: limit === -1 ? 'unlimited' : Math.max(0, limit - current),
      percentage: limit === -1 ? 0 : (current / limit) * 100
    };
  };

  const value = {
    subscription,
    usage,
    loading,
    getUserTier,
    getFeatures,
    canAccessFeature,
    hasUsageRemaining,
    trackUsage,
    getUsageInfo,
    fetchSubscription,
    fetchUsage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}