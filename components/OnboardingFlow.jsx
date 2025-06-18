// User Onboarding Flow for MenoWellness
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to MenoWellness',
    icon: '🌸',
    description: 'Your personalized journey through menopause starts here'
  },
  {
    id: 'privacy',
    title: 'Your Privacy Matters',
    icon: '🔒',
    description: 'We protect your health data with military-grade encryption'
  },
  {
    id: 'profile',
    title: 'Tell Us About Yourself',
    icon: '👤',
    description: 'Help us personalize your experience'
  },
  {
    id: 'symptoms',
    title: 'Track Your Journey',
    icon: '📊',
    description: 'Monitor symptoms and discover patterns'
  },
  {
    id: 'subscription',
    title: 'Choose Your Plan',
    icon: '💎',
    description: 'Unlock personalized insights and AI recommendations'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    icon: '🎉',
    description: 'Welcome to your menopause wellness journey'
  }
];

export default function OnboardingFlow({ onComplete }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState({
    age: '',
    menopause_stage: '',
    primary_concerns: [],
    notification_preferences: {
      symptom_reminders: true,
      weekly_insights: true,
      educational_content: true
    }
  });

  const currentStepData = ONBOARDING_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(userProfile);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateProfile = (updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return <WelcomeStep />;
      case 'privacy':
        return <PrivacyStep />;
      case 'profile':
        return <ProfileStep profile={userProfile} updateProfile={updateProfile} />;
      case 'symptoms':
        return <SymptomsStep />;
      case 'subscription':
        return <SubscriptionStep />;
      case 'complete':
        return <CompleteStep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">MenoWellness</h1>
            <span className="text-pink-100">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
          </div>
          <div className="w-full bg-pink-300 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentStepData.icon}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 text-lg">
              {currentStepData.description}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-colors"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started!' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Step Components
function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Supporting Women Through Every Stage of Menopause
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="font-medium">Track Symptoms</p>
            <p className="text-gray-600">Monitor your daily experience</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🤖</div>
            <p className="font-medium">AI Insights</p>
            <p className="text-gray-600">Personalized recommendations</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">💝</div>
            <p className="font-medium">Community</p>
            <p className="text-gray-600">Connect with others</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivacyStep() {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          🛡️ HIPAA-Compliant Data Protection
        </h3>
        <div className="space-y-3 text-sm text-green-700">
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span>Your health data is encrypted with military-grade AES-256 encryption</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span>Stored in HIPAA-compliant AWS infrastructure with Business Associate Agreement</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span>Complete audit trail of all data access for compliance</span>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span>You control your data - delete or export anytime</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Human-Claude Collaboration:</strong> This platform was built through 
          an innovative partnership between human healthcare vision and Claude AI's 
          technical expertise, ensuring both compassion and cutting-edge security.
        </p>
      </div>
    </div>
  );
}

function ProfileStep({ profile, updateProfile }) {
  const menopause_stages = [
    { value: 'perimenopause', label: 'Perimenopause (irregular periods)' },
    { value: 'menopause', label: 'Menopause (no periods for 12+ months)' },
    { value: 'postmenopause', label: 'Postmenopause (several years past menopause)' },
    { value: 'not_sure', label: 'Not sure / Just exploring' }
  ];

  const common_concerns = [
    'Hot flashes', 'Night sweats', 'Mood changes', 'Sleep issues',
    'Weight changes', 'Memory/focus', 'Joint pain', 'Fatigue'
  ];

  const toggleConcern = (concern) => {
    const current = profile.primary_concerns || [];
    const updated = current.includes(concern)
      ? current.filter(c => c !== concern)
      : [...current, concern];
    updateProfile({ primary_concerns: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age Range
        </label>
        <select
          value={profile.age}
          onChange={(e) => updateProfile({ age: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        >
          <option value="">Select age range</option>
          <option value="35-39">35-39</option>
          <option value="40-44">40-44</option>
          <option value="45-49">45-49</option>
          <option value="50-54">50-54</option>
          <option value="55-59">55-59</option>
          <option value="60+">60+</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Menopause Stage
        </label>
        <div className="space-y-2">
          {menopause_stages.map(stage => (
            <label key={stage.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="menopause_stage"
                value={stage.value}
                checked={profile.menopause_stage === stage.value}
                onChange={(e) => updateProfile({ menopause_stage: e.target.value })}
                className="mr-3 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm">{stage.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Primary Concerns (select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {common_concerns.map(concern => (
            <label key={concern} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={(profile.primary_concerns || []).includes(concern)}
                onChange={() => toggleConcern(concern)}
                className="mr-2 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm">{concern}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SymptomsStep() {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">
          📊 Track Your Symptoms
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-purple-700">Physical Symptoms</h4>
            <ul className="text-purple-600 space-y-1">
              <li>• Hot flashes intensity & frequency</li>
              <li>• Night sweats</li>
              <li>• Joint pain & headaches</li>
              <li>• Weight changes</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-purple-700">Emotional & Mental</h4>
            <ul className="text-purple-600 space-y-1">
              <li>• Mood & anxiety levels</li>
              <li>• Memory & focus</li>
              <li>• Sleep quality</li>
              <li>• Energy levels</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-4">
          Daily symptom tracking helps you identify patterns and triggers, 
          enabling better conversations with your healthcare provider.
        </p>
        <div className="text-sm text-gray-500">
          ⏰ Daily reminders can be customized in your settings
        </div>
      </div>
    </div>
  );
}

function SubscriptionStep() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <h3 className="font-semibold text-gray-800 mb-2">Basic</h3>
          <div className="text-2xl font-bold text-gray-600 mb-2">Free</div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Basic symptom tracking</li>
            <li>• 7-day history</li>
            <li>• Educational content</li>
          </ul>
        </div>
        
        <div className="border-2 border-pink-500 rounded-lg p-4 text-center bg-pink-50">
          <div className="bg-pink-500 text-white text-xs font-medium px-2 py-1 rounded-full mb-2">
            RECOMMENDED
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Complete Care</h3>
          <div className="text-2xl font-bold text-pink-600 mb-2">$19.99/mo</div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Unlimited symptom tracking</li>
            <li>• AI-powered insights</li>
            <li>• Trend analysis</li>
            <li>• Export reports</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 text-center">
          <h3 className="font-semibold text-gray-800 mb-2">Ultimate Wellness</h3>
          <div className="text-2xl font-bold text-purple-600 mb-2">$29.99/mo</div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Everything in Complete</li>
            <li>• Personalized recommendations</li>
            <li>• Priority support</li>
            <li>• Community access</li>
          </ul>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500">
        You can upgrade, downgrade, or cancel anytime. No long-term commitments.
      </div>
    </div>
  );
}

function CompleteStep() {
  return (
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-8">
        <h3 className="text-2xl font-bold text-green-800 mb-4">
          Welcome to Your Menopause Journey! 🌟
        </h3>
        <p className="text-green-700 mb-6">
          You're all set to start tracking, learning, and taking control of your health.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-semibold text-gray-800">Start Tracking</h4>
            <p className="text-gray-600">Log your first symptoms today</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🔍</div>
            <h4 className="font-semibold text-gray-800">Discover Patterns</h4>
            <p className="text-gray-600">AI insights after 7 days of data</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">💪</div>
            <h4 className="font-semibold text-gray-800">Take Control</h4>
            <p className="text-gray-600">Make informed health decisions</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Remember:</strong> This platform was created through Human-Claude collaboration 
          to ensure both cutting-edge technology and genuine care for your menopause journey.
        </p>
      </div>
    </div>
  );
}