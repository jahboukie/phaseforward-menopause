import React from 'react'
import { useSubscription } from '../hooks/useSubscription'
import { Link } from 'react-router-dom'
import { LockClosedIcon, StarIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface FeatureGateProps {
  feature: string
  fallback?: React.ReactNode
  children: React.ReactNode
  showUpgrade?: boolean
}

export default function FeatureGate({ feature, fallback, children, showUpgrade = true }: FeatureGateProps) {
  const { canAccessFeature, tier, upgradeUrl } = useSubscription()

  const hasAccess = canAccessFeature(feature as any)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <UpgradePrompt feature={feature} tier={tier} upgradeUrl={upgradeUrl} showUpgrade={showUpgrade} />
  )
}

interface UpgradePromptProps {
  feature: string
  tier: string
  upgradeUrl: string
  showUpgrade: boolean
}

function UpgradePrompt({ feature, tier, upgradeUrl, showUpgrade }: UpgradePromptProps) {
  const getFeatureInfo = (feature: string) => {
    const features: { [key: string]: { name: string; tier: string; description: string; icon: any } } = {
      personalizedAIRecommendations: {
        name: 'Personalized AI Recommendations',
        tier: 'Complete Care',
        description: 'Get AI-powered, personalized treatment and lifestyle recommendations based on your unique symptoms and health profile.',
        icon: SparklesIcon
      },
      hrtOptimization: {
        name: 'HRT Optimization',
        tier: 'Complete Care',
        description: 'Receive guidance on hormone replacement therapy options and optimization strategies.',
        icon: StarIcon
      },
      advancedSymptomTracking: {
        name: 'Advanced Symptom Tracking',
        tier: 'Complete Care',
        description: 'Track complex symptom patterns with detailed analytics and correlation insights.',
        icon: SparklesIcon
      },
      weeklyAICoaching: {
        name: 'Weekly AI Coaching',
        tier: 'Ultimate Wellness',
        description: 'Receive personalized weekly coaching sessions with our AI wellness coach.',
        icon: SparklesIcon
      },
      advancedAnalytics: {
        name: 'Advanced Analytics',
        tier: 'Ultimate Wellness',
        description: 'Access detailed health analytics, trends, and predictive insights about your menopause journey.',
        icon: SparklesIcon
      },
      providerIntegration: {
        name: 'Provider Integration',
        tier: 'Ultimate Wellness',
        description: 'Share your health data securely with your healthcare providers for better coordinated care.',
        icon: StarIcon
      }
    }

    return features[feature] || {
      name: 'Premium Feature',
      tier: 'Complete Care',
      description: 'This feature is available with a paid subscription.',
      icon: LockClosedIcon
    }
  }

  const featureInfo = getFeatureInfo(feature)
  const Icon = featureInfo.icon

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8 text-center border-2 border-pink-200">
      <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-pink-600" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {featureInfo.name}
      </h3>
      
      <p className="text-gray-600 mb-4">
        {featureInfo.description}
      </p>
      
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center mb-2">
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
            {featureInfo.tier} Plan Required
          </span>
        </div>
        {tier === 'trial' && (
          <p className="text-sm text-gray-600">
            Your trial includes basic features. Upgrade for full access.
          </p>
        )}
        {tier === 'basic' && featureInfo.tier !== 'Basic Support' && (
          <p className="text-sm text-gray-600">
            Upgrade to {featureInfo.tier} for access to this feature.
          </p>
        )}
      </div>

      {showUpgrade && (
        <div className="space-y-3">
          <Link 
            to={upgradeUrl}
            className="w-full bg-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-pink-700 transition-colors inline-block"
          >
            Upgrade to {featureInfo.tier}
          </Link>
          <button className="w-full text-pink-600 text-sm hover:text-pink-700 transition-colors">
            Learn more about plans
          </button>
        </div>
      )}
    </div>
  )
}

// Usage limit component
interface UsageLimitProps {
  limitType: 'symptoms' | 'ai_queries' | 'reports'
  current: number
  children: React.ReactNode
}

export function UsageLimit({ limitType, current, children }: UsageLimitProps) {
  const { hasReachedLimit, features, tier } = useSubscription()

  if (hasReachedLimit(limitType, current)) {
    const limits = {
      symptoms: features.maxSymptomEntries,
      ai_queries: features.maxAIQueries,
      reports: features.maxReports
    }

    const limitNames = {
      symptoms: 'symptom entries',
      ai_queries: 'AI queries', 
      reports: 'reports'
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <LockClosedIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              Usage Limit Reached
            </h4>
            <p className="text-sm text-yellow-700">
              You've used {current} of {limits[limitType]} {limitNames[limitType]} this month.
              {tier === 'trial' && ' Upgrade to continue using this feature.'}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Link 
            to="/pricing"
            className="text-sm bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            {tier === 'trial' ? 'Upgrade Plan' : 'Upgrade for More'}
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}