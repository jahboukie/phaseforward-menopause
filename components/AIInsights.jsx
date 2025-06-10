// AI-Powered Menopause Insights - Human-Claude Collaboration
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import FeatureGate from './FeatureGate';

export default function AIInsights() {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscription();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');

  useEffect(() => {
    if (user && canAccessFeature('personalized_ai_recommendations')) {
      generateInsights();
    }
  }, [user, selectedTimeframe]);

  const generateInsights = async () => {
    setLoading(true);
    
    // Simulate AI analysis - in production, this would call your AI service
    setTimeout(() => {
      const mockInsights = generateMockInsights();
      setInsights(mockInsights);
      setLoading(false);
    }, 2000);
  };

  const generateMockInsights = () => {
    // These insights demonstrate the type of AI analysis possible
    // In production, this would integrate with actual AI services
    return {
      summary: {
        totalDays: parseInt(selectedTimeframe),
        symptomsTracked: Math.floor(Math.random() * 20) + 10,
        patterns: Math.floor(Math.random() * 5) + 3,
        improvements: Math.floor(Math.random() * 3) + 1
      },
      patterns: [
        {
          id: 'sleep-mood',
          title: 'Sleep Quality & Mood Connection',
          insight: 'Your mood ratings are 40% higher on days when you sleep 7+ hours',
          confidence: 92,
          type: 'correlation',
          actionable: true,
          recommendation: 'Consider establishing a consistent bedtime routine to improve sleep quality'
        },
        {
          id: 'stress-hotflashes',
          title: 'Stress Triggers Hot Flashes',
          insight: 'Hot flash frequency increases by 60% on high-stress days (stress level 7+)',
          confidence: 87,
          type: 'trigger',
          actionable: true,
          recommendation: 'Try stress reduction techniques like deep breathing or meditation during stressful periods'
        },
        {
          id: 'exercise-energy',
          title: 'Exercise Boosts Energy',
          insight: 'Energy levels are 25% higher on days with 30+ minutes of exercise',
          confidence: 94,
          type: 'positive',
          actionable: true,
          recommendation: 'Aim for at least 30 minutes of moderate exercise daily, even light walking helps'
        }
      ],
      trends: [
        {
          metric: 'Hot Flashes',
          change: -15,
          direction: 'improving',
          timeframe: '2 weeks',
          description: 'Frequency has decreased since you started tracking'
        },
        {
          metric: 'Sleep Quality',
          change: 12,
          direction: 'improving', 
          timeframe: '1 week',
          description: 'Your sleep scores have been consistently higher'
        },
        {
          metric: 'Mood Stability',
          change: 8,
          direction: 'improving',
          timeframe: '3 weeks',
          description: 'Less daily mood variation observed'
        }
      ],
      predictions: [
        {
          type: 'symptoms',
          title: 'Next Week Forecast',
          prediction: 'Based on your patterns, you may experience milder symptoms mid-week',
          confidence: 73,
          suggestions: ['Continue current sleep routine', 'Plan stress management for Monday/Friday']
        },
        {
          type: 'optimal_timing',
          title: 'Best Time for Exercise',
          prediction: 'Morning workouts (7-9 AM) correlate with better mood throughout the day',
          confidence: 81,
          suggestions: ['Schedule workouts between 7-9 AM', 'Even 15 minutes can make a difference']
        }
      ]
    };
  };

  if (loading) {
    return <LoadingInsights />;
  }

  return (
    <FeatureGate feature="personalized_ai_recommendations">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🤖 AI-Powered Insights</h1>
              <p className="text-gray-600 mt-2">
                Personalized analysis of your menopause journey powered by Human-Claude collaboration
              </p>
            </div>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
            </select>
          </div>
          
          {insights && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{insights.summary.totalDays}</div>
                <div className="text-sm text-gray-600">Days Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">{insights.summary.symptomsTracked}</div>
                <div className="text-sm text-gray-600">Symptoms Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{insights.summary.patterns}</div>
                <div className="text-sm text-gray-600">Patterns Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{insights.summary.improvements}</div>
                <div className="text-sm text-gray-600">Improvements</div>
              </div>
            </div>
          )}
        </div>

        {/* Key Patterns */}
        {insights && (
          <>
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Discovered Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {insights.patterns.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} />
                ))}
              </div>
            </section>

            {/* Trends */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Progress Trends</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.trends.map((trend, index) => (
                  <TrendCard key={index} trend={trend} />
                ))}
              </div>
            </section>

            {/* Predictions & Recommendations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔮 AI Predictions & Recommendations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.predictions.map((prediction, index) => (
                  <PredictionCard key={index} prediction={prediction} />
                ))}
              </div>
            </section>

            {/* Human-Claude Collaboration Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                🤝 Human-Claude Collaboration
              </h3>
              <p className="text-blue-700 mb-4">
                These insights are generated through an innovative partnership between human healthcare 
                expertise and Claude AI's analytical capabilities. This collaboration ensures both 
                scientific accuracy and genuine understanding of women's health needs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500">👩‍⚕️</span>
                  <div>
                    <strong className="text-blue-800">Human Expertise:</strong>
                    <p className="text-blue-600">Healthcare knowledge, empathy, and real-world understanding</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500">🤖</span>
                  <div>
                    <strong className="text-blue-800">AI Capabilities:</strong>
                    <p className="text-blue-600">Pattern recognition, data analysis, and personalization</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </FeatureGate>
  );
}

function LoadingInsights() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🤖 AI Analyzing Your Data...</h2>
        <div className="space-y-2 text-gray-600">
          <p>🔍 Discovering patterns in your symptoms</p>
          <p>📊 Calculating correlations and trends</p>
          <p>💡 Generating personalized recommendations</p>
          <p>🎯 Preparing actionable insights</p>
        </div>
        <div className="mt-6 text-sm text-gray-500">
          This usually takes 10-30 seconds...
        </div>
      </div>
    </div>
  );
}

function PatternCard({ pattern }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'correlation': return 'blue';
      case 'trigger': return 'red';
      case 'positive': return 'green';
      default: return 'gray';
    }
  };

  const color = getTypeColor(pattern.type);

  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-lg font-semibold text-${color}-800`}>{pattern.title}</h3>
        <div className={`bg-${color}-100 px-2 py-1 rounded text-xs font-medium text-${color}-700`}>
          {pattern.confidence}% confidence
        </div>
      </div>
      
      <p className={`text-${color}-700 mb-4`}>{pattern.insight}</p>
      
      {pattern.actionable && (
        <div className={`bg-${color}-100 rounded-lg p-3`}>
          <h4 className={`font-medium text-${color}-800 mb-1 text-sm`}>💡 Recommendation:</h4>
          <p className={`text-${color}-700 text-sm`}>{pattern.recommendation}</p>
        </div>
      )}
    </div>
  );
}

function TrendCard({ trend }) {
  const isImproving = trend.direction === 'improving';
  
  return (
    <div className={`bg-${isImproving ? 'green' : 'yellow'}-50 border border-${isImproving ? 'green' : 'yellow'}-200 rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{trend.metric}</h3>
        <div className={`flex items-center text-${isImproving ? 'green' : 'yellow'}-600`}>
          <span className="text-xl mr-1">
            {isImproving ? '↗️' : '↔️'}
          </span>
          <span className="font-bold">{Math.abs(trend.change)}%</span>
        </div>
      </div>
      
      <p className={`text-${isImproving ? 'green' : 'yellow'}-700 text-sm mb-2`}>
        {trend.description}
      </p>
      
      <div className="text-xs text-gray-500">
        Over the past {trend.timeframe}
      </div>
    </div>
  );
}

function PredictionCard({ prediction }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-800">{prediction.title}</h3>
        <div className="bg-purple-100 px-2 py-1 rounded text-xs font-medium text-purple-700">
          {prediction.confidence}% likely
        </div>
      </div>
      
      <p className="text-purple-700 mb-4">{prediction.prediction}</p>
      
      <div className="bg-purple-100 rounded-lg p-3">
        <h4 className="font-medium text-purple-800 mb-2 text-sm">🎯 Suggested Actions:</h4>
        <ul className="space-y-1">
          {prediction.suggestions.map((suggestion, index) => (
            <li key={index} className="text-purple-700 text-sm flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}