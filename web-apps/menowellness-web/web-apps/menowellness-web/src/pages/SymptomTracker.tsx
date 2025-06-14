import React, { useState } from 'react'
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import SymptomChart from '../components/SymptomChart'
import FeatureGate, { UsageLimit } from '../components/FeatureGate'
import { useSubscription } from '../hooks/useSubscription'

export default function SymptomTracker() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [symptomCount, setSymptomCount] = useState(45) // Example current usage
  const { tier } = useSubscription()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Symptom Tracker</h1>
          <p className="text-gray-600 mt-1">Monitor your menopause journey with detailed tracking</p>
        </div>
        <UsageLimit limitType="symptoms" current={symptomCount}>
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Log Symptoms
          </button>
        </UsageLimit>
      </div>

      <div className="card">
        <div className="flex items-center mb-6">
          <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold">Symptom Trends & Analysis</h2>
        </div>
        <SymptomChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Symptoms</h3>
          <div className="space-y-3">
            {/* Mock recent symptoms */}
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Hot Flashes</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded">Moderate</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Sleep Issues</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">Severe</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Mood Swings</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">Mild</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">🤖 AI Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Pattern Alert</p>
              <p className="text-sm text-blue-700 mt-1">Hot flashes increase on high-stress days. Consider stress management from Inner Architect.</p>
            </div>
            <div className="p-4 bg-wellness-50 rounded-lg">
              <p className="text-sm font-medium text-wellness-900">Progress Update</p>
              <p className="text-sm text-wellness-700 mt-1">Your symptoms have improved 23% since starting relationship therapy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}