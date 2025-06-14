import React from 'react'
import { 
  HeartIcon, 
  CalendarIcon, 
  UsersIcon, 
  ChartBarIcon,
  BeakerIcon,
  TrophyIcon,
  FireIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const userData = {
    name: 'Lisa',
    partnerName: 'Mark',
    babyName: 'Olivia',
    babyAge: '6 weeks',
    postpartumDay: 42,
    mentalHealthScore: 68,
    sleepQuality: 45,
    supportLevel: 82,
    recoveryStage: 'Early Recovery',
    breastfeedingStatus: 'Successful'
  }

  const todayStats = [
    {
      name: 'Mental Wellness',
      value: `${userData.mentalHealthScore}%`,
      change: '+8%',
      changeType: 'increase',
      icon: HeartIcon,
      color: 'text-mental-600',
      bgColor: 'bg-mental-100'
    },
    {
      name: 'Sleep Quality',
      value: `${userData.sleepQuality}%`,
      change: '-5%',
      changeType: 'decrease',
      icon: CalendarIcon,
      color: 'text-postpartum-600',
      bgColor: 'bg-postpartum-100'
    },
    {
      name: 'Support Network',
      value: `${userData.supportLevel}%`,
      change: '+15%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'text-support-600',
      bgColor: 'bg-support-100'
    },
    {
      name: 'Recovery Progress',
      value: 'Good',
      change: '+2 levels',
      changeType: 'increase',
      icon: TrophyIcon,
      color: 'text-recovery-600',
      bgColor: 'bg-recovery-100'
    }
  ]

  const ecosystemInsights = [
    {
      app: 'PregnancyCompanion',
      insight: 'Prenatal preparation reducing postpartum anxiety by 42%',
      effectiveness: 89,
      technique: 'Transition Preparation',
      type: 'health'
    },
    {
      app: 'Inner Architect',
      insight: 'Mindfulness techniques improving maternal bonding by 34%',
      effectiveness: 76,
      technique: 'NLP Emotional Regulation',
      type: 'nlp'
    },
    {
      app: 'MyConfidant',
      insight: 'Partner communication reducing relationship stress by 28%',
      effectiveness: 84,
      technique: 'Relationship Support',
      type: 'relationship'
    }
  ]

  const todayTasks = [
    { task: 'Mood tracking check-in', completed: true, time: '9:00 AM', priority: 'high' },
    { task: 'Baby feeding & sleep log', completed: true, time: '10:30 AM', priority: 'high' },
    { task: 'Partner connection time', completed: false, time: '7:00 PM', priority: 'medium' },
    { task: 'Self-care activity (15 min)', completed: false, time: '2:00 PM', priority: 'medium' },
    { task: 'Support group check-in', completed: false, time: '8:00 PM', priority: 'low' },
  ]

  const moodPattern = [
    { day: 'Mon', mood: 6, energy: 4, anxiety: 7 },
    { day: 'Tue', mood: 7, energy: 5, anxiety: 6 },
    { day: 'Wed', mood: 5, energy: 3, anxiety: 8 },
    { day: 'Thu', mood: 8, energy: 6, anxiety: 5 },
    { day: 'Fri', mood: 7, energy: 5, anxiety: 6 },
    { day: 'Sat', mood: 6, energy: 4, anxiety: 7 },
    { day: 'Today', mood: 7, energy: 6, anxiety: 5 },
  ]

  const riskFactors = [
    { factor: 'Sleep deprivation', level: 'High', trend: 'Stable' },
    { factor: 'Social isolation', level: 'Medium', trend: 'Improving' },
    { factor: 'Hormonal changes', level: 'Medium', trend: 'Normalizing' },
    { factor: 'Partner stress', level: 'Low', trend: 'Stable' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-postpartum-600 via-mental-600 to-support-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">
            You're doing amazing, {userData.name}! 💜✨
          </h1>
          <div className="flex items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.postpartumDay} days</p>
              <p className="text-sm opacity-90">Postpartum</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.babyAge}</p>
              <p className="text-sm opacity-90">{userData.babyName}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.mentalHealthScore}%</p>
              <p className="text-sm opacity-90">Wellness</p>
            </div>
          </div>
          <p className="text-lg opacity-90">
            You're in <span className="font-semibold">{userData.recoveryStage}</span>. 
            {userData.partnerName} and your support network are here for you.
          </p>
        </div>
        
        {/* Heart animation */}
        <div className="absolute top-4 right-4 w-24 h-24">
          <HeartIcon className="w-full h-full text-white/20 animate-pulse" />
        </div>
      </div>

      {/* Crisis Support - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <PhoneIcon className="h-5 w-5" />
          <span className="font-medium">Crisis Hotline</span>
        </button>
        <button className="bg-mental-600 hover:bg-mental-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <UsersIcon className="h-5 w-5" />
          <span className="font-medium">Support Group</span>
        </button>
        <button className="bg-postpartum-600 hover:bg-postpartum-700 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <HeartIcon className="h-5 w-5" />
          <span className="font-medium">Mood Check</span>
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
                    stat.changeType === 'increase' ? 'text-recovery-600' : 'text-red-600'
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
              <h3 className="text-lg font-semibold text-gray-900">🌐 Ecosystem Postpartum Support</h3>
              <div className="text-xs text-gray-500">
                🤖 Powered by SentimentAsAService
              </div>
            </div>
            <div className="space-y-4">
              {ecosystemInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'health' ? 'bg-recovery-50 border-recovery-400' :
                  insight.type === 'nlp' ? 'bg-mental-50 border-mental-400' :
                  'bg-support-50 border-support-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        insight.type === 'health' ? 'text-recovery-900' :
                        insight.type === 'nlp' ? 'text-mental-900' :
                        'text-support-900'
                      }`}>
                        {insight.app} Integration
                      </p>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'health' ? 'text-recovery-700' :
                        insight.type === 'nlp' ? 'text-mental-700' :
                        'text-support-700'
                      }`}>
                        {insight.insight}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{insight.technique}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Effectiveness</p>
                      <p className="text-lg font-bold text-recovery-600">{insight.effectiveness}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mood & Wellness Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">📊 Weekly Mood Pattern</h3>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {moodPattern.map((day, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-center">
                  <span className={`text-sm font-medium ${
                    day.day === 'Today' ? 'text-postpartum-900' : 'text-gray-600'
                  }`}>
                    {day.day}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Mood</span>
                      <span>{day.mood}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-mental-500 rounded-full"
                        style={{ width: `${day.mood * 10}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Energy</span>
                      <span>{day.energy}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-support-500 rounded-full"
                        style={{ width: `${day.energy * 10}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Anxiety</span>
                      <span>{day.anxiety}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-red-400 rounded-full"
                        style={{ width: `${day.anxiety * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Factor Monitoring */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Risk Factor Monitoring</h3>
            <div className="space-y-4">
              {riskFactors.map((risk, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{risk.factor}</p>
                    <p className="text-xs text-gray-500">Trend: {risk.trend}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    risk.level === 'High' ? 'bg-red-100 text-red-800' :
                    risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {risk.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Today's Wellness Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Wellness Plan</h3>
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    className="w-4 h-4 text-postpartum-600 rounded focus:ring-postpartum-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.task}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-mental-100 text-mental-800' : 
                        task.priority === 'medium' ? 'bg-postpartum-100 text-postpartum-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{task.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Completion: <span className="font-medium text-recovery-600">
                  {Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)}%
                </span>
              </p>
            </div>
          </div>

          {/* AI Wellness Coach */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 AI Wellness Coach
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-mental-50 rounded-lg">
                <p className="text-sm text-mental-800 font-medium">Mood Support</p>
                <p className="text-sm text-mental-700 mt-1">
                  Your mood is improving! Consider the breathing exercises from Inner Architect during tough moments.
                </p>
              </div>
              <div className="p-4 bg-support-50 rounded-lg">
                <p className="text-sm text-support-800 font-medium">Sleep Strategy</p>
                <p className="text-sm text-support-700 mt-1">
                  Sleep when {userData.babyName} sleeps. Ask {userData.partnerName} to take the night shift tonight.
                </p>
              </div>
              <div className="p-4 bg-recovery-50 rounded-lg">
                <p className="text-sm text-recovery-800 font-medium">Recovery Focus</p>
                <p className="text-sm text-recovery-700 mt-1">
                  Your body is healing well. Gentle movement and adequate nutrition will accelerate recovery.
                </p>
              </div>
            </div>
          </div>

          {/* Baby & Feeding Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👶 {userData.babyName}'s Care</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-postpartum-50 rounded-lg">
                <span className="text-sm font-medium text-postpartum-800">Feeding Schedule</span>
                <span className="text-sm text-postpartum-600">On Track</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-support-50 rounded-lg">
                <span className="text-sm font-medium text-support-800">Sleep Pattern</span>
                <span className="text-sm text-support-600">Improving</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-mental-50 rounded-lg">
                <span className="text-sm font-medium text-mental-800">Bonding Progress</span>
                <span className="text-sm text-mental-600">Excellent</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-recovery-50 rounded-lg">
                <span className="text-sm font-medium text-recovery-800">Growth & Development</span>
                <span className="text-sm text-recovery-600">Thriving</span>
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
                <span className="text-sm text-gray-600">PregnancyCompanion</span>
                <span className="px-2 py-1 bg-recovery-100 text-recovery-800 text-xs rounded-full">
                  Transition Data
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inner Architect</span>
                <span className="px-2 py-1 bg-mental-100 text-mental-800 text-xs rounded-full">
                  Emotional Support
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MyConfidant</span>
                <span className="px-2 py-1 bg-support-100 text-support-800 text-xs rounded-full">
                  Partner Connection
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Crisis Support</span>
                <span className="px-2 py-1 bg-postpartum-100 text-postpartum-800 text-xs rounded-full">
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