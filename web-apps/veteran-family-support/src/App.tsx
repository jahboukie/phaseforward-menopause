import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'

// Contexts
import { AuthProvider } from './contexts/AuthContext'
import { FamilyProvider } from './contexts/FamilyContext'
import { VeteranConnectionProvider } from './contexts/VeteranConnectionContext'

// Components
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import VeteranStatus from './pages/VeteranStatus'
import CrisisSupport from './pages/CrisisSupport'
import FamilyResources from './pages/FamilyResources'
import Profile from './pages/Profile'
import Education from './pages/Education'
import Communication from './pages/Communication'
import SupportNetwork from './pages/SupportNetwork'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FamilyProvider>
          <VeteranConnectionProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/veteran-status" element={
                    <ProtectedRoute>
                      <Layout>
                        <VeteranStatus />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/crisis-support" element={
                    <ProtectedRoute>
                      <Layout>
                        <CrisisSupport />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/resources" element={
                    <ProtectedRoute>
                      <Layout>
                        <FamilyResources />
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
                  
                  <Route path="/education" element={
                    <ProtectedRoute>
                      <Layout>
                        <Education />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/communication" element={
                    <ProtectedRoute>
                      <Layout>
                        <Communication />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/support-network" element={
                    <ProtectedRoute>
                      <Layout>
                        <SupportNetwork />
                      </Layout>
                    </ProtectedRoute>
                  } />
                </Routes>
                
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                  }}
                />
              </div>
            </Router>
          </VeteranConnectionProvider>
        </FamilyProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App