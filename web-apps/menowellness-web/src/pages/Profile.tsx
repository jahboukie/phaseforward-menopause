import React from 'react'
import { UserCircleIcon } from '@heroicons/react/24/outline'

export default function Profile() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="card">
        <div className="flex items-center mb-6">
          <UserCircleIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold">Account Settings</h2>
        </div>
        <div className="text-center py-12">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Profile settings coming soon!</p>
        </div>
      </div>
    </div>
  )
}