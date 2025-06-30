
import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

const treatments = [
  {
    id: 1,
    name: 'Hormone Replacement Therapy',
    type: 'Medication',
    startDate: '2024-01-01',
    status: 'active',
    effectiveness: 78,
    sideEffects: ['Mild nausea', 'Breast tenderness'],
    dosage: '1mg daily',
    nextReview: '2024-02-15'
  },
  {
    id: 2,
    name: 'Evening Primrose Oil',
    type: 'Supplement',
    startDate: '2023-12-15',
    status: 'active',
    effectiveness: 65,
    sideEffects: [],
    dosage: '1000mg twice daily',
    nextReview: '2024-02-01'
  },
  {
    id: 3,
    name: 'Mindfulness Meditation',
    type: 'Lifestyle',
    startDate: '2023-11-20',
    status: 'active',
    effectiveness: 82,
    sideEffects: [],
    dosage: '20 minutes daily',
    nextReview: 'Ongoing'
  },
  {
    id: 4,
    name: 'Calcium Supplement',
    type: 'Supplement',
    startDate: '2024-01-10',
    status: 'trial',
    effectiveness: null,
    sideEffects: [],
    dosage: '600mg with meals',
    nextReview: '2024-02-10'
  }
]

export default function TreatmentProgress() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-wellness-600" />
      case 'trial':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      case 'discontinued':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getEffectivenessColor = (effectiveness: number | null) => {
    if (effectiveness === null) return 'bg-gray-200'
    if (effectiveness >= 75) return 'bg-wellness-500'
    if (effectiveness >= 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="space-y-4">
      {treatments.map((treatment) => (
        <div key={treatment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getStatusIcon(treatment.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    treatment.status === 'active' ? 'bg-wellness-100 text-wellness-800' :
                    treatment.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {treatment.status}
                  </span>
                </div>
                
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{treatment.type} • {treatment.dosage}</span>
                    <span>Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
                  </div>
                  
                  {treatment.effectiveness !== null && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Effectiveness</span>
                        <span className="font-medium">{treatment.effectiveness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getEffectivenessColor(treatment.effectiveness)}`}
                          style={{ width: `${treatment.effectiveness}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {treatment.sideEffects.length > 0 && (
                    <div className="text-sm">
                      <span className="text-gray-600">Side effects: </span>
                      <span className="text-orange-600">{treatment.sideEffects.join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Next review: {treatment.nextReview}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-900 mb-2">🤖 AI Treatment Insights</h4>
        <div className="text-sm text-primary-800 space-y-2">
          <p>• Your mindfulness practice shows highest effectiveness (82%) - consider increasing frequency</p>
          <p>• HRT effectiveness correlates with consistent sleep schedule from your wellness tracking</p>
          <p>• Relationship support from MyConfidant enhances treatment adherence by 34%</p>
        </div>
      </div>
    </div>
  )
}