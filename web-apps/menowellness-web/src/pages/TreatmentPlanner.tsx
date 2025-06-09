import React from 'react'
import { HeartIcon } from '@heroicons/react/24/outline'
import TreatmentProgress from '../components/TreatmentProgress'

export default function TreatmentPlanner() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Treatment Planner</h1>
        <p className="text-gray-600 mt-1">Manage your personalized menopause treatment plan</p>
      </div>

      <div className="card">
        <div className="flex items-center mb-6">
          <HeartIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold">Active Treatments</h2>
        </div>
        <TreatmentProgress />
      </div>
    </div>
  )
}