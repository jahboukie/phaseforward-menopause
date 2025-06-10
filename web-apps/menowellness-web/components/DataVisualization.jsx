// Data Visualization Charts for Symptom Trends
import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function DataVisualization({ data, timeframe = '30' }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('trends');

  useEffect(() => {
    if (data) {
      generateChartData(data);
    }
  }, [data, timeframe]);

  const generateChartData = async (rawData) => {
    setLoading(true);
    
    // Simulate data processing delay
    setTimeout(() => {
      const processedData = {
        trends: generateTrendData(rawData),
        heatmap: generateHeatmapData(rawData),
        correlation: generateCorrelationData(rawData),
        patterns: generatePatternData(rawData)
      };
      
      setChartData(processedData);
      setLoading(false);
    }, 1000);
  };

  const generateTrendData = (data) => {
    // Generate mock trend data for demonstration
    const symptoms = ['Hot Flashes', 'Sleep Quality', 'Mood', 'Energy', 'Anxiety'];
    const days = parseInt(timeframe);
    
    return symptoms.map(symptom => ({
      name: symptom,
      data: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        value: Math.random() * 10,
        severity: Math.floor(Math.random() * 5) + 1
      }))
    }));
  };

  const generateHeatmapData = (data) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return days.map(day => ({
      day,
      hours: hours.map(hour => ({
        hour,
        intensity: Math.random() * 10
      }))
    }));
  };

  const generateCorrelationData = (data) => {
    return [
      { x: 'Sleep Quality', y: 'Mood', correlation: 0.78, strength: 'Strong' },
      { x: 'Stress Level', y: 'Hot Flashes', correlation: 0.65, strength: 'Moderate' },
      { x: 'Exercise', y: 'Energy', correlation: 0.82, strength: 'Strong' },
      { x: 'Diet Quality', y: 'Mood', correlation: 0.71, strength: 'Strong' },
      { x: 'Hydration', y: 'Headaches', correlation: -0.58, strength: 'Moderate' }
    ];
  };

  const generatePatternData = (data) => {
    return {
      weekly: {
        worst_days: ['Monday', 'Friday'],
        best_days: ['Wednesday', 'Saturday'],
        pattern: 'Weekday stress affects symptoms'
      },
      monthly: {
        phase_correlation: 0.67,
        pattern: 'Symptoms peak mid-cycle and pre-menstrually'
      },
      seasonal: {
        worst_season: 'Winter',
        best_season: 'Spring',
        pattern: 'Light exposure affects mood and energy'
      }
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <LoadingSpinner size="large" message="Analyzing your symptom patterns..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">📊 Your Health Data Insights</h2>
          <p className="text-gray-600 mt-1">Visualizing {timeframe} days of symptom tracking</p>
        </div>
        
        <div className="p-6">
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'trends', name: 'Symptom Trends', icon: '📈' },
              { id: 'heatmap', name: 'Time Patterns', icon: '🗓️' },
              { id: 'correlation', name: 'Correlations', icon: '🔗' },
              { id: 'patterns', name: 'Insights', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeChart === tab.id
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>

          {/* Chart Content */}
          {activeChart === 'trends' && <TrendChart data={chartData.trends} />}
          {activeChart === 'heatmap' && <HeatmapChart data={chartData.heatmap} />}
          {activeChart === 'correlation' && <CorrelationChart data={chartData.correlation} />}
          {activeChart === 'patterns' && <PatternInsights data={chartData.patterns} />}
        </div>
      </div>
    </div>
  );
}

