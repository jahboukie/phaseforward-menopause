import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  UserCircleIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  DevicePhoneMobileIcon,
  HeartIcon,
  CalendarIcon,
  InformationCircleIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Switch } from '@headlessui/react'

// Form validation schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional()
})

const healthInfoSchema = z.object({
  menopauseStage: z.enum(['perimenopause', 'menopause', 'postmenopause', 'unsure']),
  symptomsSince: z.string().optional(),
  currentTreatments: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional()
})

type PersonalInfoForm = z.infer<typeof personalInfoSchema>
type HealthInfoForm = z.infer<typeof healthInfoSchema>

interface NotificationSettings {
  dailyReminders: boolean
  symptomTracking: boolean
  treatmentReminders: boolean
  weeklyInsights: boolean
  communityUpdates: boolean
  emergencyAlerts: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

interface PrivacySettings {
  shareDataWithProviders: boolean
  anonymousInsights: boolean
  communityVisibility: boolean
  dataExportEnabled: boolean
  publicProfile: boolean
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'personal' | 'health' | 'notifications' | 'privacy' | 'subscription'>('personal')
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({})
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: 'idle' | 'saving' | 'saved' | 'error' }>({})

  // Sample user data (in real app, this would come from API/context)
  const [userData, setUserData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1975-05-15',
    city: 'San Francisco',
    country: 'United States',
    memberSince: '2024-01-15',
    profileComplete: 85,
    subscription: 'Complete Care',
    subscriptionStatus: 'active'
  })

  const [healthData, setHealthData] = useState({
    menopauseStage: 'perimenopause' as const,
    symptomsSince: '2022-08',
    currentTreatments: ['HRT', 'Calcium Supplements'],
    medicalConditions: ['Hypertension'],
    allergies: 'Shellfish',
    emergencyContact: 'John Johnson - +1 (555) 123-4568',
    lastUpdated: '2024-06-01'
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    dailyReminders: true,
    symptomTracking: true,
    treatmentReminders: true,
    weeklyInsights: true,
    communityUpdates: false,
    emergencyAlerts: true,
    emailNotifications: true,
    pushNotifications: true
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareDataWithProviders: true,
    anonymousInsights: true,
    communityVisibility: false,
    dataExportEnabled: true,
    publicProfile: false
  })

  // Form setup
  const personalForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: userData
  })

  const healthForm = useForm<HealthInfoForm>({
    resolver: zodResolver(healthInfoSchema),
    defaultValues: healthData
  })

  const handleSave = async (section: string, data: any) => {
    setSaveStatus({ ...saveStatus, [section]: 'saving' })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update local state (in real app, this would be API response)
    if (section === 'personal') {
      setUserData({ ...userData, ...data })
    } else if (section === 'health') {
      setHealthData({ ...healthData, ...data })
    }
    
    setSaveStatus({ ...saveStatus, [section]: 'saved' })
    setIsEditing({ ...isEditing, [section]: false })
    
    // Clear save status after 3 seconds
    setTimeout(() => {
      setSaveStatus({ ...saveStatus, [section]: 'idle' })
    }, 3000)
  }

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const togglePrivacy = (key: keyof PrivacySettings) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] })
  }

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: UserCircleIcon },
    { id: 'health', name: 'Health Profile', icon: HeartIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'privacy', name: 'Privacy', icon: ShieldCheckIcon },
    { id: 'subscription', name: 'Subscription', icon: CreditCardIcon }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Completion Banner */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
            <p className="text-gray-600 mt-1">Complete your profile to get personalized insights</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-pink-600">{userData.profileComplete}%</div>
            <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${userData.profileComplete}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <UserCircleIcon className="h-6 w-6 text-pink-600 mr-2" />
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                </div>
                <button
                  onClick={() => setIsEditing({ ...isEditing, personal: !isEditing.personal })}
                  className="btn btn-secondary"
                >
                  {isEditing.personal ? (
                    <>
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={personalForm.handleSubmit((data) => handleSave('personal', data))}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    {isEditing.personal ? (
                      <input
                        {...personalForm.register('firstName')}
                        className="form-input"
                        type="text"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userData.firstName}</p>
                    )}
                    {personalForm.formState.errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{personalForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    {isEditing.personal ? (
                      <input
                        {...personalForm.register('lastName')}
                        className="form-input"
                        type="text"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userData.lastName}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing.personal ? (
                      <input
                        {...personalForm.register('email')}
                        className="form-input"
                        type="email"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing.personal ? (
                      <input
                        {...personalForm.register('phone')}
                        className="form-input"
                        type="tel"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userData.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    {isEditing.personal ? (
                      <input
                        {...personalForm.register('dateOfBirth')}
                        className="form-input"
                        type="date"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    {isEditing.personal ? (
                      <input
                        {...personalForm.register('city')}
                        className="form-input"
                        type="text"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userData.city || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    {isEditing.personal ? (
                      <input
                        {...personalForm.register('country')}
                        className="form-input"
                        type="text"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{userData.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {isEditing.personal && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing({ ...isEditing, personal: false })}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveStatus.personal === 'saving'}
                      className="btn btn-primary"
                    >
                      {saveStatus.personal === 'saving' ? 'Saving...' : 'Save Changes'}
                      {saveStatus.personal === 'saved' && <CheckIcon className="h-4 w-4 ml-1" />}
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Member since {new Date(userData.memberSince).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Health Profile Tab */}
          {activeTab === 'health' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <HeartIcon className="h-6 w-6 text-pink-600 mr-2" />
                  <h2 className="text-lg font-semibold">Health Profile</h2>
                </div>
                <button
                  onClick={() => setIsEditing({ ...isEditing, health: !isEditing.health })}
                  className="btn btn-secondary"
                >
                  {isEditing.health ? (
                    <>
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </>
                  )}
                </button>
              </div>

              <form onSubmit={healthForm.handleSubmit((data) => handleSave('health', data))}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Menopause Stage
                    </label>
                    {isEditing.health ? (
                      <select {...healthForm.register('menopauseStage')} className="form-input">
                        <option value="perimenopause">Perimenopause</option>
                        <option value="menopause">Menopause</option>
                        <option value="postmenopause">Postmenopause</option>
                        <option value="unsure">Not sure</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 py-2 capitalize">{healthData.menopauseStage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms Since
                    </label>
                    {isEditing.health ? (
                      <input
                        {...healthForm.register('symptomsSince')}
                        className="form-input"
                        type="month"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {healthData.symptomsSince ? new Date(healthData.symptomsSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Treatments
                    </label>
                    {isEditing.health ? (
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="List your current treatments, medications, or therapies"
                        defaultValue={healthData.currentTreatments?.join(', ')}
                      />
                    ) : (
                      <div className="py-2">
                        {healthData.currentTreatments?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {healthData.currentTreatments.map((treatment, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                {treatment}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No treatments listed</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medical Conditions
                    </label>
                    {isEditing.health ? (
                      <textarea
                        className="form-input"
                        rows={2}
                        placeholder="List any relevant medical conditions"
                        defaultValue={healthData.medicalConditions?.join(', ')}
                      />
                    ) : (
                      <div className="py-2">
                        {healthData.medicalConditions?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {healthData.medicalConditions.map((condition, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {condition}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No conditions listed</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies
                    </label>
                    {isEditing.health ? (
                      <input
                        {...healthForm.register('allergies')}
                        className="form-input"
                        type="text"
                        placeholder="List any allergies"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{healthData.allergies || 'None listed'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact
                    </label>
                    {isEditing.health ? (
                      <input
                        {...healthForm.register('emergencyContact')}
                        className="form-input"
                        type="text"
                        placeholder="Name and phone number"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{healthData.emergencyContact || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                {isEditing.health && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing({ ...isEditing, health: false })}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveStatus.health === 'saving'}
                      className="btn btn-primary"
                    >
                      {saveStatus.health === 'saving' ? 'Saving...' : 'Save Changes'}
                      {saveStatus.health === 'saved' && <CheckIcon className="h-4 w-4 ml-1" />}
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  Health information is encrypted and only shared with your consent
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <BellIcon className="h-6 w-6 text-pink-600 mr-2" />
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Health Reminders</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'dailyReminders', label: 'Daily wellness check-ins', description: 'Gentle reminders to log your daily symptoms and mood' },
                      { key: 'symptomTracking', label: 'Symptom tracking reminders', description: 'Prompts to track your symptoms at optimal times' },
                      { key: 'treatmentReminders', label: 'Treatment reminders', description: 'Reminders for medications and appointments' },
                      { key: 'emergencyAlerts', label: 'Emergency alerts', description: 'Critical health alerts and emergency protocol notifications' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                        <Switch
                          checked={notifications[key as keyof NotificationSettings]}
                          onChange={() => toggleNotification(key as keyof NotificationSettings)}
                          className={`${notifications[key as keyof NotificationSettings] ? 'bg-pink-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
                        >
                          <span className={`${notifications[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </Switch>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Insights & Community</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'weeklyInsights', label: 'Weekly insights report', description: 'Personalized health insights and progress summaries' },
                      { key: 'communityUpdates', label: 'Community updates', description: 'New discussions, support groups, and community events' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                        <Switch
                          checked={notifications[key as keyof NotificationSettings]}
                          onChange={() => toggleNotification(key as keyof NotificationSettings)}
                          className={`${notifications[key as keyof NotificationSettings] ? 'bg-pink-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
                        >
                          <span className={`${notifications[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </Switch>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Delivery Methods</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email notifications', description: 'Receive notifications via email' },
                      { key: 'pushNotifications', label: 'Push notifications', description: 'Receive notifications on your device' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                          <p className="text-sm text-gray-600">{description}</p>
                        </div>
                        <Switch
                          checked={notifications[key as keyof NotificationSettings]}
                          onChange={() => toggleNotification(key as keyof NotificationSettings)}
                          className={`${notifications[key as keyof NotificationSettings] ? 'bg-pink-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
                        >
                          <span className={`${notifications[key as keyof NotificationSettings] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </Switch>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-pink-600 mr-2" />
                <h2 className="text-lg font-semibold">Privacy & Data</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">Your data is secure</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        All health data is encrypted and stored securely. You have full control over how your information is used and shared.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { 
                      key: 'shareDataWithProviders', 
                      label: 'Share data with healthcare providers', 
                      description: 'Allow your healthcare providers to access your health insights and progress' 
                    },
                    { 
                      key: 'anonymousInsights', 
                      label: 'Contribute to anonymous research', 
                      description: 'Help improve menopause care by contributing anonymized data to research' 
                    },
                    { 
                      key: 'communityVisibility', 
                      label: 'Show profile in community', 
                      description: 'Allow other community members to see your profile and connect with you' 
                    },
                    { 
                      key: 'dataExportEnabled', 
                      label: 'Enable data export', 
                      description: 'Allow yourself to download your complete health data at any time' 
                    },
                    { 
                      key: 'publicProfile', 
                      label: 'Public profile', 
                      description: 'Make your profile visible to other users in the community' 
                    }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                        <p className="text-sm text-gray-600">{description}</p>
                      </div>
                      <Switch
                        checked={privacy[key as keyof PrivacySettings]}
                        onChange={() => togglePrivacy(key as keyof PrivacySettings)}
                        className={`${privacy[key as keyof PrivacySettings] ? 'bg-pink-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
                      >
                        <span className={`${privacy[key as keyof PrivacySettings] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                      </Switch>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Data Management</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <DevicePhoneMobileIcon className="h-4 w-4 mr-2" />
                      Download My Data
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="card">
              <div className="flex items-center mb-6">
                <CreditCardIcon className="h-6 w-6 text-pink-600 mr-2" />
                <h2 className="text-lg font-semibold">Subscription</h2>
              </div>

              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border border-pink-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{userData.subscription}</h3>
                      <p className="text-gray-600">$19.99/month</p>
                      <div className="flex items-center mt-2">
                        <div className={`h-2 w-2 rounded-full mr-2 ${userData.subscriptionStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-600 capitalize">{userData.subscriptionStatus}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Next billing</p>
                      <p className="font-medium">July 15, 2024</p>
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Your Plan Includes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'Personalized AI recommendations',
                      'Advanced symptom tracking',
                      'HRT optimization guidance',
                      'Nutrition and exercise plans',
                      'Sleep quality monitoring',
                      'Stress management tools',
                      'Priority customer support'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Recent Billing</h3>
                  <div className="space-y-3">
                    {[
                      { date: '2024-06-15', amount: '$19.99', status: 'Paid' },
                      { date: '2024-05-15', amount: '$19.99', status: 'Paid' },
                      { date: '2024-04-15', amount: '$19.99', status: 'Paid' }
                    ].map((bill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{bill.amount}</p>
                          <p className="text-sm text-gray-600">{bill.date}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {bill.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Change Plan
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Update Payment Method
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}