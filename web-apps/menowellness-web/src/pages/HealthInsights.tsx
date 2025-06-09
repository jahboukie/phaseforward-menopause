import React from 'react'
import { LightBulbIcon } from '@heroicons/react/24/outline'
import SentimentInsights from '../components/SentimentInsights'

export default function HealthInsights() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Insights</h1>
        <p className="text-gray-600 mt-1">AI-powered insights from your ecosystem data</p>
      </div>

      <SentimentInsights sentimentData={null} loading={false} ecosystemInsights={null} />
    </div>
  )
}