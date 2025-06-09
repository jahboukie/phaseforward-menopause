import React from 'react'
import { 
 FireIcon, 
 HeartIcon, 
 ChartBarIcon, 
 UserGroupIcon,
 ArrowTrendingUpIcon,
 ExclamationTriangleIcon,
 SparklesIcon,
 CalendarIcon
} from '@heroicons/react/24/outline'
import { useEcosystem } from '../hooks/useEcosystem'

export default function Dashboard() {
 const { isConnected, crossAppData, sentimentData } = useEcosystem()

 // Mock user data for demonstration
 const userData = {
   name: 'Sarah',
   menopauseStage: 'Perimenopause',
   daysTracking: 127,
   currentSymptoms: 3,
   improvementTrend: '+12%'
 }

 const todayStats = [
   {
     name: 'Current Symptoms',
     value: userData.currentSymptoms,
     change: '+1',
     changeType: 'increase',
     icon: ExclamationTriangleIcon,
     color: 'text-orange-600',
     bgColor: 'bg-orange-100'
   },
   {
     name: 'Treatment Days',
     value: userData.daysTracking,
     change: '+1',
     changeType: 'increase',
     icon: FireIcon,
     color: 'text-primary-600',
     bgColor: 'bg-primary-100'
   },
   {
     name: 'Wellness Score',
     value: '78%',
     change: userData.improvementTrend,
     changeType: 'increase',
     icon: ArrowTrendingUpIcon,
     color: 'text-wellness-600',
     bgColor: 'bg-wellness-100'
   },
   {
     name: 'Community Support',
     value: '12',
     change: '+3',
     changeType: 'increase',
     icon: UserGroupIcon,
     color: 'text-secondary-600',
     bgColor: 'bg-secondary-100'
   }
 ]

 return (
   <div className="space-y-8">
     {/* Welcome Header */}
     <div className="bg-gradient-wellness rounded-2xl p-8 text-white">
       <div className="max-w-3xl">
         <h1 className="text-3xl font-bold mb-2">
           Good morning, {userData.name}! 🌅
         </h1>
         <p className="text-lg opacity-90 mb-4">
           You're in your <span className="font-semibold">{userData.menopauseStage}</span> journey. 
           Here's how you're doing today.
         </p>
         <div className="flex items-center space-x-6 text-sm">
           <div className="flex items-center">
             <FireIcon className="h-5 w-5 mr-2" />
             <span>{userData.daysTracking} days tracking</span>
           </div>
           <div className="flex items-center">
             <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
             <span>{userData.improvementTrend} improvement this month</span>
           </div>
         </div>
       </div>
     </div>

     {/* Stats Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
       {todayStats.map((stat) => (
         <div key={stat.name} className="card">
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
       {/* Left Column - Charts and Insights */}
       <div className="lg:col-span-2 space-y-8">
         {/* Ecosystem Intelligence */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-gray-900">🌐 Ecosystem Intelligence</h3>
             <div className="text-xs text-gray-500">
               🤖 Powered by SentimentAsAService
             </div>
           </div>
           {isConnected && crossAppData ? (
             <div className="space-y-4">
               <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                 <p className="text-sm font-medium text-blue-900">Inner Architect Integration</p>
                 <p className="text-sm text-blue-700 mt-1">
                   NLP stress reduction techniques are reducing your hot flash frequency by 23%. 
                   Your mindfulness practice correlates with better sleep quality.
                 </p>
                 <p className="text-xs text-gray-600 mt-1">
                   Effectiveness: {crossAppData.innerArchitect?.effectiveness || 89}%
                 </p>
               </div>
               <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-400">
                 <p className="text-sm font-medium text-pink-900">MyConfidant Integration</p>
                 <p className="text-sm text-pink-700 mt-1">
                   Stronger relationship communication is improving your emotional wellbeing during perimenopause. 
                   Partners who understand menopause provide 34% better support.
                 </p>
                 <p className="text-xs text-gray-600 mt-1">
                   Effectiveness: {crossAppData.myConfidant?.effectiveness || 76}%
                 </p>
               </div>
               <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                 <p className="text-sm font-medium text-green-900">SoberPal Integration</p>
                 <p className="text-sm text-green-700 mt-1">
                   Your overall health improvements are supporting hormonal balance. 
                   Reduced alcohol consumption correlates with fewer night sweats.
                 </p>
                 <p className="text-xs text-gray-600 mt-1">
                   Effectiveness: {crossAppData.soberPal?.effectiveness || 82}%
                 </p>
               </div>
             </div>
           ) : (
             <div className="text-center py-8 text-gray-500">
               <SparklesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p>Connecting to ecosystem...</p>
             </div>
           )}
         </div>

         {/* Symptom Tracking Chart */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-gray-900">Weekly Symptom Patterns</h3>
             <ChartBarIcon className="h-5 w-5 text-gray-400" />
           </div>
           <div className="space-y-4">
             <div className="grid grid-cols-7 gap-2">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                 <div key={day} className="text-center">
                   <p className="text-xs text-gray-500 mb-2">{day}</p>
                   <div className="bg-gray-100 rounded h-20 flex items-end justify-center">
                     <div 
                       className="bg-primary-500 rounded-t w-full"
                       style={{ height: `${20 + (index * 8)}%` }}
                     ></div>
                   </div>
                   <p className="text-xs text-gray-600 mt-1">{2 + (index % 3)}</p>
                 </div>
               ))}
             </div>
             <div className="flex items-center justify-between text-sm text-gray-600">
               <span>Hot Flashes this week: 18 (-23% vs last week)</span>
               <span className="text-wellness-600 font-medium">Improving trend</span>
             </div>
           </div>
         </div>

         {/* Treatment Progress */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-gray-900">Treatment Progress</h3>
             <HeartIcon className="h-5 w-5 text-gray-400" />
           </div>
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <span className="text-sm text-gray-600">Hormone Replacement Therapy</span>
               <div className="flex items-center">
                 <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                   <div className="w-20 bg-primary-500 h-2 rounded-full"></div>
                 </div>
                 <span className="text-sm text-gray-900">Day 63</span>
               </div>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-gray-600">Calcium + Vitamin D</span>
               <div className="flex items-center">
                 <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                   <div className="w-24 bg-wellness-500 h-2 rounded-full"></div>
                 </div>
                 <span className="text-sm text-gray-900">Day 127</span>
               </div>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-gray-600">Exercise Routine</span>
               <div className="flex items-center">
                 <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                   <div className="w-16 bg-secondary-500 h-2 rounded-full"></div>
                 </div>
                 <span className="text-sm text-gray-900">4x/week</span>
               </div>
             </div>
           </div>
         </div>
       </div>

       {/* Right Column - Community and Quick Actions */}
       <div className="space-y-8">
         {/* Quick Actions */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
           <div className="space-y-3">
             <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left">
               📝 Log Today's Symptoms
             </button>
             <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors text-left">
               💊 Update Treatments
             </button>
             <button className="w-full bg-wellness-600 hover:bg-wellness-700 text-white px-4 py-3 rounded-lg font-medium transition-colors text-left">
               🧘‍♀️ Start Wellness Check
             </button>
             <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors text-left">
               👥 Connect with Community
             </button>
           </div>
         </div>

         {/* Community Highlights */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Community Highlights</h3>
           <div className="space-y-4">
             <div className="flex items-start space-x-3">
               <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                 <span className="text-primary-600 text-sm font-medium">M</span>
               </div>
               <div className="flex-1">
                 <p className="text-sm font-medium text-gray-900">Maria shared a tip</p>
                 <p className="text-sm text-gray-600">"Evening primrose oil really helped with my night sweats!"</p>
                 <p className="text-xs text-gray-500 mt-1">2 hours ago • 8 likes</p>
               </div>
             </div>
             <div className="flex items-start space-x-3">
               <div className="w-8 h-8 bg-wellness-100 rounded-full flex items-center justify-center">
                 <span className="text-wellness-600 text-sm font-medium">J</span>
               </div>
               <div className="flex-1">
                 <p className="text-sm font-medium text-gray-900">Jennifer achieved a milestone</p>
                 <p className="text-sm text-gray-600">30 days symptom-free with HRT</p>
                 <p className="text-xs text-gray-500 mt-1">5 hours ago • 12 celebrations</p>
               </div>
             </div>
           </div>
         </div>

         {/* AI Insights */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">
             🤖 AI Insights
           </h3>
           <div className="space-y-4">
             <div className="p-4 bg-blue-50 rounded-lg">
               <p className="text-sm text-blue-800 font-medium">Pattern Detected</p>
               <p className="text-sm text-blue-700 mt-1">
                 Your symptoms tend to increase on Mondays. Consider stress management techniques.
               </p>
             </div>
             <div className="p-4 bg-wellness-50 rounded-lg">
               <p className="text-sm text-wellness-800 font-medium">Positive Trend</p>
               <p className="text-sm text-wellness-700 mt-1">
                 Your sleep quality has improved 23% since starting evening yoga.
               </p>
             </div>
             <div className="p-4 bg-primary-50 rounded-lg">
               <p className="text-sm text-primary-800 font-medium">Cross-App Insight</p>
               <p className="text-sm text-primary-700 mt-1">
                 Your relationship wellness score correlates with symptom management success.
               </p>
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
               <span className="px-2 py-1 bg-wellness-100 text-wellness-800 text-xs rounded-full">
                 Connected
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-gray-600">Provider Dashboard</span>
               <span className="px-2 py-1 bg-wellness-100 text-wellness-800 text-xs rounded-full">
                 Synced
               </span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-gray-600">AI Insights</span>
               <span className="px-2 py-1 bg-wellness-100 text-wellness-800 text-xs rounded-full">
                 Active
               </span>
             </div>
           </div>
         </div>
       </div>
     </div>
   </div>
 )
}