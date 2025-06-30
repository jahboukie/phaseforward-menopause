import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Bundle Rate Limiting Middleware for MenoWellness
 * Enforces usage limits for bundle subscriptions across both apps
 */

export class BundleRateLimiter {
  constructor() {
    this.rateLimits = {
      couples_bundle: {
        aiQueriesPerMonth: 75, // Shared pool between both apps
        symptomEntriesPerMonth: 50,
        insightGenerationsPerMonth: 25
      },
      ultimate_couples: {
        aiQueriesPerMonth: -1, // Unlimited
        symptomEntriesPerMonth: -1, // Unlimited
        insightGenerationsPerMonth: -1 // Unlimited
      }
    };
  }

  /**
   * Check if user can perform an action based on bundle limits
   */
  async checkBundleLimit(userId, featureType, appSource = 'menowellness') {
    try {
      // Get user's bundle subscription
      const { data: bundleSubscription, error } = await supabase
        .from('bundle_subscriptions')
        .select('*')
        .or(`primary_user_id.eq.${userId},partner_user_id.eq.${userId}`)
        .eq('status', 'active')
        .single();

      if (error || !bundleSubscription) {
        // No bundle subscription, check individual subscription limits
        return { 
          allowed: true, 
          isBundleUser: false,
          reason: 'Not a bundle user - using individual subscription limits'
        };
      }

      const tierLimits = this.rateLimits[bundleSubscription.bundle_tier];
      if (!tierLimits) {
        return { 
          allowed: false, 
          isBundleUser: true,
          reason: 'Invalid bundle tier'
        };
      }

      // Check specific feature limits
      const limitKey = this.getFeatureLimitKey(featureType);
      if (!limitKey) {
        // Feature not tracked, allow
        return { 
          allowed: true, 
          isBundleUser: true,
          bundleSubscription
        };
      }

      const monthlyLimit = tierLimits[limitKey];
      if (monthlyLimit === -1) {
        // Unlimited for this tier
        return { 
          allowed: true, 
          isBundleUser: true,
          bundleSubscription,
          isUnlimited: true
        };
      }

      // Count current month usage across BOTH apps
      const currentUsage = await this.getCurrentMonthUsage(
        bundleSubscription.id, 
        featureType,
        bundleSubscription.current_period_start,
        bundleSubscription.current_period_end
      );

      const allowed = currentUsage < monthlyLimit;
      const remaining = Math.max(0, monthlyLimit - currentUsage);

      return {
        allowed,
        isBundleUser: true,
        bundleSubscription,
        currentUsage,
        monthlyLimit,
        remaining,
        reason: allowed ? 'Within shared bundle limits' : 'Shared monthly limit exceeded'
      };

    } catch (error) {
      console.error('Error checking bundle limit:', error);
      return { 
        allowed: false, 
        isBundleUser: false,
        reason: 'System error'
      };
    }
  }

  /**
   * Get current month usage for a specific feature across both apps
   */
  async getCurrentMonthUsage(bundleSubscriptionId, featureType, periodStart, periodEnd) {
    try {
      const { data, error } = await supabase
        .from('bundle_usage_tracking')
        .select('usage_count')
        .eq('bundle_subscription_id', bundleSubscriptionId)
        .eq('feature_type', featureType)
        .gte('usage_date', new Date(periodStart).toISOString().split('T')[0])
        .lte('usage_date', new Date(periodEnd).toISOString().split('T')[0]);

      if (error) {
        console.error('Error getting current usage:', error);
        return 0;
      }

      return data.reduce((total, record) => total + (record.usage_count || 0), 0);
    } catch (error) {
      console.error('Error in getCurrentMonthUsage:', error);
      return 0;
    }
  }

