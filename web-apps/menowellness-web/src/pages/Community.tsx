
import { UserGroupIcon } from '@heroicons/react/24/outline'

export default function Community() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Community Support</h1>
        <p className="text-gray-600 mt-1">Connect with others on their menopause journey</p>
      </div>

      <div className="card">
        <div className="flex items-center mb-6">
          <UserGroupIcon className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold">Community Hub</h2>
        </div>
        <div className="text-center py-12">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Community features coming soon!</p>
          <p className="text-sm text-gray-500 mt-2">Connect, share, and support each other</p>
        </div>
      </div>
    </div>
  )
}