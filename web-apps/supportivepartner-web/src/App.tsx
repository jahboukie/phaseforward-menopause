import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import QuickHelp from './pages/QuickHelp'
import Understanding from './pages/Understanding'
import Communication from './pages/Communication'
import Education from './pages/Education'
import Tips from './pages/Tips'
import Support from './pages/Support'
import Profile from './pages/Profile'
import { EcosystemProvider } from './hooks/useEcosystem'

function App() {
  return (
    <EcosystemProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quick-help" element={<QuickHelp />} />
          <Route path="/understanding" element={<Understanding />} />
          <Route path="/communication" element={<Communication />} />
          <Route path="/education" element={<Education />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/support" element={<Support />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </EcosystemProvider>
  )
}

export default App