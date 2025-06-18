import { useState } from 'react'
import { LightBulbIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline'
import SentimentInsights from '../components/SentimentInsights'
import FeatureGate from '../components/FeatureGate'
import { useSubscription } from '../hooks/useSubscription'

export default function HealthInsights() {
  const { } = useSubscription()
  const [timeRange, setTimeRange] = useState('30d')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Insights</h1>
          <p className="text-gray-600 mt-1">AI-powered insights from your ecosystem data</p>
        </div>
        <FeatureGate feature="advancedAnalytics">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </FeatureGate>
      </div>

      <SentimentInsights sentimentData={null} loading={false} ecosystemInsights={null} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center mb-6">
            <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold">Weekly Progress Report</h2>
          </div>
          <FeatureGate feature="weeklyAICoaching">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Sleep Quality Improvement</h4>
                <p className="text-sm text-green-700 mt-1">Your sleep duration has increased by 23 minutes on average this week.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Symptom Pattern Recognition</h4>
                <p className="text-sm text-blue-700 mt-1">Hot flashes peak between 2-4 PM. Consider adjusting your afternoon routine.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">Treatment Effectiveness</h4>
                <p className="text-sm text-purple-700 mt-1">Your current HRT dosage is showing 89% effectiveness in managing symptoms.</p>
              </div>
            </div>
          </FeatureGate>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Analytics & Reports</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Basic Progress Tracking</span>
              <span className="text-green-600 text-sm font-medium">Available</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Advanced Pattern Analysis</span>
              <FeatureGate 
                feature="advancedAnalytics" 
                fallback={<span className="text-gray-400 text-sm">Ultimate Required</span>}
              >
                <span className="text-green-600 text-sm font-medium">Available</span>
              </FeatureGate>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Weekly AI Coaching Reports</span>
              <FeatureGate 
                feature="weeklyAICoaching" 
                fallback={<span className="text-gray-400 text-sm">Ultimate Required</span>}
              >
                <span className="text-green-600 text-sm font-medium">Available</span>
              </FeatureGate>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Provider Dashboard Integration</span>
              <FeatureGate 
                feature="providerIntegration" 
                fallback={<span className="text-gray-400 text-sm">Ultimate Required</span>}
              >
                <span className="text-green-600 text-sm font-medium">Available</span>
              </FeatureGate>
            </div>
          </div>
        </div>
      </div>

      <FeatureGate feature="advancedAnalytics">
        <div className="card">
          <div className="flex items-center mb-6">
            <LightBulbIcon className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold">Predictive Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">3 days</div>
              <div className="text-sm text-yellow-600">Until next hot flash cluster</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">87%</div>
              <div className="text-sm text-purple-600">Treatment adherence score</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">+15%</div>
              <div className="text-sm text-blue-600">Expected mood improvement</div>
            </div>
          </div>
        </div>
      </FeatureGate>
    </div>
  )
}