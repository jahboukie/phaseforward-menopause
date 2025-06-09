import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SymptomTracker from './pages/SymptomTracker'
import TreatmentPlanner from './pages/TreatmentPlanner'
import Community from './pages/Community'
import HealthInsights from './pages/HealthInsights'
import Profile from './pages/Profile'
import { EcosystemProvider } from './hooks/useEcosystem'

function App() {
  return (
    <EcosystemProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/symptoms" element={<SymptomTracker />} />
          <Route path="/treatments" element={<TreatmentPlanner />} />
          <Route path="/community" element={<Community />} />
          <Route path="/insights" element={<HealthInsights />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </EcosystemProvider>
  )
}

export default App