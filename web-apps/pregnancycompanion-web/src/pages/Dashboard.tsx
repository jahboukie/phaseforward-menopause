import React from 'react'
import { 
  BabyIcon, 
  CalendarIcon, 
  HeartIcon, 
  ChartBarIcon,
  BeakerIcon,
  TrophyIcon,
  FireIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const userData = {
    name: 'Emma',
    partnerName: 'James',
    gestationalWeeks: 24,
    gestationalDays: 3,
    trimester: 2,
    dueDate: '2024-08-15',
    babyGender: 'Girl',
    nextAppointment: '2024-01-15',
    overallHealth: 89,
    babyHealth: 94
  }

  const weeksLeft = Math.ceil((new Date('2024-08-15').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7))

  const todayStats = [
    {
      name: 'Pregnancy Progress',
      value: `${userData.gestationalWeeks}w ${userData.gestationalDays}d`,
      change: '+7 days',
      changeType: 'increase',
      icon: BabyIcon,
      color: 'text-pregnancy-600',
      bgColor: 'bg-pregnancy-100'
    },
    {
      name: 'Trimester',
      value: `${userData.trimester}nd`,
      change: 'Week 24',
      changeType: 'neutral',
      icon: CalendarIcon,
      color: 'text-trimester-600',
      bgColor: 'bg-trimester-100'
    },
    {
      name: 'Maternal Health',
      value: `${userData.overallHealth}%`,
      change: '+5%',
      changeType: 'increase',
      icon: HeartIcon,
      color: 'text-maternal-600',
      bgColor: 'bg-maternal-100'
    },
    {
      name: 'Baby Development',
      value: `${userData.babyHealth}%`,
      change: 'On Track',
      changeType: 'increase',
      icon: SparklesIcon,
      color: 'text-baby-600',
      bgColor: 'bg-baby-100'
    }
  ]

  const ecosystemInsights = [
    {
      app: 'FertilityTracker',
      insight: 'Pre-conception health optimizations supporting healthy pregnancy',
      effectiveness: 92,
      technique: 'Fertility Preparation',
      type: 'health'
    },
    {
      app: 'Inner Architect',
      insight: 'Prenatal bonding techniques reducing anxiety by 45%',
      effectiveness: 87,
      technique: 'NLP Maternal Bonding',
      type: 'nlp'
    },
    {
      app: 'MyConfidant',
      insight: 'Partner support improving pregnancy satisfaction by 38%',
      effectiveness: 84,
      technique: 'Relationship Strengthening',
      type: 'relationship'
    }
  ]

  const todayTasks = [
    { task: 'Take prenatal vitamins', completed: true, time: '8:00 AM', priority: 'high' },
    { task: 'Kick count monitoring', completed: true, time: '2:00 PM', priority: 'high' },
    { task: 'Gentle prenatal exercise', completed: false, time: '5:00 PM', priority: 'medium' },
    { task: 'Pregnancy meditation', completed: false, time: '7:00 PM', priority: 'medium' },
    { task: 'Partner bonding time', completed: false, time: '8:30 PM', priority: 'low' },
  ]

  const babyMilestones = [
    { week: 20, milestone: 'Anatomy scan', achieved: true, date: '2023-12-10' },
    { week: 24, milestone: 'Viability milestone', achieved: true, date: 'Today!' },
    { week: 28, milestone: 'Third trimester', achieved: false, date: null },
    { week: 32, milestone: 'Baby shower planning', achieved: false, date: null },
    { week: 36, milestone: 'Full term preparation', achieved: false, date: null },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pregnancy-600 via-baby-600 to-trimester-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">
            Beautiful journey, {userData.name}! 🤱✨
          </h1>
          <div className="flex items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{userData.gestationalWeeks}w {userData.gestationalDays}d</p>
              <p className="text-sm opacity-90">Pregnant</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{weeksLeft} weeks</p>
              <p className="text-sm opacity-90">To Go</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{userData.babyGender}</p>
              <p className="text-sm opacity-90">Baby</p>
            </div>
          </div>
          <p className="text-lg opacity-90">
            You're in your <span className="font-semibold">{userData.trimester}nd trimester</span>. 
            Your baby is developing beautifully with {userData.partnerName}'s loving support.
          </p>
        </div>
        
        {/* Baby icon animation */}
        <div className="absolute top-4 right-4 w-24 h-24">
          <BabyIcon className="w-full h-full text-white/20 animate-pulse" />
        </div>
      </div>

      {/* Important Milestone Alert */}
      <div className="bg-gradient-to-r from-baby-500 to-pregnancy-500 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-6 w-6" />
            <span className="font-medium">🎉 Milestone: Viability Week - Your baby can survive outside the womb!</span>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Celebrate
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
                    stat.changeType === 'increase' ? 'text-maternal-600' : 
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
              <h3 className="text-lg font-semibold text-gray-900">🌐 Ecosystem Pregnancy Support</h3>
              <div className="text-xs text-gray-500">
                🤖 Powered by SentimentAsAService
              </div>
            </div>
            <div className="space-y-4">
              {ecosystemInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'health' ? 'bg-maternal-50 border-maternal-400' :
                  insight.type === 'nlp' ? 'bg-pregnancy-50 border-pregnancy-400' :
                  'bg-baby-50 border-baby-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        insight.type === 'health' ? 'text-maternal-900' :
                        insight.type === 'nlp' ? 'text-pregnancy-900' :
                        'text-baby-900'
                      }`}>
                        {insight.app} Integration
                      </p>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'health' ? 'text-maternal-700' :
                        insight.type === 'nlp' ? 'text-pregnancy-700' :
                        'text-baby-700'
                      }`}>
                        {insight.insight}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{insight.technique}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Effectiveness</p>
                      <p className="text-lg font-bold text-maternal-600">{insight.effectiveness}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Baby Development This Week */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">👶 Baby Development - Week {userData.gestationalWeeks}</h3>
              <BabyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="bg-baby-50 rounded-lg p-4">
                <h4 className="font-medium text-baby-900">Size & Growth</h4>
                <p className="text-sm text-baby-700 mt-1">
                  Your baby is about the size of a cantaloupe (12 inches, 1.3 pounds). 
                  Rapid brain development and lung maturation are occurring.
                </p>
              </div>
              <div className="bg-pregnancy-50 rounded-lg p-4">
                <h4 className="font-medium text-pregnancy-900">New This Week</h4>
                <p className="text-sm text-pregnancy-700 mt-1">
                  Your baby's hearing is fully developed! She can recognize your voice and {userData.partnerName}'s voice. 
                  Taste buds are forming, and she's swallowing amniotic fluid.
                </p>
              </div>
              <div className="bg-trimester-50 rounded-lg p-4">
                <h4 className="font-medium text-trimester-900">Movement Patterns</h4>
                <p className="text-sm text-trimester-700 mt-1">
                  You should feel 10 movements in 2 hours during active periods. 
                  Kicks are becoming stronger and more coordinated.
                </p>
              </div>
            </div>
          </div>

          {/* Pregnancy Milestones */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pregnancy Milestones</h3>
              <TrophyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {babyMilestones.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    milestone.achieved 
                      ? 'bg-maternal-100 text-maternal-600' 
                      : userData.gestationalWeeks >= milestone.week 
                        ? 'bg-baby-100 text-baby-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {milestone.achieved ? (
                      <TrophyIcon className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{milestone.week}w</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      milestone.achieved ? 'text-maternal-900' : 'text-gray-600'
                    }`}>
                      {milestone.milestone} (Week {milestone.week})
                    </p>
                    {milestone.achieved && (
                      <p className="text-sm text-maternal-600">
                        Achieved: {milestone.date}
                      </p>
                    )}
                    {!milestone.achieved && userData.gestationalWeeks >= milestone.week && (
                      <p className="text-sm text-baby-600">Ready to achieve!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Today's Wellness Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Pregnancy Plan</h3>
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    className="w-4 h-4 text-pregnancy-600 rounded focus:ring-pregnancy-500"
                    readOnly
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.task}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-pregnancy-100 text-pregnancy-800' : 
                        task.priority === 'medium' ? 'bg-baby-100 text-baby-800' :
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
                Completion: <span className="font-medium text-maternal-600">
                  {Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)}%
                </span>
              </p>
            </div>
          </div>

          {/* AI Pregnancy Coach */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🤖 AI Pregnancy Coach
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-pregnancy-50 rounded-lg">
                <p className="text-sm text-pregnancy-800 font-medium">24-Week Milestone</p>
                <p className="text-sm text-pregnancy-700 mt-1">
                  Congratulations on reaching viability! Your baby has excellent survival chances. Focus on continued healthy habits.
                </p>
              </div>
              <div className="p-4 bg-baby-50 rounded-lg">
                <p className="text-sm text-baby-800 font-medium">Nutrition Focus</p>
                <p className="text-sm text-baby-700 mt-1">
                  Increase calcium and protein intake. Your baby's bones are hardening and muscle development is accelerating.
                </p>
              </div>
              <div className="p-4 bg-maternal-50 rounded-lg">
                <p className="text-sm text-maternal-800 font-medium">Partner Bonding</p>
                <p className="text-sm text-maternal-700 mt-1">
                  Your baby can hear both parents now. Reading together and playing music supports emotional development.
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Care</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-trimester-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-trimester-800">Prenatal Checkup</p>
                  <p className="text-xs text-trimester-600">Dr. Sarah Chen</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-trimester-800">Jan 15</p>
                  <p className="text-xs text-trimester-600">10:00 AM</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-baby-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-baby-800">Glucose Screening</p>
                  <p className="text-xs text-baby-600">Lab Work</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-baby-800">Jan 22</p>
                  <p className="text-xs text-baby-600">8:00 AM</p>
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
                <span className="text-sm text-gray-600">FertilityTracker</span>
                <span className="px-2 py-1 bg-maternal-100 text-maternal-800 text-xs rounded-full">
                  Pre-Conception Data
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inner Architect</span>
                <span className="px-2 py-1 bg-pregnancy-100 text-pregnancy-800 text-xs rounded-full">
                  Prenatal Bonding
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">MyConfidant</span>
                <span className="px-2 py-1 bg-baby-100 text-baby-800 text-xs rounded-full">
                  Partner Support
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provider Dashboard</span>
                <span className="px-2 py-1 bg-trimester-100 text-trimester-800 text-xs rounded-full">
                  Monitoring Care
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}