// Bundle Usage Tracking Service for SupportPartner
// Shared implementation with MenoWellness app

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface BundleUsage {
  id: string
  bundleSubscriptionId: string
  userId: string
  featureType: string
  appSource: 'menowellness' | 'supportpartner'
  usageCount: number
  usageDate: string
  createdAt: string
}

export interface BundleUsageSummary {
  totalAiQueries: number
  menowellnessQueries: number
  supportpartnerQueries: number
  currentPeriodStart: string
  currentPeriodEnd: string
  queriesLimit: number
  remainingQueries: number
  hasUnlimitedQueries: boolean
}

export interface BundleSubscription {
  id: string
  primaryUserId: string
  partnerUserId?: string
  bundleTier: 'couples_bundle' | 'ultimate_couples'
  stripeSubscriptionId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  sharedAiQueriesLimit: number
  crossAppInsightsEnabled: boolean
  relationshipAnalyticsEnabled: boolean
  prioritySupportEnabled: boolean
  couplesTherapyToolsEnabled: boolean
}

class BundleUsageTracker {
  /**
   * Check if user has an active bundle subscription
   */
  async getUserBundleSubscription(userId: string): Promise<BundleSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('bundle_subscriptions')
        .select('*')
        .or(`primary_user_id.eq.${userId},partner_user_id.eq.${userId}`)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        primaryUserId: data.primary_user_id,
        partnerUserId: data.partner_user_id,
        bundleTier: data.bundle_tier,
        stripeSubscriptionId: data.stripe_subscription_id,
        status: data.status,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        sharedAiQueriesLimit: data.shared_ai_queries_limit,
        crossAppInsightsEnabled: data.cross_app_insights_enabled,
        relationshipAnalyticsEnabled: data.relationship_analytics_enabled,
        prioritySupportEnabled: data.priority_support_enabled,
        couplesTherapyToolsEnabled: data.couples_therapy_tools_enabled,
      }
    } catch (error) {
      console.error('Error fetching bundle subscription:', error)
      return null
    }
  }

  /**
   * Check if user can use AI query feature (Mama Grace)
   */
  async canUseMamaGrace(userId: string): Promise<{ canUse: boolean; reason?: string; remainingQueries?: number }> {
    try {
      const { data, error } = await supabase.rpc('can_use_bundle_ai_query', {
        user_uuid: userId
      })

      if (error) {
        console.error('Error checking Mama Grace availability:', error)
        return { canUse: false, reason: 'Error checking subscription' }
      }

      if (!data) {
        return { canUse: false, reason: 'No active bundle subscription' }
      }

      // Get remaining queries for display
      const usage = await this.getBundleUsageSummary(userId)
      
      return { 
        canUse: true, 
        remainingQueries: usage?.remainingQueries 
      }
    } catch (error) {
      console.error('Error in canUseMamaGrace:', error)
      return { canUse: false, reason: 'System error' }
    }
  }

  /**
   * Track Mama Grace AI query usage
   */
  async trackMamaGraceQuery(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('track_bundle_ai_query', {
        user_uuid: userId,
        app_name: 'supportpartner'
      })

      if (error) {
        console.error('Error tracking Mama Grace query:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error in trackMamaGraceQuery:', error)
      return false
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    userId: string, 
    featureType: string,
    usageCount: number = 1
  ): Promise<boolean> {
    try {
      const bundleSubscription = await this.getUserBundleSubscription(userId)
      
      if (!bundleSubscription) {
        // User doesn't have bundle subscription, don't track
        return false
      }

      const { error } = await supabase
        .from('bundle_usage_tracking')
        .insert({
          bundle_subscription_id: bundleSubscription.id,
          user_id: userId,
          feature_type: featureType,
          app_source: 'supportpartner',
          usage_count: usageCount,
          usage_date: new Date().toISOString().split('T')[0]
        })

      if (error) {
        console.error('Error tracking feature usage:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in trackFeatureUsage:', error)
      return false
    }
  }

  /**
   * Get bundle usage summary for current billing period
   */
  async getBundleUsageSummary(userId: string): Promise<BundleUsageSummary | null> {
    try {
      const bundleSubscription = await this.getUserBundleSubscription(userId)
      
      if (!bundleSubscription) {
        return null
      }

      const { data, error } = await supabase.rpc('get_bundle_usage_summary', {
        bundle_sub_id: bundleSubscription.id
      })

      if (error || !data) {
        console.error('Error getting usage summary:', error)
        return null
      }

      const hasUnlimitedQueries = bundleSubscription.sharedAiQueriesLimit === -1
      const remainingQueries = hasUnlimitedQueries 
        ? -1 
        : Math.max(0, bundleSubscription.sharedAiQueriesLimit - (data.total_ai_queries || 0))

      return {
        totalAiQueries: data.total_ai_queries || 0,
        menowellnessQueries: data.menowellness_queries || 0,
        supportpartnerQueries: data.supportpartner_queries || 0,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        queriesLimit: data.queries_limit,
        remainingQueries,
        hasUnlimitedQueries
      }
    } catch (error) {
      console.error('Error in getBundleUsageSummary:', error)
      return null
    }
  }

  /**
   * Get partner connection status
   */
  async getPartnerConnectionStatus(userId: string): Promise<{
    hasPartner: boolean
    isPartnerActive: boolean
    partnerEmail?: string
    invitePending?: boolean
    isPrimaryUser: boolean
  }> {
    try {
      const bundleSubscription = await this.getUserBundleSubscription(userId)
      
      if (!bundleSubscription) {
        return { hasPartner: false, isPartnerActive: false, isPrimaryUser: false }
      }

      const isPrimaryUser = bundleSubscription.primaryUserId === userId
      const hasPartner = !!bundleSubscription.partnerUserId

      if (hasPartner) {
        return {
          hasPartner: true,
          isPartnerActive: true,
          isPrimaryUser
        }
      }

      // Check for pending invites
      const { data: inviteData } = await supabase
        .from('bundle_partner_invites')
        .select('*')
        .eq('bundle_subscription_id', bundleSubscription.id)
        .eq('status', 'pending')
        .single()

      return {
        hasPartner: false,
        isPartnerActive: false,
        invitePending: !!inviteData,
        partnerEmail: inviteData?.partner_email,
        isPrimaryUser
      }
    } catch (error) {
      console.error('Error getting partner connection status:', error)
      return { hasPartner: false, isPartnerActive: false, isPrimaryUser: false }
    }
  }

  /**
   * Accept partner invitation (for SupportPartner users joining a bundle)
   */
  async acceptPartnerInvitation(userId: string, inviteCode: string): Promise<{ success: boolean; bundleSubscriptionId?: string; error?: string }> {
    try {
      // Find and validate invite
      const { data: inviteData, error: inviteError } = await supabase
        .from('bundle_partner_invites')
        .select('*')
        .eq('invite_code', inviteCode)
        .eq('status', 'pending')
        .single()

      if (inviteError || !inviteData) {
        return { success: false, error: 'Invalid or expired invitation' }
      }

      // Check if invite is expired
      if (new Date(inviteData.expires_at) < new Date()) {
        return { success: false, error: 'Invitation has expired' }
      }

      // Update bundle subscription with partner
      const { error: updateError } = await supabase
        .from('bundle_subscriptions')
        .update({
          partner_user_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteData.bundle_subscription_id)

      if (updateError) {
        console.error('Error updating bundle subscription:', updateError)
        return { success: false, error: 'Failed to link partner account' }
      }

      // Mark invite as accepted
      await supabase
        .from('bundle_partner_invites')
        .update({
          status: 'accepted',
          partner_user_id: userId,
          accepted_at: new Date().toISOString()
        })
        .eq('id', inviteData.id)

      return { success: true, bundleSubscriptionId: inviteData.bundle_subscription_id }
    } catch (error) {
      console.error('Error in acceptPartnerInvitation:', error)
      return { success: false, error: 'System error' }
    }
  }

  /**
   * Get cross-app insights for bundle users (SupportPartner perspective)
   */
  async getCrossAppInsights(userId: string): Promise<any> {
    try {
      const bundleSubscription = await this.getUserBundleSubscription(userId)
      
      if (!bundleSubscription || !bundleSubscription.crossAppInsightsEnabled) {
        return null
      }

      // Get insights focused on partner support effectiveness
      const insights = {
        partnerWellness: {
          symptomSeverityTrend: 'improving', // improving, stable, concerning
          energyLevels: 6.8,
          sleepQuality: 7.2,
          moodStability: 7.5
        },
        supportEffectiveness: {
          communicationScore: 8.2,
          responsiveness: 9.1,
          empathyRating: 8.8,
          helpfulnessScore: 8.5
        },
        recentTriggers: [
          'Hot flashes increased during stressful work week',
          'Sleep disruption during family visit',
          'Mood changes during hormone adjustment'
        ],
        recommendations: [
          'Your partner appreciated your support during their difficult Tuesday',
          'Consider planning relaxing activities for weekend - stress levels are elevated',
          'Your partner\'s energy is higher in mornings - good time for important conversations'
        ],
        upcomingEvents: [
          'Doctor appointment scheduled for next Tuesday',
          'Hormone adjustment period starting next week',
          'Work stress expected to increase next month'
        ]
      }

      return insights
    } catch (error) {
      console.error('Error getting cross-app insights:', error)
      return null
    }
  }

  /**
   * Get shared dashboard data for bundle users
   */
  async getSharedDashboardData(userId: string): Promise<any> {
    try {
      const bundleSubscription = await this.getUserBundleSubscription(userId)
      
      if (!bundleSubscription) {
        return null
      }

      // Get combined insights from both apps
      const sharedData = {
        bundleInfo: {
          tier: bundleSubscription.bundleTier,
          partnerConnected: !!bundleSubscription.partnerUserId,
          relationshipAnalyticsEnabled: bundleSubscription.relationshipAnalyticsEnabled
        },
        usageSummary: await this.getBundleUsageSummary(userId),
        relationshipMetrics: {
          communicationScore: 8.3,
          supportScore: 8.7,
          overallRelationshipHealth: 8.5,
          improvementAreas: ['Evening communication', 'Stress management together']
        },
        sharedGoals: [
          'Improve sleep quality together',
          'Better stress management',
          'Maintain open communication about symptoms'
        ]
      }

      return sharedData
    } catch (error) {
      console.error('Error getting shared dashboard data:', error)
      return null
    }
  }

  /**
   * Check if user has bundle features enabled
   */
  async hasBundleFeature(userId: string, featureName: keyof Pick<BundleSubscription, 'crossAppInsightsEnabled' | 'relationshipAnalyticsEnabled' | 'prioritySupportEnabled' | 'couplesTherapyToolsEnabled'>): Promise<boolean> {
    try {
      const bundleSubscription = await this.getUserBundleSubscription(userId)
      
      if (!bundleSubscription) {
        return false
      }

      return bundleSubscription[featureName] || false
    } catch (error) {
      console.error('Error checking bundle feature:', error)
      return false
    }
  }
}

// Export singleton instance
export const bundleUsageTracker = new BundleUsageTracker()

// Helper functions for common SupportPartner use cases
export const canUseMamaGrace = (userId: string) => bundleUsageTracker.canUseMamaGrace(userId)
export const trackMamaGraceQuery = (userId: string) => bundleUsageTracker.trackMamaGraceQuery(userId)
export const getBundleUsageSummary = (userId: string) => bundleUsageTracker.getBundleUsageSummary(userId)
export const getPartnerConnectionStatus = (userId: string) => bundleUsageTracker.getPartnerConnectionStatus(userId)
export const acceptPartnerInvitation = (userId: string, inviteCode: string) => 
  bundleUsageTracker.acceptPartnerInvitation(userId, inviteCode)
export const getCrossAppInsights = (userId: string) => bundleUsageTracker.getCrossAppInsights(userId)
export const getSharedDashboardData = (userId: string) => bundleUsageTracker.getSharedDashboardData(userId)
export const hasBundleFeature = (userId: string, featureName: any) => bundleUsageTracker.hasBundleFeature(userId, featureName)