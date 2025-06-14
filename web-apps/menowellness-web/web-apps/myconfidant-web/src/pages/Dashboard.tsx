import React from 'react'
import { 
  HeartIcon, 
  BoltIcon, 
  ChatBubbleLeftRightIcon, 
  AcademicCapIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  CalendarIcon,
  TrophyIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const userData = {
    name: 'Michael',
    relationshipDuration: '3 years',
    confidenceLevel: 72,
    communicationScore: 84,
    intimacyFrequency: 2.4, // per week
    treatmentStage: 'Active Treatment',
    partnerSupport: 'Excellent',
    overallWellness: 78
  }

  const todayStats = [
    {
      name: 'Confidence Level',
      value: `${userData.confidenceLevel}%`,
      change: '+8%',
      changeType: 'increase',
      icon: BoltIcon,
      color: 'text-trust-600',
      bgColor: 'bg-trust-100'
    },
    {
      name: 'Communication Score',
      value: `${userData.communicationScore}%`,
      change: '+12%',
      changeType: 'increase',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-intimacy-600',
      bgColor: 'bg-intimacy-100'
    },
    {
      name: 'Treatment Progress',
      value: '82%',
      change: '+5%',
      changeType: 'increase',
      icon: TrophyIcon,
      color: 'text-wellness-600',
      bgColor: 'bg-wellness-100'
    },
    {
      name: 'Relationship Health',
      value: 'Strong',
      change: '+2 levels',
      changeType: 'increase',
      icon: HeartIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    }
  ]

  const ecosystemInsights = [
    {
      app: 'Inner Architect',
      insight: 'Confidence anchoring reduces performance anxiety by 78%',
      effectiveness: 89,
      technique: 'NLP Confidence Building',
      type: 'nlp'
    },
    {
      app: 'SoberPal',
      insight: 'Sobriety journey strengthening relationship intimacy',
      effectiveness: 76,
      technique: 'Holistic Recovery',
      type: 'recovery'
    },
    {
      app: 'Provider Dashboard',
      insight: 'Regular monitoring shows 94% treatment adherence',
      effectiveness: 94,
      technique: 'Medical Compliance',
      type: 'medical'
    }
  ]

  const todayActions = [
    { task: 'Morning confidence meditation', completed: true, time: '7:00 AM' },
    { task: 'Pelvic floor exercises', completed: true, time: '8:00 AM' },
    { task: 'Partner communication check-in', completed: false, time: '6:00 PM' },
    { task: 'Treatment medication', completed: false, time: '7:00 PM' },
    { task: 'Evening relationship gratitude', completed: false, time: '9:00 PM' },
  ]

  const recentProgress = [
    { date: 'This week', metric: 'Confidence', value: 72, change: '+8%' },
    { date: 'This week', metric: 'Intimacy frequency', value: 2.4, change: '+15%' },
    { date: 'This week', metric: 'Communication', value: 84, change: '+12%' },
    { date: 'This month', metric: 'Treatment adherence', value: 94, change: '+3%' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-intimacy-600 to-trust-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">
            Strong and confident today, {userData.name}! 💪❤️
          </h1>
          <div className="flex items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.confidenceLevel}%</p>
              <p className="text-sm opacity-90">Confidence</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.communicationScore}%</p>
              <p className="text-sm opacity-90">Communication</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.relationshipDuration}</p>
              <p className="text-sm opacity-90">Together</p>
            </div>
          </div>
          <p className="text-lg opacity-90">
            You're in <span className="font-semibold">{userData.treatmentStage}</span>. 
            Your ecosystem is supporting your relationship journey with {userData.partnerSupport.toLowerCase()} partner support.
          </p>
        </div>
        
        {/* Heart animation */}
        <div className="absolute top-4 right-4 w-24 h-24">
          <HeartIcon className="w-full h-full text-white/20 animate-pulse" />
        </div>
      </div>

      {/* Quick Support - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <PhoneIcon className="h-5 w-5" />
          <span className="font-medium">Crisis Support</span>
        </button>
        <button className="bg-intimacy-600 hover:bg-intimacy-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
          <span className="font-medium">Talk to Partner</span>
        </button>
        <button className="bg-trust-600 hover:bg-trust-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <ShieldCheckIcon className="h-5 w-5" />
          <span className="font-medium">Confidence Boost</span>
        </button>
        <button className="bg-wellness-600 hover:bg-wellness-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <AcademicCapIcon className="h-5 w-5" />
          <span className="font-medium">Learn Together</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-wellness-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ecosystem Intelligence */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🌐 Ecosystem Relationship Support</h3>
              <div className="text-xs text-gray-500">
                🤖 Powered by SentimentAsAService
              </div>
            </div>
            <div className="space-y-4">
              {ecosystemInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'nlp' ? 'bg-trust-50 border-trust-400' :
                  insight.type === 'recovery' ? 'bg-wellness-50 border-wellness-400' :
                  'bg-primary-50 border-primary-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        insight.type === 'nlp' ? 'text-trust-900' :
                        insight.type === 'recovery' ? 'text-wellness-900' :
                        'text-primary-900'
                      }`}>
                        {insight.app} Integration
                      </p>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'nlp' ? 'text-trust-700' :
                        insight.type === 'recovery' ? 'text-wellness-700' :
                        'text-primary-700'
                      }`}>
                        {insight.insight}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{insight.technique}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Effectiveness</p>
                      <p className="text-lg font-bold text-wellness-600">{insight.effectiveness}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Progress</h3>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProgress.map((progress, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{progress.metric}</span>
                    <span className="text-xs text-gray-500">{progress.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{progress.value}</span>
                    <span className="text-sm font-medium text-wellness-600">{progress.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education & Learning */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Today's Learning</h3>
            <div className="space-y-4">
              <div className="p-4 bg-trust-50 rounded-lg">
                <h4 className="font-medium text-trust-900">Understanding ED: Mind-Body Connection</h4>
                <p className="text-sm text-trust-700 mt-1">Learn how psychological factors influence physical performance and how to address both.</p>
                <button className="mt-2 text-sm text-trust-600 hover:text-trust-800 font-medium">Continue Reading →</button>
              </div>
              <div className="p-4 bg-intimacy-50 rounded-lg">
                <h4 className="font-medium text-intimacy-900">Partner Communication Scripts</h4>
                <p className="text-sm text-intimacy-700 mt-1">Effective ways to discuss intimacy challenges and build stronger emotional connection.</p>
                <button className="mt-2 text-sm text-intimacy-600 hover:text-intimacy-800 font-medium">Practice Together →</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Today's Action Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Wellness Plan</h3>
            <div className="space-y-3">
              {todayActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={action.completed}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${action.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {action.task}
                    </p>
                    <p className="text-xs text-gray-500">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Completion: <span className="font-medium text-wellness-600">
                  {Math.round((todayActions.filter(a => a.completed).length / todayActions.length) * 100)}%
                </span>
              </p>
            </div>
          </div>

          {/* AI Relationship Coach */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 AI Relationship Coach
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-800 font-medium">Daily Confidence</p>
                <p className="text-sm text-primary-700 mt-1">
                  Your confidence is growing! Use the anchoring technique from Inner Architect before intimate moments.
                </p>
              </div>
              <div className="p-4 bg-intimacy-50 rounded-lg">
                <p className="text-sm text-intimacy-800 font-medium">Partner Connection</p>
                <p className="text-sm text-intimacy-700 mt-1">
                  Schedule 15 minutes tonight for emotional check-in. Your communication scores are improving!
                </p>
              </div>
              <div className="p-4 bg-trust-50 rounded-lg">
                <p className="text-sm text-trust-800 font-medium">Treatment Progress</p>
                <p className="text-sm text-trust-700 mt-1">
                  Your treatment adherence is excellent. Consider discussing progress with your partner.
                </p>
              </div>
            </div>
          </div>

          {/* Relationship Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Relationship Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Emotional Intimacy</span>
                  <span className="text-sm text-gray-900">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-gradient-to-r from-intimacy-500 to-intimacy-600 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Communication</span>
                  <span className="text-sm text-gray-900">84%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-gradient-to-r from-trust-500 to-trust-600 rounded-full" style={{width: '84%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Physical Intimacy</span>
                  <span className="text-sm text-gray-900">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full" style={{width: '72%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Mutual Support</span>
                  <span className="text-sm text-gray-900">91%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 bg-gradient-to-r from-wellness-500 to-wellness-600 rounded-full" style={{width: '91%'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Ecosystem Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌐 Support Ecosystem
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inner Architect</span>
                <span className="px-2 py-1 bg-trust-100 text-trust-800 text-xs rounded-full">
                  Confidence Building
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SoberPal</span>
                <span className="px-2 py-1 bg-wellness-100 text-wellness-800 text-xs rounded-full">
                  Supporting Recovery
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provider Dashboard</span>
                <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                  Monitoring Progress
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Medical Support</span>
                <span className="px-2 py-1 bg-intimacy-100 text-intimacy-800 text-xs rounded-full">
                  24/7 Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}