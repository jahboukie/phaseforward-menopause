import React from 'react'
import { 
  BrainIcon, 
  ChartBarIcon, 
  SparklesIcon, 
  TrophyIcon,
  FireIcon,
  HeartIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const userData = {
    name: 'Alex',
    totalSessions: 127,
    techniquesLearned: 23,
    masteryLevel: 'Advanced Practitioner',
    currentStreak: 12,
    transformationScore: 87
  }

  const todayStats = [
    {
      name: 'Transformation Score',
      value: `${userData.transformationScore}%`,
      change: '+8%',
      changeType: 'increase',
      icon: SparklesIcon,
      color: 'text-transformation-600',
      bgColor: 'bg-transformation-100'
    },
    {
      name: 'Current Streak',
      value: userData.currentStreak,
      change: '+1',
      changeType: 'increase',
      icon: FireIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      name: 'Techniques Mastered',
      value: userData.techniquesLearned,
      change: '+2',
      changeType: 'increase',
      icon: BrainIcon,
      color: 'text-mind-600',
      bgColor: 'bg-mind-100'
    },
    {
      name: 'Cross-App Wellness',
      value: '92%',
      change: '+15%',
      changeType: 'increase',
      icon: HeartIcon,
      color: 'text-growth-600',
      bgColor: 'bg-growth-100'
    }
  ]

  const recentTechniques = [
    {
      name: 'Anchoring for Confidence',
      category: 'Foundational',
      lastUsed: '2 hours ago',
      effectiveness: 94,
      sessions: 8
    },
    {
      name: 'Timeline Therapy',
      category: 'Change Work',
      lastUsed: '1 day ago',
      effectiveness: 87,
      sessions: 5
    },
    {
      name: 'Swish Pattern',
      category: 'Change Work',
      lastUsed: '2 days ago',
      effectiveness: 91,
      sessions: 12
    }
  ]

  const ecosystemInsights = [
    {
      app: 'MenoWellness',
      insight: 'Your mindfulness anchoring reduces hot flashes by 34%',
      correlation: 0.73,
      type: 'health'
    },
    {
      app: 'MyConfidant',
      insight: 'Rapport building techniques improved relationship score by 28%',
      correlation: 0.81,
      type: 'relationship'
    },
    {
      app: 'SoberPal',
      insight: 'Parts integration supports addiction recovery (92% effectiveness)',
      correlation: 0.89,
      type: 'recovery'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-mind-600 via-primary-700 to-secondary-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {userData.name}! 🧠✨
          </h1>
          <p className="text-lg opacity-90 mb-4">
            You're an <span className="font-semibold">{userData.masteryLevel}</span> with {userData.techniquesLearned} NLP techniques mastered.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center">
              <FireIcon className="h-5 w-5 mr-2" />
              <span>{userData.currentStreak} day streak</span>
            </div>
            <div className="flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2" />
              <span>{userData.totalSessions} total sessions</span>
            </div>
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" />
              <span>{userData.transformationScore}% transformation score</span>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full animate-mind-pulse"></div>
        <div className="absolute bottom-4 right-16 w-16 h-16 bg-white/5 rounded-full animate-mind-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <span className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-growth-600' : 'text-red-600'
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
        {/* Left Column - Techniques and Progress */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Techniques */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent NLP Techniques</h3>
              <BrainIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentTechniques.map((technique, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{technique.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{technique.category} • {technique.sessions} sessions</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Effectiveness</span>
                          <span className="font-medium">{technique.effectiveness}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-mind-500 to-growth-500"
                            style={{ width: `${technique.effectiveness}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{technique.lastUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ecosystem Cross-App Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">🌐 Ecosystem Intelligence</h3>
              <div className="text-xs text-gray-500">
                🤖 Powered by SentimentAsAService
              </div>
            </div>
            <div className="space-y-4">
              {ecosystemInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'health' ? 'bg-orange-50 border-orange-400' :
                  insight.type === 'relationship' ? 'bg-pink-50 border-pink-400' :
                  'bg-blue-50 border-blue-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        insight.type === 'health' ? 'text-orange-900' :
                        insight.type === 'relationship' ? 'text-pink-900' :
                        'text-blue-900'
                      }`}>
                        {insight.app} Integration
                      </p>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'health' ? 'text-orange-700' :
                        insight.type === 'relationship' ? 'text-pink-700' :
                        'text-blue-700'
                      }`}>
                        {insight.insight}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Correlation</p>
                      <p className="text-sm font-medium">{insight.correlation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions and AI */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-mind-600 hover:bg-mind-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left">
                🧠 Start NLP Session
              </button>
              <button className="w-full bg-growth-600 hover:bg-growth-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left">
                📈 Review Progress
              </button>
              <button className="w-full bg-transformation-600 hover:bg-transformation-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left">
                ✨ Explore New Techniques
              </button>
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors text-left">
                🎯 Set Transformation Goals
              </button>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 AI Transformation Coach
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-mind-50 rounded-lg">
                <p className="text-sm text-mind-800 font-medium">Technique Recommendation</p>
                <p className="text-sm text-mind-700 mt-1">
                  Try "Core Transformation" - your submodality work shows you're ready for deeper change.
                </p>
              </div>
              <div className="p-4 bg-growth-50 rounded-lg">
                <p className="text-sm text-growth-800 font-medium">Mastery Progress</p>
                <p className="text-sm text-growth-700 mt-1">
                  You're 3 techniques away from "NLP Master" certification level.
                </p>
              </div>
              <div className="p-4 bg-transformation-50 rounded-lg">
                <p className="text-sm text-transformation-800 font-medium">Cross-Domain Impact</p>
                <p className="text-sm text-transformation-700 mt-1">
                  Your NLP practice is enhancing success across all health apps by 34%.
                </p>
              </div>
            </div>
          </div>

          {/* Technique Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🎯 Technique Categories
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Foundational</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="w-12 bg-mind-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">6/8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Language Patterns</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="w-10 bg-growth-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">5/8</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Change Work</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="w-8 bg-transformation-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">4/12</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Advanced</span>
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="w-6 bg-secondary-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-xs text-gray-500">3/15</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ecosystem Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌐 Ecosystem Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MyConfidant</span>
                <span className="px-2 py-1 bg-growth-100 text-growth-800 text-xs rounded-full">
                  Synced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MenoWellness</span>
                <span className="px-2 py-1 bg-growth-100 text-growth-800 text-xs rounded-full">
                  Integrated
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">SoberPal</span>
                <span className="px-2 py-1 bg-growth-100 text-growth-800 text-xs rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Coach</span>
                <span className="px-2 py-1 bg-mind-100 text-mind-800 text-xs rounded-full">
                  Learning
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}