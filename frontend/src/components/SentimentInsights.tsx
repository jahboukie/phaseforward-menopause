import {
  FaceSmileIcon,
  FaceFrownIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

interface SentimentInsightsProps {
  sentimentData: any
  loading: boolean
  ecosystemInsights: any
}

export default function SentimentInsights({ loading }: SentimentInsightsProps) {
  // Mock sentiment trend data for demonstration
  const sentimentTrend = [
    { date: '2024-01-01', sentiment: 0.65, mood: 'Good', symptoms: 2 },
    { date: '2024-01-02', sentiment: 0.45, mood: 'Fair', symptoms: 4 },
    { date: '2024-01-03', sentiment: 0.72, mood: 'Great', symptoms: 1 },
    { date: '2024-01-04', sentiment: 0.58, mood: 'Good', symptoms: 3 },
    { date: '2024-01-05', sentiment: 0.41, mood: 'Challenging', symptoms: 5 },
    { date: '2024-01-06', sentiment: 0.68, mood: 'Good', symptoms: 2 },
    { date: '2024-01-07', sentiment: 0.74, mood: 'Excellent', symptoms: 1 },
  ]

  const avgSentiment = sentimentTrend.reduce((sum, day) => sum + day.sentiment, 0) / sentimentTrend.length

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.6) return 'text-wellness-600'
    if (sentiment > 0.4) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getSentimentBg = (sentiment: number) => {
    if (sentiment > 0.6) return 'bg-wellness-100'
    if (sentiment > 0.4) return 'bg-yellow-100'
    return 'bg-orange-100'
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-primary-600" />
          Ecosystem Intelligence Insights
        </h3>
        <div className="text-xs text-gray-500">
          🤖 Powered by SentimentAsAService
        </div>
      </div>

      {/* Current Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${getSentimentBg(avgSentiment)}`}>
          <div className="flex items-center">
            {avgSentiment > 0.6 ? (
              <FaceSmileIcon className={`h-6 w-6 ${getSentimentColor(avgSentiment)} mr-2`} />
            ) : (
              <FaceFrownIcon className={`h-6 w-6 ${getSentimentColor(avgSentiment)} mr-2`} />
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Wellness</p>
              <p className={`text-xl font-bold ${getSentimentColor(avgSentiment)}`}>
                {Math.round(avgSentiment * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-secondary-100 rounded-lg">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-secondary-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">Trend</p>
              <p className="text-xl font-bold text-secondary-600">
                {sentimentTrend[sentimentTrend.length - 1].sentiment > sentimentTrend[0].sentiment ? '↗️' : '↘️'} 
                {' '}Improving
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary-100 rounded-lg">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-gray-600">AI Confidence</p>
              <p className="text-xl font-bold text-primary-600">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Trend Chart */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">7-Day Wellness Journey</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 1]} tickFormatter={(value) => `${Math.round(value * 100)}%`} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
                formatter={(value: any, name) => [
                  name === 'sentiment' ? `${Math.round(value * 100)}%` : value,
                  name === 'sentiment' ? 'Wellness Score' : 'Symptom Count'
                ]}
              />
              <Area
                type="monotone"
                dataKey="sentiment"
                stroke="#84cc16"
                fill="#84cc16"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-App Correlations */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Cross-App Intelligence</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">💝 MyConfidant Connection</h5>
            <p className="text-sm text-blue-700">
              Your relationship wellness score (78%) positively correlates with menopause symptom management.
            </p>
            <div className="mt-2 text-xs text-blue-600">
              Correlation strength: <span className="font-medium">0.72</span>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <h5 className="font-medium text-purple-900 mb-2">🧠 Inner Architect Insights</h5>
            <p className="text-sm text-purple-700">
              NLP mindfulness techniques show 34% improvement in managing hot flashes.
            </p>
            <div className="mt-2 text-xs text-purple-600">
              Effectiveness rate: <span className="font-medium">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="border-t pt-6 mt-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">🤖 AI-Powered Recommendations</h4>
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-wellness-50 rounded-lg">
            <div className="w-2 h-2 bg-wellness-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-wellness-900">Optimal Treatment Timing</p>
              <p className="text-sm text-wellness-700">
                Based on your patterns, evening hormone therapy shows 18% better effectiveness.
              </p>
            </div>
          </div>

          <div className="flex items-start p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">Lifestyle Integration</p>
              <p className="text-sm text-blue-700">
                Your meditation sessions from Inner Architect correlate with 25% fewer night sweats.
              </p>
            </div>
          </div>

          <div className="flex items-start p-3 bg-primary-50 rounded-lg">
            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-primary-900">Provider Insights</p>
              <p className="text-sm text-primary-700">
                Your healthcare provider has new recommendations based on your recent progress.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem Data Quality Indicator */}
      <div className="border-t pt-4 mt-6">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Data powered by 
            <span className="font-medium text-primary-600 ml-1">SentimentAsAService</span>
          </span>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-wellness-500 rounded-full mr-1"></div>
            <span>Real-time analysis active</span>
          </div>
        </div>
      </div>
    </div>
  )
}