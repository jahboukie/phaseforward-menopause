import React, { useState } from 'react'
import { HeartIcon, PlusIcon, StarIcon } from '@heroicons/react/24/outline'
import TreatmentProgress from '../components/TreatmentProgress'
import FeatureGate from '../components/FeatureGate'
import { useSubscription } from '../hooks/useSubscription'

export default function TreatmentPlanner() {
  const { tier } = useSubscription()
  const [selectedTreatment, setSelectedTreatment] = useState(null)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treatment Planner</h1>
          <p className="text-gray-600 mt-1">Manage your personalized menopause treatment plan</p>
        </div>
        <FeatureGate feature="personalizedAIRecommendations">
          <button className="btn-primary flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Treatment Plan
          </button>
        </FeatureGate>
      </div>

      <div className="card">
        <div className="flex items-center mb-6">
          <HeartIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold">Active Treatments</h2>
        </div>
        <TreatmentProgress />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">🤖 AI Treatment Recommendations</h2>
            <FeatureGate feature="personalizedAIRecommendations">
              <button className="btn-secondary text-sm">
                Refresh Recommendations
              </button>
            </FeatureGate>
          </div>
          <FeatureGate feature="personalizedAIRecommendations">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Hormone Replacement Therapy</h4>
                    <p className="text-sm text-blue-700 mt-1">Based on your symptoms, HRT may provide significant relief</p>
                  </div>
                  <StarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="mt-3 flex space-x-2">
                  <FeatureGate feature="hrtOptimization">
                    <button className="btn-primary text-sm">Learn More</button>
                  </FeatureGate>
                  <button className="btn-secondary text-sm">Add to Plan</button>
                </div>
              </div>
              <div className="p-4 bg-wellness-50 rounded-lg border border-wellness-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-wellness-900">Nutrition & Exercise Plan</h4>
                    <p className="text-sm text-wellness-700 mt-1">Customized meal and fitness plans for your menopause stage</p>
                  </div>
                  <StarIcon className="h-5 w-5 text-wellness-600" />
                </div>
                <div className="mt-3 flex space-x-2">
                  <FeatureGate feature="nutritionExercisePlans">
                    <button className="btn-primary text-sm">View Plan</button>
                  </FeatureGate>
                  <button className="btn-secondary text-sm">Add to Plan</button>
                </div>
              </div>
            </div>
          </FeatureGate>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Treatment Categories</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Basic Symptom Management</span>
              <span className="text-green-600 text-sm font-medium">Available</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Hormone Therapy Options</span>
              <FeatureGate 
                feature="hrtOptimization" 
                fallback={<span className="text-gray-400 text-sm">Complete Care Required</span>}
              >
                <span className="text-green-600 text-sm font-medium">Available</span>
              </FeatureGate>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Custom Meal Planning</span>
              <FeatureGate 
                feature="customMealPlanning" 
                fallback={<span className="text-gray-400 text-sm">Ultimate Required</span>}
              >
                <span className="text-green-600 text-sm font-medium">Available</span>
              </FeatureGate>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span>Provider Integration</span>
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
    </div>
  )
}