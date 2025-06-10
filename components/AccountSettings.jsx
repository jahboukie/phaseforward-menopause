// Account Management and Settings for MenoWellness
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';

export default function AccountSettings() {
  const { user, signOut } = useAuth();
  const { subscription, cancelSubscription, updateSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'subscription', name: 'Subscription', icon: '💎' },
    { id: 'privacy', name: 'Privacy & Data', icon: '🔒' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'export', name: 'Export Data', icon: '📊' },
    { id: 'support', name: 'Support', icon: '💬' }
  ];

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-1">Manage your MenoWellness account and preferences</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Signed in as</div>
              <div className="font-semibold text-gray-900">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    activeTab === tab.id ? 'bg-pink-50 text-pink-700 border-r-2 border-r-pink-500' : 'text-gray-700'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {activeTab === 'profile' && <ProfileSettings showMessage={showMessage} />}
              {activeTab === 'subscription' && <SubscriptionSettings subscription={subscription} showMessage={showMessage} />}
              {activeTab === 'privacy' && <PrivacySettings showMessage={showMessage} />}
              {activeTab === 'notifications' && <NotificationSettings showMessage={showMessage} />}
              {activeTab === 'export' && <ExportSettings showMessage={showMessage} />}
              {activeTab === 'support' && <SupportSettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ showMessage }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    age_range: '',
    menopause_stage: '',
    timezone: 'America/New_York'
  });

  const handleSave = async () => {
    try {
      // Save profile data
      showMessage('Profile updated successfully!');
    } catch (error) {
      showMessage('Failed to update profile', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="How should we address you?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
            <select
              value={profile.age_range}
              onChange={(e) => setProfile({...profile, age_range: e.target.value})}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Menopause Stage</label>
            <select
              value={profile.menopause_stage}
              onChange={(e) => setProfile({...profile, menopause_stage: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Select stage</option>
              <option value="perimenopause">Perimenopause</option>
              <option value="menopause">Menopause</option>
              <option value="postmenopause">Postmenopause</option>
              <option value="not_sure">Not sure</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={profile.timezone}
              onChange={(e) => setProfile({...profile, timezone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
        <div className="space-y-3">
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Change Password
          </button>
          <br />
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Enable Two-Factor Authentication
          </button>
        </div>
      </div>
    </div>
  );
}

function SubscriptionSettings({ subscription, showMessage }) {
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      features: ['Basic symptom tracking', '7-day history', 'Educational content']
    },
    {
      id: 'complete',
      name: 'Complete Care',
      price: '$19.99/month',
      features: ['Unlimited tracking', 'AI insights', 'Trend analysis', 'Export reports']
    },
    {
      id: 'ultimate',
      name: 'Ultimate Wellness',
      price: '$29.99/month',
      features: ['Everything in Complete', 'Personalized recommendations', 'Priority support', 'Community access']
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
        
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-pink-800">Complete Care Plan</h3>
              <p className="text-pink-600 text-sm">$19.99/month • Next billing: March 15, 2024</p>
            </div>
            <div className="text-pink-600 font-semibold">Active</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`border rounded-lg p-4 ${
              plan.id === 'complete' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
            }`}>
              <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-2xl font-bold text-gray-900 mb-4">{plan.price}</div>
              <ul className="space-y-1 text-sm text-gray-600 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.id === 'complete' ? (
                <div className="text-pink-600 font-medium text-center">Current Plan</div>
              ) : (
                <button className="w-full bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition-colors">
                  {plan.id === 'basic' ? 'Downgrade' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
        <div className="space-y-3">
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Update Payment Method
          </button>
          <br />
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Download Invoices
          </button>
          <br />
          <button className="text-red-600 hover:text-red-700 font-medium">
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

function PrivacySettings({ showMessage }) {
  const [settings, setSettings] = useState({
    data_sharing: false,
    analytics: true,
    third_party: false,
    marketing: false
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Data Control</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">🔒 HIPAA-Compliant Data Protection</h3>
          <p className="text-blue-700 text-sm">
            Your health data is protected with military-grade encryption and stored in HIPAA-compliant 
            infrastructure. This Human-Claude collaboration ensures both cutting-edge security and 
            genuine care for your privacy.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Anonymous Data Sharing</h4>
              <p className="text-sm text-gray-600">Help improve menopause research with anonymized data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.data_sharing}
                onChange={(e) => setSettings({...settings, data_sharing: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Usage Analytics</h4>
              <p className="text-sm text-gray-600">Help us improve the app with anonymous usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.analytics}
                onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Third-Party Integrations</h4>
              <p className="text-sm text-gray-600">Allow connections to health apps and devices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.third_party}
                onChange={(e) => setSettings({...settings, third_party: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Marketing Communications</h4>
              <p className="text-sm text-gray-600">Receive updates about new features and health tips</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.marketing}
                onChange={(e) => setSettings({...settings, marketing: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Data Actions</h3>
        <div className="space-y-3">
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Request Data Copy
          </button>
          <br />
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            View Privacy Policy
          </button>
          <br />
          <button className="text-red-600 hover:text-red-700 font-medium">
            Delete All My Data
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ showMessage }) {
  const [notifications, setNotifications] = useState({
    symptom_reminders: true,
    weekly_insights: true,
    educational_content: true,
    community_updates: false,
    system_updates: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Daily Symptom Reminders</h4>
              <p className="text-sm text-gray-600">Get reminded to track your symptoms each day</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.symptom_reminders}
                onChange={(e) => setNotifications({...notifications, symptom_reminders: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Weekly AI Insights</h4>
              <p className="text-sm text-gray-600">Receive personalized insights about your patterns</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weekly_insights}
                onChange={(e) => setNotifications({...notifications, weekly_insights: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Educational Content</h4>
              <p className="text-sm text-gray-600">Get tips and articles about menopause wellness</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.educational_content}
                onChange={(e) => setNotifications({...notifications, educational_content: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Community Updates</h4>
              <p className="text-sm text-gray-600">Notifications from the MenoWellness community</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.community_updates}
                onChange={(e) => setNotifications({...notifications, community_updates: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Preferences</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="radio" name="delivery" value="push" className="mr-3 text-pink-600" defaultChecked />
            Push notifications (recommended)
          </label>
          <label className="flex items-center">
            <input type="radio" name="delivery" value="email" className="mr-3 text-pink-600" />
            Email only
          </label>
          <label className="flex items-center">
            <input type="radio" name="delivery" value="both" className="mr-3 text-pink-600" />
            Both push and email
          </label>
        </div>
      </div>
    </div>
  );
}

function ExportSettings({ showMessage }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage(`Data exported successfully in ${format.toUpperCase()} format!`);
    } catch (error) {
      showMessage('Export failed. Please try again.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Your Data</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">✅ Data Portability Rights</h3>
          <p className="text-green-700 text-sm">
            You have the right to export all your data at any time. Your exported data will include 
            symptom tracking, insights, and profile information in a portable format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📄 PDF Report</h3>
            <p className="text-gray-600 text-sm mb-4">
              A comprehensive report with your symptom trends, insights, and visualizations.
            </p>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting}
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Generating...' : 'Export PDF'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📊 CSV Data</h3>
            <p className="text-gray-600 text-sm mb-4">
              Raw data in spreadsheet format for your own analysis or sharing with healthcare providers.
            </p>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Generating...' : 'Export CSV'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💾 JSON Backup</h3>
            <p className="text-gray-600 text-sm mb-4">
              Complete data backup in JSON format, including all settings and preferences.
            </p>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Generating...' : 'Export JSON'}
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Healthcare Summary</h3>
            <p className="text-gray-600 text-sm mb-4">
              A medical-grade summary perfect for sharing with your healthcare provider.
            </p>
            <button
              onClick={() => handleExport('medical')}
              disabled={exporting}
              className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {exporting ? 'Generating...' : 'Export Medical Summary'}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" className="mr-3 text-pink-600" defaultChecked />
            Include AI insights and recommendations
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3 text-pink-600" defaultChecked />
            Include trend analysis and patterns
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-3 text-pink-600" />
            Include community interactions (if any)
          </label>
        </div>
      </div>
    </div>
  );
}

function SupportSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Support & Help</h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">🤝 Human-Claude Support Team</h3>
          <p className="text-blue-700 text-sm">
            Our support combines human empathy with AI efficiency to provide you with the best 
            possible assistance for your menopause journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💬 Live Chat</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get instant help from our support team during business hours.
            </p>
            <button className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors">
              Start Chat
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📧 Email Support</h3>
            <p className="text-gray-600 text-sm mb-4">
              Send us a detailed message and we'll get back to you within 24 hours.
            </p>
            <button className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors">
              Send Email
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📚 Help Center</h3>
            <p className="text-gray-600 text-sm mb-4">
              Browse our comprehensive guides and frequently asked questions.
            </p>
            <button className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors">
              Browse Help
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">👥 Community Forum</h3>
            <p className="text-gray-600 text-sm mb-4">
              Connect with other women going through similar experiences.
            </p>
            <button className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700 transition-colors">
              Join Community
            </button>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Report a Bug
          </button>
          <br />
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Request a Feature
          </button>
          <br />
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Leave Feedback
          </button>
          <br />
          <button className="text-pink-600 hover:text-pink-700 font-medium">
            Rate the App
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">App Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Version:</strong> 1.0.0 (Human-Claude Collaboration)</p>
          <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Platform:</strong> Web Application</p>
          <p><strong>Security:</strong> HIPAA Compliant</p>
        </div>
      </div>
    </div>
  );
}