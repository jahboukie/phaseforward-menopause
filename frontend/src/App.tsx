import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import SymptomTracker from './pages/SymptomTracker'
import TreatmentPlanner from './pages/TreatmentPlanner'
import Community from './pages/Community'
import HealthInsights from './pages/HealthInsights'
import Profile from './pages/Profile'
import { SubscriptionProvider } from './hooks/useSubscription'
import { EcosystemProvider } from './hooks/useEcosystem'

function App() {
  return (
    <SubscriptionProvider>
      <EcosystemProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          
          {/* App routes with layout - no auth required */}
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/symptoms" element={
            <Layout>
              <SymptomTracker />
            </Layout>
          } />
          <Route path="/treatments" element={
            <Layout>
              <TreatmentPlanner />
            </Layout>
          } />
          <Route path="/community" element={
            <Layout>
              <Community />
            </Layout>
          } />
          <Route path="/insights" element={
            <Layout>
              <HealthInsights />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <Profile />
            </Layout>
          } />
        </Routes>
      </EcosystemProvider>
    </SubscriptionProvider>
  )
}

export default App