function TrendChart({ data }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Symptom Trends Over Time</h3>
        <p className="text-sm text-gray-600">Track how your symptoms change day by day</p>
      </div>
      
      {data.map((symptom, index) => (
        <div key={symptom.name} className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">{symptom.name}</h4>
          
          {/* Simple line chart representation */}
          <div className="relative h-24 bg-white rounded border">
            <svg className="w-full h-full" viewBox="0 0 400 80">
              {/* Grid lines */}
              {[20, 40, 60].map(y => (
                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f3f4f6" strokeWidth="1" />
              ))}
              
              {/* Data line */}
              <polyline
                fill="none"
                stroke={`hsl(${320 + index * 30}, 70%, 50%)`}
                strokeWidth="2"
                points={symptom.data.map((point, i) => 
                  `${(i / (symptom.data.length - 1)) * 380 + 10},${70 - (point.value / 10) * 60}`
                ).join(' ')}
              />
              
              {/* Data points */}
              {symptom.data.map((point, i) => (
                <circle
                  key={i}
                  cx={(i / (symptom.data.length - 1)) * 380 + 10}
                  cy={70 - (point.value / 10) * 60}
                  r="3"
                  fill={`hsl(${320 + index * 30}, 70%, 50%)`}
                />
              ))}
            </svg>
            
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Start</span>
            <span>End</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeatmapChart({ data }) {
  const getIntensityColor = (intensity) => {
    const opacity = intensity / 10;
    return `rgba(236, 72, 153, ${opacity})`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Symptom Timing Patterns</h3>
        <p className="text-sm text-gray-600">When do your symptoms typically occur?</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-25 gap-1">
          {/* Hour headers */}
          <div></div>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="text-xs text-center text-gray-500 font-medium">
              {i}
            </div>
          ))}
          
          {/* Heatmap rows */}
          {data.map((dayData) => (
            <React.Fragment key={dayData.day}>
              <div className="text-xs text-gray-700 font-medium flex items-center">
                {dayData.day}
              </div>
              {dayData.hours.map((hourData) => (
                <div
                  key={hourData.hour}
                  className="w-4 h-4 rounded-sm border border-gray-200"
                  style={{ backgroundColor: getIntensityColor(hourData.intensity) }}
                  title={`${dayData.day} ${hourData.hour}:00 - Intensity: ${hourData.intensity.toFixed(1)}`}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-2 text-xs text-gray-600">
          <span>Low</span>
          <div className="flex space-x-1">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
              <div
                key={opacity}
                className="w-3 h-3 rounded-sm border border-gray-200"
                style={{ backgroundColor: `rgba(236, 72, 153, ${opacity})` }}
              />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

function CorrelationChart({ data }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Symptom Correlations</h3>
        <p className="text-sm text-gray-600">How your symptoms relate to each other</p>
      </div>
      
      <div className="space-y-3">
        {data.map((correlation, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-gray-800">
                {correlation.x} ↔ {correlation.y}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                correlation.strength === 'Strong' ? 'bg-green-100 text-green-800' :
                correlation.strength === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {correlation.strength}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    correlation.correlation > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.abs(correlation.correlation) * 100}%` }}
                />
              </div>
              <div className="text-sm font-medium text-gray-700">
                {correlation.correlation > 0 ? '+' : ''}{(correlation.correlation * 100).toFixed(0)}%
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-2">
              {correlation.correlation > 0 
                ? `${correlation.x} and ${correlation.y} tend to increase together`
                : `${correlation.x} increases as ${correlation.y} decreases`
              }
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatternInsights({ data }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Pattern Insights</h3>
        <p className="text-sm text-gray-600">AI-discovered patterns in your health data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weekly Patterns */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
            📅 Weekly Patterns
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Best days:</span>
              <p className="text-blue-600">{data.weekly.best_days.join(', ')}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Challenging days:</span>
              <p className="text-blue-600">{data.weekly.worst_days.join(', ')}</p>
            </div>
            <div className="bg-blue-100 rounded p-2 mt-3">
              <p className="text-blue-800 text-xs">{data.weekly.pattern}</p>
            </div>
          </div>
        </div>
        
        {/* Monthly Patterns */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
            🌙 Monthly Patterns
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-purple-700 font-medium">Cycle correlation:</span>
              <p className="text-purple-600">{(data.monthly.phase_correlation * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-purple-100 rounded p-2 mt-3">
              <p className="text-purple-800 text-xs">{data.monthly.pattern}</p>
            </div>
          </div>
        </div>
        
        {/* Seasonal Patterns */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
            🌱 Seasonal Patterns
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-green-700 font-medium">Best season:</span>
              <p className="text-green-600">{data.seasonal.best_season}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Challenging season:</span>
              <p className="text-green-600">{data.seasonal.worst_season}</p>
            </div>
            <div className="bg-green-100 rounded p-2 mt-3">
              <p className="text-green-800 text-xs">{data.seasonal.pattern}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}