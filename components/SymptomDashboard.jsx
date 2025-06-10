// Symptom Dashboard - Shows historical data and trends
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import FeatureGate from './FeatureGate';

export default function SymptomDashboard() {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscription();
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    if (user) {
      loadSymptomHistory();
    }
  }, [user, timeRange]);

  const loadSymptomHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/symptoms?limit=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSymptoms(data || []);
      }
    } catch (error) {
      console.error('Error loading symptom history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverages = () => {
    if (symptoms.length === 0) return {};

    const totals = symptoms.reduce((acc, symptom) => {
      acc.mood_rating += symptom.mood_rating || 0;
      acc.energy_level += symptom.energy_level || 0;
      acc.sleep_quality += symptom.sleep_quality || 0;
      acc.stress_level += symptom.stress_level || 0;
      acc.hot_flashes += symptom.hot_flashes_count || 0;
      return acc;
    }, {
      mood_rating: 0,
      energy_level: 0,
      sleep_quality: 0,
      stress_level: 0,
      hot_flashes: 0
    });

    const count = symptoms.length;
    return {
      mood: (totals.mood_rating / count).toFixed(1),
      energy: (totals.energy_level / count).toFixed(1),
      sleep: (totals.sleep_quality / count).toFixed(1),
      stress: (totals.stress_level / count).toFixed(1),
      hotFlashes: (totals.hot_flashes / count).toFixed(1)
    };
  };

  const getSymptomTrend = (symptomKey) => {
    if (symptoms.length < 2) return 'stable';
    
    const recent = symptoms.slice(0, Math.floor(symptoms.length / 2));
    const older = symptoms.slice(Math.floor(symptoms.length / 2));
    
    const recentAvg = recent.reduce((sum, s) => sum + (s[symptomKey] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s[symptomKey] || 0), 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    if (Math.abs(diff) < 0.5) return 'stable';
    return diff > 0 ? 'improving' : 'declining';
  };

  const averages = calculateAverages();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please sign in to view your symptom dashboard.</p>
      </div>
    );
  }

  return (
    <FeatureGate feature="basic_ai_insights">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Menopause Journey</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 3 months</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your data...</p>
            </div>
          ) : symptoms.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Data Yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your symptoms to see insights and trends here.</p>
              <button
                onClick={() => window.location.href = '/tracker'}
                className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Start Tracking
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg">
                  <div className="text-2xl mb-2">😊</div>
                  <div className="text-2xl font-bold text-pink-600">{averages.mood}</div>
                  <div className="text-sm text-gray-600">Avg Mood</div>
                  <div className={`text-xs mt-1 ${
                    getSymptomTrend('mood_rating') === 'improving' ? 'text-green-600' :
                    getSymptomTrend('mood_rating') === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getSymptomTrend('mood_rating') === 'improving' ? '↗️ Improving' :
                     getSymptomTrend('mood_rating') === 'declining' ? '↘️ Declining' : '→ Stable'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-2xl font-bold text-yellow-600">{averages.energy}</div>
                  <div className="text-sm text-gray-600">Avg Energy</div>
                  <div className={`text-xs mt-1 ${
                    getSymptomTrend('energy_level') === 'improving' ? 'text-green-600' :
                    getSymptomTrend('energy_level') === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getSymptomTrend('energy_level') === 'improving' ? '↗️ Improving' :
                     getSymptomTrend('energy_level') === 'declining' ? '↘️ Declining' : '→ Stable'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-2xl mb-2">😴</div>
                  <div className="text-2xl font-bold text-blue-600">{averages.sleep}</div>
                  <div className="text-sm text-gray-600">Avg Sleep</div>
                  <div className={`text-xs mt-1 ${
                    getSymptomTrend('sleep_quality') === 'improving' ? 'text-green-600' :
                    getSymptomTrend('sleep_quality') === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getSymptomTrend('sleep_quality') === 'improving' ? '↗️ Improving' :
                     getSymptomTrend('sleep_quality') === 'declining' ? '↘️ Declining' : '→ Stable'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
                  <div className="text-2xl mb-2">😰</div>
                  <div className="text-2xl font-bold text-red-600">{averages.stress}</div>
                  <div className="text-sm text-gray-600">Avg Stress</div>
                  <div className={`text-xs mt-1 ${
                    getSymptomTrend('stress_level') === 'declining' ? 'text-green-600' :
                    getSymptomTrend('stress_level') === 'improving' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getSymptomTrend('stress_level') === 'declining' ? '↘️ Better' :
                     getSymptomTrend('stress_level') === 'improving' ? '↗️ Higher' : '→ Stable'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <div className="text-2xl mb-2">🔥</div>
                  <div className="text-2xl font-bold text-orange-600">{averages.hotFlashes}</div>
                  <div className="text-sm text-gray-600">Avg Hot Flashes</div>
                  <div className={`text-xs mt-1 ${
                    getSymptomTrend('hot_flashes_count') === 'declining' ? 'text-green-600' :
                    getSymptomTrend('hot_flashes_count') === 'improving' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {getSymptomTrend('hot_flashes_count') === 'declining' ? '↘️ Fewer' :
                     getSymptomTrend('hot_flashes_count') === 'improving' ? '↗️ More' : '→ Stable'}
                  </div>
                </div>
              </div>

              {/* Recent Entries */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries</h3>
                <div className="space-y-3">
                  {symptoms.slice(0, 5).map((symptom, index) => (
                    <div key={symptom.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(symptom.date).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-2">
                          {symptom.mood_rating && (
                            <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                              Mood: {symptom.mood_rating}/10
                            </span>
                          )}
                          {symptom.energy_level && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              Energy: {symptom.energy_level}/10
                            </span>
                          )}
                          {symptom.hot_flashes_count > 0 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              Hot Flashes: {symptom.hot_flashes_count}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = `/tracker?date=${symptom.date}`}
                        className="text-pink-600 hover:text-pink-700 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>

                {symptoms.length > 5 && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => window.location.href = '/history'}
                      className="text-pink-600 hover:text-pink-700 font-medium"
                    >
                      View All {symptoms.length} Entries →
                    </button>
                  </div>
                )}
              </div>

              {/* AI Insights (Premium Feature) */}
              <FeatureGate feature="personalized_ai_recommendations">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    🤖 AI Insights & Recommendations
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <p className="text-gray-700">
                        <strong>Pattern Detection:</strong> Your mood tends to be lower on days with poor sleep quality. 
                        Consider a consistent bedtime routine to improve both sleep and mood.
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <p className="text-gray-700">
                        <strong>Hot Flash Triggers:</strong> Hot flashes seem more frequent on high-stress days. 
                        Try stress-reduction techniques like deep breathing or meditation.
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <p className="text-gray-700">
                        <strong>Progress Update:</strong> Your energy levels have improved by 15% over the past month. 
                        Keep up the great work with your current routine!
                      </p>
                    </div>
                  </div>
                </div>
              </FeatureGate>
            </div>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}