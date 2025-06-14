import React from 'react'
import { 
  ShieldCheckIcon, 
  HeartIcon, 
  TrophyIcon, 
  UsersIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  BrainIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const userData = {
    name: 'Jordan',
    sobrietyStartDate: '2023-08-15',
    currentStreak: 147, // days
    substanceType: 'Alcohol',
    recoveryStage: 'Maintenance',
    supportNetworkSize: 8,
    wellnessScore: 84
  }

  const daysSober = userData.currentStreak
  const weeksSober = Math.floor(daysSober / 7)
  const monthsSober = Math.floor(daysSober / 30)

  const todayStats = [
    {
      name: 'Days Sober',
      value: daysSober,
      change: '+1',
      changeType: 'increase',
      icon: ShieldCheckIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Wellness Score',
      value: `${userData.wellnessScore}%`,
      change: '+12%',
      changeType: 'increase',
      icon: HeartIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Support Network',
      value: userData.supportNetworkSize,
      change: '+2',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Craving Level',
      value: 'Low',
      change: '-40%',
      changeType: 'decrease',
      icon: BrainIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const milestones = [
    { days: 1, name: 'First Day', achieved: true, date: '2023-08-15' },
    { days: 7, name: 'One Week', achieved: true, date: '2023-08-22' },
    { days: 30, name: 'One Month', achieved: true, date: '2023-09-14' },
    { days: 90, name: 'Three Months', achieved: true, date: '2023-11-13' },
    { days: 180, name: 'Six Months', achieved: false, date: null },
    { days: 365, name: 'One Year', achieved: false, date: null },
  ]

  const ecosystemInsights = [
    {
      app: 'Inner Architect',
      insight: 'Parts Integration technique reduced cravings by 67%',
      effectiveness: 92,
      technique: 'Parts Integration for Addiction',
      type: 'nlp'
    },
    {
      app: 'MyConfidant',
      insight: 'Strong relationship support increases sobriety success by 89%',
      effectiveness: 89,
      technique: 'Communication Skills',
      type: 'relationship'
    },
    {
      app: 'MenoWellness',
      insight: 'Partner\'s health journey strengthens recovery motivation',
      effectiveness: 76,
      technique: 'Mutual Support',
      type: 'health'
    }
  ]

  const todayChecklist = [
    { task: 'Morning meditation', completed: true, time: '7:00 AM' },
    { task: 'Gratitude journal', completed: true, time: '7:30 AM' },
    { task: 'Exercise routine', completed: false, time: '6:00 PM' },
    { task: 'Evening reflection', completed: false, time: '9:00 PM' },
    { task: 'Support group check-in', completed: false, time: '8:00 PM' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-blue-700 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">
            Strong today, {userData.name}! 💪✨
          </h1>
          <div className="flex items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{daysSober}</p>
              <p className="text-sm opacity-90">Days Sober</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{weeksSober}</p>
              <p className="text-sm opacity-90">Weeks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{monthsSober}</p>
              <p className="text-sm opacity-90">Months</p>
            </div>
          </div>
          <p className="text-lg opacity-90">
            You're in <span className="font-semibold">{userData.recoveryStage}</span> stage. 
            Your ecosystem is supporting your recovery journey.
          </p>
        </div>
        
        {/* Shield animation */}
        <div className="absolute top-4 right-4 w-24 h-24">
          <ShieldCheckIcon className="w-full h-full text-white/20 animate-pulse" />
        </div>
      </div>

      {/* Emergency Support - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <PhoneIcon className="h-5 w-5" />
          <span className="font-medium">Crisis Hotline</span>
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <UsersIcon className="h-5 w-5" />
          <span className="font-medium">Contact Sponsor</span>
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <BrainIcon className="h-5 w-5" />
          <span className="font-medium">NLP Craving Tool</span>
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
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-orange-600'
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
              <h3 className="text-lg font-semibold text-gray-900">🌐 Ecosystem Recovery Support</h3>
              <div className="text-xs text-gray-500">
                🤖 Powered by SentimentAsAService
              </div>
            </div>
            <div className="space-y-4">
              {ecosystemInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'nlp' ? 'bg-purple-50 border-purple-400' :
                  insight.type === 'relationship' ? 'bg-pink-50 border-pink-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        insight.type === 'nlp' ? 'text-purple-900' :
                        insight.type === 'relationship' ? 'text-pink-900' :
                        'text-blue-900'
                      }`}>
                        {insight.app} Integration
                      </p>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'nlp' ? 'text-purple-700' :
                        insight.type === 'relationship' ? 'text-pink-700' :
                        'text-blue-700'
                      }`}>
                        {insight.insight}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{insight.technique}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Effectiveness</p>
                      <p className="text-lg font-bold text-green-600">{insight.effectiveness}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recovery Milestones</h3>
              <TrophyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.achieved 
                      ? 'bg-green-100 text-green-600' 
                      : daysSober >= milestone.days 
                        ? 'bg-yellow-100 text-yellow-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {milestone.achieved ? (
                      <TrophyIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{milestone.days}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      milestone.achieved ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      {milestone.name} ({milestone.days} days)
                    </p>
                    {milestone.achieved && (
                      <p className="text-sm text-green-600">
                        Achieved: {new Date(milestone.date!).toLocaleDateString()}
                      </p>
                    )}
                    {!milestone.achieved && daysSober >= milestone.days && (
                      <p className="text-sm text-yellow-600">Ready to celebrate!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Today's Checklist */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Recovery Plan</h3>
            <div className="space-y-3">
              {todayChecklist.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={item.completed}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.task}
                    </p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Completion: <span className="font-medium text-green-600">
                  {Math.round((todayChecklist.filter(i => i.completed).length / todayChecklist.length) * 100)}%
                </span>
              </p>
            </div>
          </div>

          {/* AI Recovery Coach */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 AI Recovery Coach
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">Daily Motivation</p>
                <p className="text-sm text-green-700 mt-1">
                  Your relationship work is strengthening your recovery. Keep using those communication skills!
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">NLP Technique Suggestion</p>
                <p className="text-sm text-purple-700 mt-1">
                  Try "Anchor Collapse" from Inner Architect when cravings arise. 92% effective for you.
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">Risk Alert</p>
                <p className="text-sm text-blue-700 mt-1">
                  Stress levels elevated today. Consider meditation or calling your sponsor.
                </p>
              </div>
            </div>
          </div>

          {/* Support Network */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Network</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sponsor - Mike</span>
                <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Available
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AA Group</span>
                <button className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Tonight 7PM
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Partner (MyConfidant)</span>
                <button className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                  Supporting
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recovery Buddy</span>
                <button className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Message
                </button>
              </div>
            </div>
          </div>

          {/* Ecosystem Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌐 Recovery Ecosystem
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inner Architect</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  NLP Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MyConfidant</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                  Supporting
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provider Dashboard</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Monitoring
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Crisis Support</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  24/7 Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}