import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import { EcosystemProvider } from './hooks/useEcosystem'

function App() {
  return (
    <EcosystemProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">FertilityTracker</h1>
            <p className="text-gray-600">Conception Monitoring & Fertility Optimization</p>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </EcosystemProvider>
  )
}

export default App