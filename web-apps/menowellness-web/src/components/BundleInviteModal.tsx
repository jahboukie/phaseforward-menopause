import React, { useState } from 'react'
import { 
  XMarkIcon, 
  HeartIcon, 
  UserPlusIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface BundleInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvitePartner: (partnerEmail: string) => Promise<void>
  onSkipForNow: () => void
  bundleTier: 'couples_bundle' | 'ultimate_couples'
}

export default function BundleInviteModal({ 
  isOpen, 
  onClose, 
  onInvitePartner, 
  onSkipForNow,
  bundleTier 
}: BundleInviteModalProps) {
  const [partnerEmail, setPartnerEmail] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  if (!isOpen) return null

  const bundleInfo = {
    couples_bundle: {
      name: 'Couples Bundle',
      price: '$19.99/month',
      savings: 'Better value than separate apps',
      features: [
        'MenoWellness symptom tracking (50 entries)',
        'SupportPartner with Mama Grace AI',
        '75 shared AI queries per month',
        'Cross-app insights & analytics',
        'Partner connection alerts',
        'Basic relationship health tracking'
      ]
    },
    ultimate_couples: {
      name: 'Ultimate Couples',
      price: '$29.99/month',
      savings: 'Save $6/month vs separate',
      features: [
        'Unlimited symptom tracking & AI queries',
        'Complete education library access',
        'Advanced relationship analytics',
        'Full cross-app data sharing',
        'Partner mood correlation insights',
        'Enterprise analytics dashboard'
      ]
    }
  }

  const currentBundle = bundleInfo[bundleTier]

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!partnerEmail.trim()) return

    setIsInviting(true)
    try {
      await onInvitePartner(partnerEmail.trim())
      setInviteSent(true)
    } catch (error) {
      console.error('Error inviting partner:', error)
      // Handle error (could show error message)
    } finally {
      setIsInviting(false)
    }
  }

  if (inviteSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Invitation Sent!</h3>
            <p className="text-gray-600 mb-6">
              We've sent an invitation to <strong>{partnerEmail}</strong> to join your {currentBundle.name}.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What happens next:</strong><br />
                Your partner will receive an email with a link to download the SupportPartner app and connect to your account.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invite Your Partner</h2>
            <p className="text-gray-600">Get the most out of your {currentBundle.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bundle Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentBundle.name}</h3>
                <p className="text-gray-600">{currentBundle.savings}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{currentBundle.price}</div>
                <div className="text-sm text-gray-500">for both apps</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentBundle.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <CheckIcon className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Why Invite Partner */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HeartIcon className="h-5 w-5 text-pink-500 mr-2" />
              Why invite your partner?
            </h4>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                  <span className="text-green-600 text-sm font-bold">1</span>
                </div>
                <p><strong>Better Support:</strong> Your partner gets AI-powered guidance on how to support you through difficult days.</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <p><strong>Shared Insights:</strong> Your partner can see your progress and symptoms (with your permission) to offer better support.</p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
                <p><strong>Stronger Relationship:</strong> Couples using both apps report 40% better relationship satisfaction.</p>
              </div>
            </div>
          </div>

          {/* Invite Form */}
          <form onSubmit={handleInviteSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Partner's Email Address
              </label>
              <input
                type="email"
                id="partnerEmail"
                value={partnerEmail}
                onChange={(e) => setPartnerEmail(e.target.value)}
                placeholder="your.partner@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                We'll send them an invitation to download the SupportPartner app and connect to your account.
              </p>
            </div>

            <button
              type="submit"
              disabled={isInviting || !partnerEmail.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isInviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Send Invitation
                </>
              )}
            </button>
          </form>

          {/* Skip Option */}
          <div className="text-center">
            <button
              onClick={onSkipForNow}
              className="text-gray-500 hover:text-gray-700 font-medium underline"
            >
              Skip for now (you can invite your partner later)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}