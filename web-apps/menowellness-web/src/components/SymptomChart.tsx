import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const symptomData = [
  { date: '2024-01-01', hotFlashes: 3, moodSwings: 2, sleepIssues: 4, fatigue: 3, jointPain: 1 },
  { date: '2024-01-02', hotFlashes: 5, moodSwings: 4, sleepIssues: 5, fatigue: 4, jointPain: 2 },
  { date: '2024-01-03', hotFlashes: 2, moodSwings: 1, sleepIssues: 2, fatigue: 2, jointPain: 1 },
  { date: '2024-01-04', hotFlashes: 4, moodSwings: 3, sleepIssues: 3, fatigue: 3, jointPain: 2 },
  { date: '2024-01-05', hotFlashes: 6, moodSwings: 5, sleepIssues: 6, fatigue: 5, jointPain: 3 },
  { date: '2024-01-06', hotFlashes: 2, moodSwings: 2, sleepIssues: 2, fatigue: 2, jointPain: 1 },
  { date: '2024-01-07', hotFlashes: 1, moodSwings: 1, sleepIssues: 1, fatigue: 1, jointPain: 0 },
  { date: '2024-01-08', hotFlashes: 3, moodSwings: 2, sleepIssues: 3, fatigue: 2, jointPain: 1 },
  { date: '2024-01-09', hotFlashes: 2, moodSwings: 1, sleepIssues: 2, fatigue: 2, jointPain: 1 },
  { date: '2024-01-10', hotFlashes: 4, moodSwings: 3, sleepIssues: 4, fatigue: 3, jointPain: 2 },
  { date: '2024-01-11', hotFlashes: 1, moodSwings: 1, sleepIssues: 1, fatigue: 1, jointPain: 0 },
  { date: '2024-01-12', hotFlashes: 3, moodSwings: 2, sleepIssues: 3, fatigue: 2, jointPain: 1 },
  { date: '2024-01-13', hotFlashes: 2, moodSwings: 2, sleepIssues: 2, fatigue: 2, jointPain: 1 },
  { date: '2024-01-14', hotFlashes: 1, moodSwings: 1, sleepIssues: 1, fatigue: 1, jointPain: 0 },
]

const symptoms = [
  { key: 'hotFlashes', name: 'Hot Flashes', color: '#ef4444' },
  { key: 'moodSwings', name: 'Mood Swings', color: '#f59e0b' },
  { key: 'sleepIssues', name: 'Sleep Issues', color: '#8b5cf6' },
  { key: 'fatigue', name: 'Fatigue', color: '#06b6d4' },
  { key: 'jointPain', name: 'Joint Pain', color: '#84cc16' },
]

type ViewType = 'trends' | 'frequency'

export default function SymptomChart() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(symptoms.map(s => s.key))
  const [viewType, setViewType] = useState<ViewType>('trends')

  const toggleSymptom = (symptomKey: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomKey) 
        ? prev.filter(s => s !== symptomKey)
        : [...prev, symptomKey]
    )
  }

  const getSymptomFrequency = () => {
    return symptoms.map(symptom => ({
      name: symptom.name,
      frequency: symptomData.reduce((sum, day) => sum + Number(day[symptom.key as keyof typeof day] || 0), 0),
      color: symptom.color
    }))
  }

  return (
    <div>
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <button
            onClick={() => setViewType('trends')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewType === 'trends' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setViewType('frequency')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewType === 'frequency' 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Frequency
          </button>
        </div>

        <div className="text-xs text-gray-500">
          🤖 Integrated with SentimentAsAService for pattern analysis
        </div>
      </div>

      {/* Symptom Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {symptoms.map((symptom) => (
          <button
            key={symptom.key}
            onClick={() => toggleSymptom(symptom.key)}
            className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedSymptoms.includes(symptom.key)
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={selectedSymptoms.includes(symptom.key) ? { backgroundColor: symptom.color } : {}}
          >
            <div 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: symptom.color }}
            />
            {symptom.name}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-80">
        {viewType === 'trends' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={symptomData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 6]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Severity (0-6)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              {symptoms
                .filter(symptom => selectedSymptoms.includes(symptom.key))
                .map((symptom) => (
                  <Line
                    key={symptom.key}
                    type="monotone"
                    dataKey={symptom.key}
                    stroke={symptom.color}
                    strokeWidth={2}
                    dot={{ fill: symptom.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: symptom.color, strokeWidth: 2 }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getSymptomFrequency()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Total Episodes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar 
                dataKey="frequency" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">🧠 AI Pattern Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium">Trending Down ↘️</p>
            <p>Hot flashes reduced 40% since starting evening primrose oil</p>
          </div>
          <div>
            <p className="font-medium">Pattern Detected 🔍</p>
            <p>Sleep issues correlate with relationship stress (0.73 correlation)</p>
          </div>
        </div>
      </div>

      {/* Treatment Effectiveness */}
      <div className="mt-4 p-4 bg-gradient-to-r from-wellness-50 to-green-50 rounded-lg">
        <h4 className="text-sm font-semibold text-wellness-900 mb-2">💊 Treatment Effectiveness</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-wellness-800">
          <div>
            <p className="font-medium">Hormone Therapy</p>
            <p>78% effective for hot flashes</p>
          </div>
          <div>
            <p className="font-medium">Mindfulness (Inner Architect)</p>
            <p>65% effective for mood stabilization</p>
          </div>
          <div>
            <p className="font-medium">Relationship Support</p>
            <p>82% effective for overall wellness</p>
          </div>
        </div>
      </div>
    </div>
  )
}