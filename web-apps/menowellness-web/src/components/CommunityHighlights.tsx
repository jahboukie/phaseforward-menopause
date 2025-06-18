
import { HeartIcon, ChatBubbleLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function CommunityHighlights() {
  const highlights = [
    {
      type: 'support',
      title: 'Sarah shared her HRT experience',
      time: '2 hours ago',
      engagement: 12,
      preview: 'Started HRT 3 months ago and finally feeling like myself again...'
    },
    {
      type: 'milestone',
      title: 'Maria celebrated 6 months symptom-free',
      time: '5 hours ago',
      engagement: 28,
      preview: 'Thanks to this community and my treatment plan, I haven\'t had...'
    },
    {
      type: 'question',
      title: 'Help with night sweats?',
      time: '1 day ago',
      engagement: 15,
      preview: 'Anyone found natural remedies that actually work for...'
    }
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Community Highlights</h3>
        <UserGroupIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {highlights.map((highlight, index) => (
          <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                highlight.type === 'support' ? 'bg-wellness-100' :
                highlight.type === 'milestone' ? 'bg-primary-100' :
                'bg-secondary-100'
              }`}>
                {highlight.type === 'support' ? (
                  <HeartIcon className="h-4 w-4 text-wellness-600" />
                ) : highlight.type === 'milestone' ? (
                  <HeartIcon className="h-4 w-4 text-primary-600" />
                ) : (
                  <ChatBubbleLeftIcon className="h-4 w-4 text-secondary-600" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{highlight.title}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{highlight.preview}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{highlight.time}</span>
                  <span className="text-xs text-gray-500">{highlight.engagement} responses</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 btn-secondary text-sm">
        View All Community Posts
      </button>
    </div>
  )
}