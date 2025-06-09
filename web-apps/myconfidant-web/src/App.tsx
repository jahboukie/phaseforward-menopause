import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Relationship from './pages/Relationship'
import Education from './pages/Education'
import Progress from './pages/Progress'
import Communication from './pages/Communication'
import Support from './pages/Support'
import Profile from './pages/Profile'
import { EcosystemProvider } from './hooks/useEcosystem'

function App() {
  return (
    <EcosystemProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/relationship" element={<Relationship />} />
          <Route path="/education" element={<Education />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/support" element={<Support />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </EcosystemProvider>
  )
}

export default App