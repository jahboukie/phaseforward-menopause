// MenoWellness Symptom Tracker Component
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import FeatureGate from './FeatureGate';

const SYMPTOM_CATEGORIES = {
  physical: {
    name: 'Physical Symptoms',
    icon: '🌡️',
    symptoms: {
      hot_flashes_count: { label: 'Hot Flashes Count', type: 'number', min: 0, max: 50 },
      hot_flashes_severity: { label: 'Hot Flash Severity', type: 'scale', min: 1, max: 10 },
      night_sweats: { label: 'Night Sweats', type: 'boolean' },
      irregular_periods: { label: 'Irregular Periods', type: 'boolean' },
      vaginal_dryness: { label: 'Vaginal Dryness', type: 'boolean' },
      weight_changes: { label: 'Weight Changes', type: 'boolean' },
      joint_pain: { label: 'Joint Pain', type: 'boolean' },
      headaches: { label: 'Headaches', type: 'boolean' },
      breast_tenderness: { label: 'Breast Tenderness', type: 'boolean' }
    }
  },
  emotional: {
    name: 'Emotional & Mental',
    icon: '🧠',
    symptoms: {
      mood_rating: { label: 'Overall Mood', type: 'scale', min: 1, max: 10 },
      anxiety_level: { label: 'Anxiety Level', type: 'scale', min: 1, max: 10 },
      depression_symptoms: { label: 'Depression Symptoms', type: 'boolean' },
      irritability: { label: 'Irritability', type: 'boolean' },
      brain_fog: { label: 'Brain Fog', type: 'boolean' },
      memory_issues: { label: 'Memory Issues', type: 'boolean' }
    }
  },
  sleep: {
    name: 'Sleep & Energy',
    icon: '😴',
    symptoms: {
      sleep_quality: { label: 'Sleep Quality', type: 'scale', min: 1, max: 10 },
      sleep_hours: { label: 'Hours of Sleep', type: 'number', min: 0, max: 24, step: 0.5 },
      energy_level: { label: 'Energy Level', type: 'scale', min: 1, max: 10 },
      fatigue_level: { label: 'Fatigue Level', type: 'scale', min: 1, max: 10 }
    }
  },
  lifestyle: {
    name: 'Lifestyle',
    icon: '🏃‍♀️',
    symptoms: {
      exercise_minutes: { label: 'Exercise (minutes)', type: 'number', min: 0, max: 300 },
      stress_level: { label: 'Stress Level', type: 'scale', min: 1, max: 10 }
    }
  }
};

export default function SymptomTracker() {
  const { user } = useAuth();
  const { subscription, canAccessFeature, hasUsageRemaining, trackUsage } = useSubscription();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState({});
  const [medications, setMedications] = useState([]);
  const [supplements, setSupplements] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    if (user && selectedDate) {
      loadSymptomData();
    }
  }, [user, selectedDate]);

  const loadSymptomData = async () => {
    try {
      const response = await fetch(`/api/symptoms/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSymptoms(data);
          setMedications(data.medication_taken || []);
          setSupplements(data.supplements_taken || []);
          setNotes(data.notes || '');
        } else {
          // Reset form for new date
          setSymptoms({});
          setMedications([]);
          setSupplements([]);
          setNotes('');
        }
      }
    } catch (error) {
      console.error('Error loading symptom data:', error);
    }
  };

  const handleSymptomChange = (symptomKey, value) => {
    setSymptoms(prev => ({
      ...prev,
      [symptomKey]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    // Check feature access
    if (!canAccessFeature('daily_symptom_tracking')) {
      alert('Please upgrade your subscription to track symptoms daily.');
      return;
    }

    // Check usage limits
    if (!hasUsageRemaining('symptom_entries')) {
      alert('You have reached your monthly symptom tracking limit. Please upgrade to continue.');
      return;
    }

    setLoading(true);
    setSaveStatus(null);

    try {
      const symptomData = {
        date: selectedDate,
        ...symptoms,
        medication_taken: medications,
        supplements_taken: supplements,
        notes: notes
      };

      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(symptomData)
      });

      if (response.ok) {
        setSaveStatus('saved');
        await trackUsage('symptom_entries');
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        const error = await response.json();
        setSaveStatus('error');
        console.error('Save error:', error);
      }
    } catch (error) {
      console.error('Error saving symptoms:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const renderScaleInput = (symptomKey, config) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {config.label}
      </label>
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-500">{config.min}</span>
        <input
          type="range"
          min={config.min}
          max={config.max}
          value={symptoms[symptomKey] || config.min}
          onChange={(e) => handleSymptomChange(symptomKey, parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xs text-gray-500">{config.max}</span>
        <span className="text-sm font-semibold text-pink-600 w-8">
          {symptoms[symptomKey] || config.min}
        </span>
      </div>
    </div>
  );

  const renderBooleanInput = (symptomKey, config) => (
    <label className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <input
        type="checkbox"
        checked={symptoms[symptomKey] || false}
        onChange={(e) => handleSymptomChange(symptomKey, e.target.checked)}
        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
      />
      <span className="text-sm font-medium text-gray-700">{config.label}</span>
    </label>
  );

  const renderNumberInput = (symptomKey, config) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {config.label}
      </label>
      <input
        type="number"
        min={config.min}
        max={config.max}
        step={config.step || 1}
        value={symptoms[symptomKey] || ''}
        onChange={(e) => handleSymptomChange(symptomKey, parseFloat(e.target.value) || 0)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        placeholder={`0-${config.max}`}
      />
    </div>
  );

  const addMedication = () => {
    const med = prompt('Enter medication name:');
    if (med && med.trim()) {
      setMedications(prev => [...prev, med.trim()]);
    }
  };

  const addSupplement = () => {
    const supp = prompt('Enter supplement name:');
    if (supp && supp.trim()) {
      setSupplements(prev => [...prev, supp.trim()]);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to track your symptoms.</p>
      </div>
    );
  }

  return (
    <FeatureGate feature="daily_symptom_tracking">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Daily Symptom Tracker</h2>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                {saveStatus && (
                  <div className={`px-3 py-1 rounded text-sm ${
                    saveStatus === 'saved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {saveStatus === 'saved' ? '✅ Saved' : '❌ Error'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {Object.entries(SYMPTOM_CATEGORIES).map(([categoryKey, category]) => (
              <div key={categoryKey} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(category.symptoms).map(([symptomKey, config]) => (
                    <div key={symptomKey} className="p-4 bg-gray-50 rounded-lg">
                      {config.type === 'scale' && renderScaleInput(symptomKey, config)}
                      {config.type === 'boolean' && renderBooleanInput(symptomKey, config)}
                      {config.type === 'number' && renderNumberInput(symptomKey, config)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Medications and Supplements */}
            <FeatureGate feature="advanced_tracking">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">💊 Medications</h3>
                    <button
                      onClick={addMedication}
                      className="text-sm text-pink-600 hover:text-pink-700"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {medications.map((med, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{med}</span>
                        <button
                          onClick={() => setMedications(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">🌿 Supplements</h3>
                    <button
                      onClick={addSupplement}
                      className="text-sm text-pink-600 hover:text-pink-700"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {supplements.map((supp, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{supp}</span>
                        <button
                          onClick={() => setSupplements(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FeatureGate>

            {/* Notes */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">📝 Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about your day..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 text-right">
                {notes.length}/1000 characters
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                {loading ? '💾 Saving...' : '💾 Save Symptoms'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}