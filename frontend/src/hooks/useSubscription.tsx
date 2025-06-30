import React, { createContext, useContext, useEffect, useState } from 'react'

export type SubscriptionTier = 'trial' | 'basic' | 'complete' | 'ultimate'

interface SubscriptionFeatures {
  // Basic features (all tiers)
  dailySymptomTracking: boolean
  basicDashboard: boolean
  profileManagement: boolean
  
  // Basic tier ($9.99)
  basicAIInsights: boolean
  moodEnergyMonitoring: boolean
  educationalContent: boolean
  progressTracking: boolean
  
  // Complete Care tier ($19.99)
  advancedSymptomTracking: boolean
  personalizedAIRecommendations: boolean
  hrtOptimization: boolean
  nutritionExercisePlans: boolean
  sleepQualityMonitoring: boolean
  stressManagementTools: boolean
  prioritySupport: boolean
  
  // Ultimate tier ($29.99)
  weeklyAICoaching: boolean
  providerIntegration: boolean
  advancedAnalytics: boolean
  customMealPlanning: boolean
  liveConsultations: boolean
  familySupport: boolean
  
  // Usage limits
  maxSymptomEntries: number
  maxAIQueries: number
  maxReports: number
}

interface SubscriptionContextType {
  tier: SubscriptionTier
  features: SubscriptionFeatures
  isLoading: boolean
  trialDaysRemaining: number
  canAccessFeature: (feature: keyof SubscriptionFeatures) => boolean
  hasReachedLimit: (limitType: 'symptoms' | 'ai_queries' | 'reports', current: number) => boolean
  upgradeUrl: string
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider')
  }
  return context
}

const getFeaturesByTier = (tier: SubscriptionTier): SubscriptionFeatures => {
  const baseFeatures = {
    dailySymptomTracking: true,
    basicDashboard: true,
    profileManagement: true,
    basicAIInsights: false,
    moodEnergyMonitoring: false,
    educationalContent: false,
    progressTracking: false,
    advancedSymptomTracking: false,
    personalizedAIRecommendations: false,
    hrtOptimization: false,
    nutritionExercisePlans: false,
    sleepQualityMonitoring: false,
    stressManagementTools: false,
    prioritySupport: false,
    weeklyAICoaching: false,
    providerIntegration: false,
    advancedAnalytics: false,
    customMealPlanning: false,
    liveConsultations: false,
    familySupport: false,
    maxSymptomEntries: 0,
    maxAIQueries: 0,
    maxReports: 0
  }

  switch (tier) {
    case 'trial':
      return {
        ...baseFeatures,
        basicAIInsights: true,
        moodEnergyMonitoring: true,
        educationalContent: true,
        progressTracking: true,
        maxSymptomEntries: 50,
        maxAIQueries: 10,
        maxReports: 2
      }
    
    case 'basic':
      return {
        ...baseFeatures,
        basicAIInsights: true,
        moodEnergyMonitoring: true,
        educationalContent: true,
        progressTracking: true,
        maxSymptomEntries: 200,
        maxAIQueries: 50,
        maxReports: 5
      }
    
    case 'complete':
      return {
        ...baseFeatures,
        basicAIInsights: true,
        moodEnergyMonitoring: true,
        educationalContent: true,
        progressTracking: true,
        advancedSymptomTracking: true,
        personalizedAIRecommendations: true,
        hrtOptimization: true,
        nutritionExercisePlans: true,
        sleepQualityMonitoring: true,
        stressManagementTools: true,
        prioritySupport: true,
        maxSymptomEntries: 1000,
        maxAIQueries: 200,
        maxReports: 20
      }
    
    case 'ultimate':
      return {
        ...baseFeatures,
        basicAIInsights: true,
        moodEnergyMonitoring: true,
        educationalContent: true,
        progressTracking: true,
        advancedSymptomTracking: true,
        personalizedAIRecommendations: true,
        hrtOptimization: true,
        nutritionExercisePlans: true,
        sleepQualityMonitoring: true,
        stressManagementTools: true,
        prioritySupport: true,
        weeklyAICoaching: true,
        providerIntegration: true,
        advancedAnalytics: true,
        customMealPlanning: true,
        liveConsultations: true,
        familySupport: true,
        maxSymptomEntries: -1, // unlimited
        maxAIQueries: -1, // unlimited
        maxReports: -1 // unlimited
      }
    
    default:
      return baseFeatures
  }
}

interface SubscriptionProviderProps {
  children: React.ReactNode
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [tier, setTier] = useState<SubscriptionTier>('complete')
  const [isLoading, setIsLoading] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(7)

  // Demo mode - no auth required
  const fetchSubscriptionData = async () => {
    // Mock data for demo
    setTier('complete')
    setIsLoading(false)
  }

  const createTrialSubscription = async () => {
    // Demo mode - always have access
  }

  const features = getFeaturesByTier(tier)

  const canAccessFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return features[feature] as boolean
  }

  const hasReachedLimit = (limitType: 'symptoms' | 'ai_queries' | 'reports', current: number): boolean => {
    const limits = {
      symptoms: features.maxSymptomEntries,
      ai_queries: features.maxAIQueries,
      reports: features.maxReports
    }
    
    const limit = limits[limitType]
    return limit !== -1 && current >= limit
  }

  const value: SubscriptionContextType = {
    tier,
    features,
    isLoading,
    trialDaysRemaining,
    canAccessFeature,
    hasReachedLimit,
    upgradeUrl: '/pricing'
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}