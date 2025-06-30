import React, { useState, useEffect } from 'react'
import { 
  HeartIcon,
  ChartBarIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { bundleUsageTracker, BundleUsageSummary } from '../services/bundleUsageTracking'

interface BundleDashboardProps {
  userId: string
}

export default function BundleDashboard({ userId }: BundleDashboardProps) {
  const [bundleUsage, setBundleUsage] = useState<BundleUsageSummary | null>(null)
  const [partnerStatus, setPartnerStatus] = useState<any>(null)
  const [crossAppInsights, setCrossAppInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBundleData()
  }, [userId])

  const loadBundleData = async () => {
    setLoading(true)
    try {
      const [usage, partner, insights] = await Promise.all([
        bundleUsageTracker.getBundleUsageSummary(userId),
        bundleUsageTracker.getPartnerConnectionStatus(userId),
        bundleUsageTracker.getCrossAppInsights(userId)
      ])

      setBundleUsage(usage)
      setPartnerStatus(partner)
      setCrossAppInsights(insights)
    } catch (error) {
      console.error('Error loading bundle data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2 text-gray-600">Loading bundle information...</span>
        </div>
      </div>
    )
  }

  if (!bundleUsage) {
    return null // Not a bundle user
  }

  const getUsageColor = (used: number, limit: number) => {
    if (limit === -1) return 'text-green-600' // Unlimited
    const percentage = (used / limit) * 100
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsageIcon = (used: number, limit: number) => {
    if (limit === -1) return CheckCircleIcon // Unlimited
    const percentage = (used / limit) * 100
    if (percentage >= 90) return ExclamationTriangleIcon
    return CheckCircleIcon
  }

  const UsageIcon = getUsageIcon(bundleUsage.totalAiQueries, bundleUsage.queriesLimit)

  return (
    <div className="space-y-6">
      {/* Bundle Status Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Couples Bundle</h2>
            <p className="text-blue-100">
              {partnerStatus?.hasPartner 
                ? 'Connected with your partner' 
                : partnerStatus?.invitePending 
                  ? 'Partner invitation pending'
                  : 'Ready to connect your partner'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-2">💙</div>
            {partnerStatus?.hasPartner && (
              <div className="flex items-center text-blue-100">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                Partner Active
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Shared Usage Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Queries Usage */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">AI Queries This Month</h4>
              <UsageIcon className={`h-5 w-5 ${getUsageColor(bundleUsage.totalAiQueries, bundleUsage.queriesLimit)}`} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Used:</span>
                <span className={`font-medium ${getUsageColor(bundleUsage.totalAiQueries, bundleUsage.queriesLimit)}`}>
                  {bundleUsage.totalAiQueries} {bundleUsage.hasUnlimitedQueries ? '(Unlimited)' : `/ ${bundleUsage.queriesLimit}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>MenoWellness:</span>
                <span>{bundleUsage.menowellnessQueries}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>SupportPartner:</span>
                <span>{bundleUsage.supportpartnerQueries}</span>
              </div>
              {!bundleUsage.hasUnlimitedQueries && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (bundleUsage.totalAiQueries / bundleUsage.queriesLimit) >= 0.9 ? 'bg-red-500' :
                        (bundleUsage.totalAiQueries / bundleUsage.queriesLimit) >= 0.75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(100, (bundleUsage.totalAiQueries / bundleUsage.queriesLimit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Partner Connection */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Partner Connection</h4>
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              {partnerStatus?.hasPartner ? (
                <div>
                  <div className="flex items-center text-green-600 mb-2">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Partner Connected</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Your partner has access to the SupportPartner app and can see your shared progress.
                  </p>
                </div>
              ) : partnerStatus?.invitePending ? (
                <div>
                  <div className="flex items-center text-yellow-600 mb-2">
                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Invitation Pending</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Invitation sent to {partnerStatus.partnerEmail}. They'll receive access once they accept.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center text-blue-600 mb-2">
                    <InformationCircleIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">Ready to Connect</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Invite your partner to get the most out of your bundle subscription.
                  </p>
                  <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                    Invite Partner
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cross-App Insights */}
      {crossAppInsights && partnerStatus?.hasPartner && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
            Relationship Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relationship Impact */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Relationship Health</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Communication</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${crossAppInsights.relationshipImpact.communicationScore * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{crossAppInsights.relationshipImpact.communicationScore}/10</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Support Level</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${crossAppInsights.relationshipImpact.supportLevel * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{crossAppInsights.relationshipImpact.supportLevel}/10</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Empathy</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${crossAppInsights.relationshipImpact.empathyMeter * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{crossAppInsights.relationshipImpact.empathyMeter}/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner Engagement */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Partner Engagement</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Daily Check-ins</span>
                  <span className="text-sm font-medium">{crossAppInsights.partnerEngagement.dailyCheckins}/7 this week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Support Actions</span>
                  <span className="text-sm font-medium">{crossAppInsights.partnerEngagement.supportActionsThisWeek} this week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Learning Modules</span>
                  <span className="text-sm font-medium">{crossAppInsights.partnerEngagement.educationModulesCompleted} completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
            <div className="space-y-2">
              {crossAppInsights.recommendedActions.map((action: string, index: number) => (
                <div key={index} className="flex items-start text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bundle Benefits */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HeartIcon className="h-5 w-5 mr-2 text-pink-600" />
          Bundle Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-sm">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Shared AI query pool (75/month)</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Cross-app insights & analytics</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Relationship health tracking</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
            <span>Partner mood correlation</span>
          </div>
        </div>
      </div>
    </div>
  )
}