import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Bundle Rate Limiting Middleware
 * Enforces usage limits for bundle subscriptions across both apps
 */

export class BundleRateLimiter {
  constructor() {
    this.rateLimits = {
      couples_bundle: {
        aiQueriesPerMonth: 100,
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
  async checkBundleLimit(userId, featureType, appSource = 'supportpartner') {
    try {
      // Get user's bundle subscription
      const { data: bundleSubscription, error } = await supabase
        .from('bundle_subscriptions')
        .select('*')
        .or(`primary_user_id.eq.${userId},partner_user_id.eq.${userId}`)
        .eq('status', 'active')
        .single();

      if (error || !bundleSubscription) {
        // No bundle subscription, allow but don't track bundle usage
        return { 
          allowed: true, 
          isBundleUser: false,
          reason: 'Not a bundle user'
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

      // Count current month usage
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
        reason: allowed ? 'Within limits' : 'Monthly limit exceeded'
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
   * Get current month usage for a specific feature
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
  async trackUsage(userId, featureType, bundleSubscription, appSource = 'supportpartner', usageCount = 1) {
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
      'mama_grace_query': 'aiQueriesPerMonth',
      'symptom_entry': 'symptomEntriesPerMonth',
      'insight_generation': 'insightGenerationsPerMonth'
    };
    return mapping[featureType];
  }

  /**
   * Express middleware for rate limiting
   */
  middleware(featureType, appSource = 'supportpartner') {
    return async (req, res, next) => {
      try {
        // Extract user ID from request (adjust based on your auth system)
        const userId = req.user?.id || req.headers['x-user-id'];
        
        if (!userId) {
          return res.status(401).json({
            error: 'User authentication required'
          });
        }

        const limitCheck = await this.checkBundleLimit(userId, featureType, appSource);
        
        if (!limitCheck.allowed && limitCheck.isBundleUser) {
          return res.status(429).json({
            error: 'Usage limit exceeded',
            details: {
              featureType,
              currentUsage: limitCheck.currentUsage,
              monthlyLimit: limitCheck.monthlyLimit,
              remaining: limitCheck.remaining,
              reason: limitCheck.reason
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

        next();
      } catch (error) {
        console.error('Bundle rate limiting middleware error:', error);
        // Don't block request on rate limiting errors
        next();
      }
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
}

// Create singleton instance
const bundleRateLimiter = new BundleRateLimiter();

// Export middleware functions
export const checkMamaGraceLimit = bundleRateLimiter.middleware('mama_grace_query', 'supportpartner');
export const checkAiQueryLimit = bundleRateLimiter.middleware('ai_query');
export const checkSymptomEntryLimit = bundleRateLimiter.middleware('symptom_entry');
export const checkInsightGenerationLimit = bundleRateLimiter.middleware('insight_generation');

// Export utility functions
export const getBundleUsageSummary = (userId) => bundleRateLimiter.getUserUsageSummary(userId);
export const checkBundleLimit = (userId, featureType, appSource) => bundleRateLimiter.checkBundleLimit(userId, featureType, appSource);

export default bundleRateLimiter;