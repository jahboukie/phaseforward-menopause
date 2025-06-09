import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import SymptomTracker from './pages/SymptomTracker'
import TreatmentPlanner from './pages/TreatmentPlanner'
import Community from './pages/Community'
import HealthInsights from './pages/HealthInsights'
import Profile from './pages/Profile'
import { AuthProvider } from './contexts/AuthContext'
import { EcosystemProvider } from './hooks/useEcosystem'

function App() {
  return (
    <AuthProvider>
      <EcosystemProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected app routes with layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/symptoms" element={
            <ProtectedRoute>
              <Layout>
                <SymptomTracker />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/treatments" element={
            <ProtectedRoute>
              <Layout>
                <TreatmentPlanner />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/community" element={
            <ProtectedRoute>
              <Layout>
                <Community />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <Layout>
                <HealthInsights />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </EcosystemProvider>
    </AuthProvider>
  )
}

export default App