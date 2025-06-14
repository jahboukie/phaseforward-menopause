import React from 'react'
import { 
  SparklesIcon, 
  CalendarIcon, 
  HeartIcon, 
  ChartBarIcon,
  BeakerIcon,
  TrophyIcon,
  FireIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const userData = {
    name: 'Sarah',
    cycleDay: 14,
    cycleLength: 28,
    daysUntilOvulation: 0,
    fertilityScore: 89,
    ovulationProbability: 95,
    tryingMonths: 6,
    partnerName: 'David',
    overallHealth: 82
  }

  const todayStats = [
    {
      name: 'Fertility Score',
      value: `${userData.fertilityScore}%`,
      change: '+12%',
      changeType: 'increase',
      icon: SparklesIcon,
      color: 'text-fertility-600',
      bgColor: 'bg-fertility-100'
    },
    {
      name: 'Ovulation Window',
      value: 'Today!',
      change: 'Peak',
      changeType: 'increase',
      icon: CalendarIcon,
      color: 'text-cycle-600',
      bgColor: 'bg-cycle-100'
    },
    {
      name: 'Cycle Day',
      value: userData.cycleDay,
      change: 'Day 14',
      changeType: 'neutral',
      icon: ChartBarIcon,
      color: 'text-conception-600',
      bgColor: 'bg-conception-100'
    },
    {
      name: 'Health Score',
      value: `${userData.overallHealth}%`,
      change: '+8%',
      changeType: 'increase',
      icon: HeartIcon,
      color: 'text-wellness-600',
      bgColor: 'bg-wellness-100'
    }
  ]

  const ecosystemInsights = [
    {
      app: 'MenoWellness',
      insight: 'Hormone balance optimization increasing conception odds by 34%',
      effectiveness: 87,
      technique: 'Hormonal Wellness',
      type: 'health'
    },
    {
      app: 'Inner Architect',
      insight: 'Stress reduction techniques improving fertility by 23%',
      effectiveness: 76,
      technique: 'NLP Relaxation',
      type: 'nlp'
    },
    {
      app: 'MyConfidant',
      insight: 'Partner communication enhancing conception timing',
      effectiveness: 91,
      technique: 'Relationship Harmony',
      type: 'relationship'
    }
  ]

  const todayActions = [
    { task: 'Take ovulation test', completed: true, time: '7:00 AM', priority: 'high' },
    { task: 'Log basal body temperature', completed: true, time: '7:15 AM', priority: 'high' },
    { task: 'Partner intimacy window', completed: false, time: '8:00 PM', priority: 'high' },
    { task: 'Fertility vitamins', completed: false, time: '6:00 PM', priority: 'medium' },
    { task: 'Stress reduction meditation', completed: false, time: '9:00 PM', priority: 'medium' },
  ]

  const cyclePhases = [
    { phase: 'Menstrual', days: '1-5', status: 'completed', color: 'bg-red-500' },
    { phase: 'Follicular', days: '1-13', status: 'completed', color: 'bg-blue-500' },
    { phase: 'Ovulation', days: '14', status: 'current', color: 'bg-fertility-500' },
    { phase: 'Luteal', days: '15-28', status: 'upcoming', color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-fertility-600 via-conception-600 to-cycle-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">
            Peak fertility today, {userData.name}! ✨🌸
          </h1>
          <div className="flex items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{userData.ovulationProbability}%</p>
              <p className="text-sm opacity-90">Ovulation Chance</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">Day {userData.cycleDay}</p>
              <p className="text-sm opacity-90">Cycle Day</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.tryingMonths} months</p>
              <p className="text-sm opacity-90">TTC Journey</p>
            </div>
          </div>
          <p className="text-lg opacity-90">
            Your fertile window is <span className="font-semibold">now</span>! 
            Optimal time for conception with {userData.partnerName}.
          </p>
        </div>
        
        {/* Sparkles animation */}
        <div className="absolute top-4 right-4 w-24 h-24">
          <SparklesIcon className="w-full h-full text-white/20 animate-pulse" />
        </div>
      </div>

      {/* Critical Timing Alert */}
      <div className="bg-gradient-to-r from-fertility-500 to-conception-500 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6" />
            <span className="font-medium">🎯 Optimal Conception Window: Next 12-24 Hours</span>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Set Reminder
          </button>
        </div>
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
                    stat.changeType === 'increase' ? 'text-fertility-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
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
              <h3 className="text-lg font-semibold text-gray-900">🌐 Ecosystem Fertility Support</h3>
              <div className="text-xs text-gray-500">
                🤖 Powered by SentimentAsAService
              </div>
            </div>
            <div className="space-y-4">
              {ecosystemInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'health' ? 'bg-wellness-50 border-wellness-400' :
                  insight.type === 'nlp' ? 'bg-fertility-50 border-fertility-400' :
                  'bg-conception-50 border-conception-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        insight.type === 'health' ? 'text-wellness-900' :
                        insight.type === 'nlp' ? 'text-fertility-900' :
                        'text-conception-900'
                      }`}>
                        {insight.app} Integration
                      </p>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'health' ? 'text-wellness-700' :
                        insight.type === 'nlp' ? 'text-fertility-700' :
                        'text-conception-700'
                      }`}>
                        {insight.insight}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{insight.technique}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Effectiveness</p>
                      <p className="text-lg font-bold text-fertility-600">{insight.effectiveness}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cycle Visualization */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Cycle Overview</h3>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {cyclePhases.map((phase, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${phase.color} ${
                    phase.status === 'current' ? 'animate-pulse' : ''
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        phase.status === 'current' ? 'text-fertility-900' : 'text-gray-700'
                      }`}>
                        {phase.phase}
                      </span>
                      <span className="text-sm text-gray-500">Days {phase.days}</span>
                    </div>
                    {phase.status === 'current' && (
                      <p className="text-sm text-fertility-600 mt-1">🎯 Peak fertility window!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tracking Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Recent Tracking</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Basal Body Temp</p>
                <p className="text-lg font-bold text-fertility-600">98.4°F</p>
                <p className="text-xs text-gray-500">+0.3° from yesterday</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Cervical Mucus</p>
                <p className="text-lg font-bold text-conception-600">Egg White</p>
                <p className="text-xs text-gray-500">Peak fertility</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">LH Surge</p>
                <p className="text-lg font-bold text-cycle-600">Positive</p>
                <p className="text-xs text-gray-500">Ovulation imminent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Today's Action Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Fertility Plan</h3>
            <div className="space-y-3">
              {todayActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={action.completed}
                    className="w-4 h-4 text-fertility-600 rounded focus:ring-fertility-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${action.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {action.task}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        action.priority === 'high' ? 'bg-cycle-100 text-cycle-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Completion: <span className="font-medium text-fertility-600">
                  {Math.round((todayActions.filter(a => a.completed).length / todayActions.length) * 100)}%
                </span>
              </p>
            </div>
          </div>

          {/* AI Fertility Coach */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 AI Fertility Coach
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-fertility-50 rounded-lg">
                <p className="text-sm text-fertility-800 font-medium">Optimal Timing</p>
                <p className="text-sm text-fertility-700 mt-1">
                  Your LH surge indicates ovulation in 12-36 hours. Plan intimacy for tonight and tomorrow morning.
                </p>
              </div>
              <div className="p-4 bg-conception-50 rounded-lg">
                <p className="text-sm text-conception-800 font-medium">Nutrition Boost</p>
                <p className="text-sm text-conception-700 mt-1">
                  Add folate-rich foods today. Your partner should increase zinc intake for optimal sperm quality.
                </p>
              </div>
              <div className="p-4 bg-wellness-50 rounded-lg">
                <p className="text-sm text-wellness-800 font-medium">Stress Management</p>
                <p className="text-sm text-wellness-700 mt-1">
                  Use the Inner Architect relaxation techniques. Lower cortisol improves conception odds by 18%.
                </p>
              </div>
            </div>
          </div>

          {/* Partner Coordination */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner Sync</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-conception-50 rounded-lg">
                <span className="text-sm font-medium text-conception-800">{userData.partnerName}'s Health</span>
                <span className="text-sm text-conception-600">92% Ready</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-fertility-50 rounded-lg">
                <span className="text-sm font-medium text-fertility-800">Timing Alignment</span>
                <span className="text-sm text-fertility-600">Synced</span>
              </div>
              <button className="w-full bg-fertility-600 hover:bg-fertility-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Send Fertility Window Alert
              </button>
            </div>
          </div>

          {/* Ecosystem Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🌐 Support Ecosystem
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MenoWellness</span>
                <span className="px-2 py-1 bg-wellness-100 text-wellness-800 text-xs rounded-full">
                  Hormone Support
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inner Architect</span>
                <span className="px-2 py-1 bg-fertility-100 text-fertility-800 text-xs rounded-full">
                  Stress Reduction
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MyConfidant</span>
                <span className="px-2 py-1 bg-conception-100 text-conception-800 text-xs rounded-full">
                  Partner Harmony
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provider Dashboard</span>
                <span className="px-2 py-1 bg-cycle-100 text-cycle-800 text-xs rounded-full">
                  Monitoring
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}