  /**
   * Track usage after successful action
   */
  async trackUsage(userId, featureType, bundleSubscription, appSource = 'menowellness', usageCount = 1) {
    try {
      const { error } = await supabase
        .from('bundle_usage_tracking')
        .insert({
          bundle_subscription_id: bundleSubscription.id,
          user_id: userId,
          feature_type: featureType,
          app_source: appSource,
          usage_count: usageCount,
          usage_date: new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.error('Error tracking usage:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in trackUsage:', error);
      return false;
    }
  }

  /**
   * Map feature types to rate limit keys
   */
  getFeatureLimitKey(featureType) {
    const mapping = {
      'ai_query': 'aiQueriesPerMonth',
      'ai_insight': 'aiQueriesPerMonth',
      'symptom_entry': 'symptomEntriesPerMonth',
      'insight_generation': 'insightGenerationsPerMonth',
      'treatment_recommendation': 'insightGenerationsPerMonth'
    };
    return mapping[featureType];
  }

  /**
   * Next.js API middleware for rate limiting
   */
  middleware(featureType, appSource = 'menowellness') {
    return async (req, res, next) => {
      try {
        // Extract user ID from request (adjust based on your auth system)
        const userId = req.user?.id || req.headers['x-user-id'] || req.query.userId;
        
        if (!userId) {
          return res.status(401).json({
            error: 'User authentication required'
          });
        }

        const limitCheck = await this.checkBundleLimit(userId, featureType, appSource);
        
        if (!limitCheck.allowed && limitCheck.isBundleUser) {
          return res.status(429).json({
            error: 'Shared usage limit exceeded',
            details: {
              featureType,
              currentUsage: limitCheck.currentUsage,
              monthlyLimit: limitCheck.monthlyLimit,
              remaining: limitCheck.remaining,
              reason: limitCheck.reason,
              bundleInfo: 'This limit is shared between you and your partner across both apps'
            }
          });
        }

        // Add limit info to request for use in route handlers
        req.bundleLimitInfo = limitCheck;
        
        // Track usage after successful request (if it's a bundle user)
        if (limitCheck.isBundleUser && limitCheck.bundleSubscription) {
          res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              this.trackUsage(userId, featureType, limitCheck.bundleSubscription, appSource);
            }
          });
        }

        // Call next() for Next.js API routes or continue for Express
        if (next) next();
        
      } catch (error) {
        console.error('Bundle rate limiting middleware error:', error);
        // Don't block request on rate limiting errors
        if (next) next();
      }
    };
  }

  /**
   * Direct function for Next.js API routes (since middleware pattern is different)
   */
  async checkAndTrackUsage(userId, featureType, appSource = 'menowellness') {
    const limitCheck = await this.checkBundleLimit(userId, featureType, appSource);
    
    if (!limitCheck.allowed && limitCheck.isBundleUser) {
      return {
        success: false,
        error: 'Shared usage limit exceeded',
        details: limitCheck
      };
    }

    // Track usage if it's a bundle user
    if (limitCheck.isBundleUser && limitCheck.bundleSubscription) {
      await this.trackUsage(userId, featureType, limitCheck.bundleSubscription, appSource);
    }

    return {
      success: true,
      limitInfo: limitCheck
    };
  }

  /**
   * Get usage summary for user (for dashboard display)
   */
  async getUserUsageSummary(userId) {
    try {
      const limitCheck = await this.checkBundleLimit(userId, 'ai_query');
      
      if (!limitCheck.isBundleUser) {
        return null;
      }

      const bundleSubscription = limitCheck.bundleSubscription;
      const tierLimits = this.rateLimits[bundleSubscription.bundle_tier];

      // Get usage for all tracked features
      const features = ['ai_query', 'symptom_entry', 'insight_generation'];
      const usageSummary = {};

      for (const feature of features) {
        const limitKey = this.getFeatureLimitKey(feature);
        if (limitKey) {
          const currentUsage = await this.getCurrentMonthUsage(
            bundleSubscription.id,
            feature,
            bundleSubscription.current_period_start,
            bundleSubscription.current_period_end
          );
          
          const monthlyLimit = tierLimits[limitKey];
          const remaining = monthlyLimit === -1 ? -1 : Math.max(0, monthlyLimit - currentUsage);

          usageSummary[feature] = {
            current: currentUsage,
            limit: monthlyLimit,
            remaining,
            isUnlimited: monthlyLimit === -1
          };
        }
      }

      return {
        bundleTier: bundleSubscription.bundle_tier,
        currentPeriodStart: bundleSubscription.current_period_start,
        currentPeriodEnd: bundleSubscription.current_period_end,
        features: usageSummary
      };

    } catch (error) {
      console.error('Error getting usage summary:', error);
      return null;
    }
  }

  /**
   * Get breakdown of usage by app for bundle users
   */
  async getUsageBreakdown(userId) {
    try {
      const limitCheck = await this.checkBundleLimit(userId, 'ai_query');
      
      if (!limitCheck.isBundleUser) {
        return null;
      }

      const bundleSubscription = limitCheck.bundleSubscription;

      const { data, error } = await supabase
        .from('bundle_usage_tracking')
        .select('feature_type, app_source, usage_count, usage_date')
        .eq('bundle_subscription_id', bundleSubscription.id)
        .gte('usage_date', new Date(bundleSubscription.current_period_start).toISOString().split('T')[0])
        .lte('usage_date', new Date(bundleSubscription.current_period_end).toISOString().split('T')[0])
        .order('usage_date', { ascending: false });

      if (error) {
        console.error('Error getting usage breakdown:', error);
        return null;
      }

      // Group by app and feature
      const breakdown = {
        menowellness: {},
        supportpartner: {}
      };

      data.forEach(record => {
        const app = record.app_source;
        const feature = record.feature_type;
        
        if (!breakdown[app][feature]) {
          breakdown[app][feature] = 0;
        }
        breakdown[app][feature] += record.usage_count;
      });

      return breakdown;

    } catch (error) {
      console.error('Error getting usage breakdown:', error);
      return null;
    }
  }
}

// Create singleton instance
const bundleRateLimiter = new BundleRateLimiter();

// Export middleware and utility functions for Next.js API routes
export const checkAiQueryLimit = bundleRateLimiter.middleware('ai_query', 'menowellness');
export const checkSymptomEntryLimit = bundleRateLimiter.middleware('symptom_entry', 'menowellness');
export const checkInsightGenerationLimit = bundleRateLimiter.middleware('insight_generation', 'menowellness');

// Export utility functions
export const getBundleUsageSummary = (userId) => bundleRateLimiter.getUserUsageSummary(userId);
export const getUsageBreakdown = (userId) => bundleRateLimiter.getUsageBreakdown(userId);
export const checkBundleLimit = (userId, featureType, appSource) => bundleRateLimiter.checkBundleLimit(userId, featureType, appSource);
export const checkAndTrackUsage = (userId, featureType, appSource) => bundleRateLimiter.checkAndTrackUsage(userId, featureType, appSource);

export default bundleRateLimiter;