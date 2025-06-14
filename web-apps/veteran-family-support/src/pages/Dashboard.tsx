import React, { useState, useEffect } from 'react'
import { 
  HeartIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  UserGroupIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useFamily } from '../contexts/FamilyContext'
import { useVeteranConnection } from '../contexts/VeteranConnectionContext'
import toast from 'react-hot-toast'

interface QuickActionCard {
  title: string
  description: string
  icon: React.ComponentType<any>
  action: () => void
  color: string
  priority?: 'high' | 'medium' | 'low'
}

export default function Dashboard() {
  const { familyProfile } = useFamily()
  const { veteranStatus, connectionHealth, getVeteranInsights } = useVeteranConnection()
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      if (familyProfile?.connectedVeteranId) {
        const veteranInsights = await getVeteranInsights(familyProfile.connectedVeteranId)
        setInsights(veteranInsights)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Unable to load latest updates')
    } finally {
      setLoading(false)
    }
  }

  const quickActions: QuickActionCard[] = [
    {
      title: 'Check Veteran Status',
      description: 'View your veteran\\'s current wellbeing and recent activity',
      icon: HeartIcon,
      action: () => window.location.href = '/veteran-status',
      color: 'bg-blue-500',
      priority: 'high'
    },
    {
      title: 'Crisis Support',
      description: '24/7 crisis resources and emergency contacts',
      icon: ExclamationTriangleIcon,
      action: () => window.location.href = '/crisis-support',
      color: 'bg-red-500',
      priority: 'high'
    },
    {
      title: 'Family Communication',
      description: 'Secure messaging and updates with your veteran',
      icon: ChatBubbleLeftRightIcon,
      action: () => window.location.href = '/communication',
      color: 'bg-green-500',
      priority: 'medium'
    },
    {
      title: 'Educational Resources',
      description: 'Learn about supporting veterans with mental health',
      icon: BookOpenIcon,
      action: () => window.location.href = '/education',
      color: 'bg-purple-500',
      priority: 'medium'
    },
    {
      title: 'Support Network',
      description: 'Connect with other military families and support groups',
      icon: UserGroupIcon,
      action: () => window.location.href = '/support-network',
      color: 'bg-indigo-500',
      priority: 'low'
    },
    {
      title: 'Canadian Resources',
      description: 'VAC benefits, provincial services, and veteran centers',
      icon: ShieldCheckIcon,
      action: () => window.location.href = '/resources',
      color: 'bg-red-600',
      priority: 'medium'
    }
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    const name = familyProfile?.firstName || 'Family Member'
    
    if (hour < 12) return `Good morning, ${name}`
    if (hour < 17) return `Good afternoon, ${name}`
    return `Good evening, ${name}`
  }

  const getCrisisAlert = () => {
    if (veteranStatus?.riskLevel === 'crisis') {
      return {
        level: 'critical',
        message: 'Your veteran may need immediate support. Crisis resources are available 24/7.',
        action: 'Access Crisis Support'
      }
    }
    if (veteranStatus?.riskLevel === 'high') {
      return {
        level: 'warning',
        message: 'Your veteran may be experiencing increased stress. Consider reaching out.',
        action: 'Check Status'
      }
    }
    return null
  }

  const crisisAlert = getCrisisAlert()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}</h1>
            <p className="text-gray-600 mt-1">
              Supporting our Canadian veterans and their families
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${
              connectionHealth === 'connected' ? 'bg-green-500' : 
              connectionHealth === 'limited' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {connectionHealth === 'connected' ? 'Connected' : 
               connectionHealth === 'limited' ? 'Limited Connection' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Crisis Alert */}
      {crisisAlert && (
        <div className={`rounded-lg p-4 ${
          crisisAlert.level === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-start">
            <ExclamationTriangleIcon className={`h-6 w-6 mt-0.5 ${
              crisisAlert.level === 'critical' ? 'text-red-600' : 'text-yellow-600'
            }`} />
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                crisisAlert.level === 'critical' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {crisisAlert.message}
              </p>
              <button
                onClick={() => window.location.href = '/crisis-support'}
                className={`mt-2 text-sm font-medium underline ${
                  crisisAlert.level === 'critical' ? 'text-red-700 hover:text-red-600' : 'text-yellow-700 hover:text-yellow-600'
                }`}
              >
                {crisisAlert.action}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left group"
            >
              <div className="flex items-start space-x-3">
                <div className={`${action.color} p-2 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Veteran Status Summary */}
      {veteranStatus && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Veteran Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                veteranStatus.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                veteranStatus.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                veteranStatus.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                Current Status: {veteranStatus.riskLevel.charAt(0).toUpperCase() + veteranStatus.riskLevel.slice(1)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Last Check-in</p>
              <p className="font-semibold">{veteranStatus.lastActivity || 'Unknown'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Support Level</p>
              <p className="font-semibold">{familyProfile?.accessLevel || 'Basic'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Canadian Resources */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-red-600" />
          <h2 className="text-lg font-semibold text-gray-900">Canadian Veteran Resources</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">24/7 Crisis Support</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">VAC Crisis Line: 1-800-268-7708</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Canada Suicide Prevention: 1-833-456-4566</span>
              </div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Family Support</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">OSISS Family Support: 1-800-883-6094</span>
              </div>
              <div className="flex items-center space-x-2">
                <InformationCircleIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm">VAC Family Line: 1-866-522-2122</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      {insights && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h2>
          {insights.insights.riskTrends.length > 0 && (
            <div className="space-y-2">
              {insights.insights.riskTrends.slice(0, 3).map((trend: string, index: number) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-700">{trend}</p>
                </div>
              ))}
            </div>
          )}
          {insights.insights.familyAlerts.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Family Recommendations</h4>
              {insights.insights.familyAlerts.slice(0, 2).map((alert: string, index: number) => (
                <p key={index} className="text-sm text-blue-800">{alert}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}