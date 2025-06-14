import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'

export interface VeteranStatus {
  veteranId: string
  riskLevel: 'low' | 'medium' | 'high' | 'crisis'
  lastActivity: string
  recentAssessments: any[]
  allowedDataSharing: string[]
  emergencyContactStatus: boolean
}

export interface FamilyAlert {
  id: string
  type: 'crisis' | 'check_in' | 'improvement' | 'resource'
  message: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  actionRequired: boolean
}

interface VeteranConnectionContextType {
  veteranStatus: VeteranStatus | null
  familyAlerts: FamilyAlert[]
  connectionHealth: 'connected' | 'limited' | 'offline'
  connectToVeteran: (veteranId: string, accessCode: string) => Promise<boolean>
  getVeteranInsights: (veteranId: string) => Promise<any>
  sendSupportMessage: (message: string) => Promise<boolean>
  requestCheckIn: () => Promise<boolean>
  updateEmergencyContact: (isEmergencyContact: boolean) => Promise<boolean>
}

const VeteranConnectionContext = createContext<VeteranConnectionContextType | undefined>(undefined)

export function useVeteranConnection() {
  const context = useContext(VeteranConnectionContext)
  if (context === undefined) {
    throw new Error('useVeteranConnection must be used within a VeteranConnectionProvider')
  }
  return context
}

export function VeteranConnectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [veteranStatus, setVeteranStatus] = useState<VeteranStatus | null>(null)
  const [familyAlerts, setFamilyAlerts] = useState<FamilyAlert[]>([])
  const [connectionHealth, setConnectionHealth] = useState<'connected' | 'limited' | 'offline'>('offline')

  useEffect(() => {
    if (user) {
      loadVeteranConnection()
      startHealthMonitoring()
    }
  }, [user])

  const loadVeteranConnection = async () => {
    try {
      // Check if family member has an existing veteran connection
      const stored = localStorage.getItem('veteran_connection')
      if (stored) {
        const connection = JSON.parse(stored)
        await refreshVeteranStatus(connection.veteranId)
        setConnectionHealth('connected')
      }
    } catch (error) {
      console.error('Failed to load veteran connection:', error)
      setConnectionHealth('offline')
    }
  }

  const startHealthMonitoring = () => {
    // Check connection health every 30 seconds
    const interval = setInterval(async () => {
      try {
        await checkConnectionHealth()
      } catch (error) {
        console.error('Health monitoring failed:', error)
      }
    }, 30000)

    return () => clearInterval(interval)
  }

  const checkConnectionHealth = async () => {
    try {
      const response = await axios.get('/api/ecosystem/health', {
        timeout: 5000
      })
      
      if (response.status === 200) {
        setConnectionHealth('connected')
      } else {
        setConnectionHealth('limited')
      }
    } catch (error) {
      setConnectionHealth('offline')
    }
  }

  const connectToVeteran = async (veteranId: string, accessCode: string): Promise<boolean> => {
    try {
      // In production, this would validate the access code with the veteran's app
      const response = await axios.post('/api/family/connect-veteran', {
        familyMemberId: user?.id,
        veteranId,
        accessCode
      })

      if (response.data.success) {
        // Store connection locally
        localStorage.setItem('veteran_connection', JSON.stringify({
          veteranId,
          connectedAt: new Date().toISOString(),
          accessLevel: response.data.accessLevel
        }))

        await refreshVeteranStatus(veteranId)
        setConnectionHealth('connected')
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to connect to veteran:', error)
      return false
    }
  }

  const refreshVeteranStatus = async (veteranId: string) => {
    try {
      // Simulate veteran status data - in production this would come from ecosystem
      const mockStatus: VeteranStatus = {
        veteranId,
        riskLevel: Math.random() > 0.8 ? 'high' : Math.random() > 0.6 ? 'medium' : 'low',
        lastActivity: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        recentAssessments: [],
        allowedDataSharing: ['basic_status', 'crisis_alerts', 'check_ins'],
        emergencyContactStatus: true
      }

      setVeteranStatus(mockStatus)

      // Generate family alerts based on status
      await generateFamilyAlerts(mockStatus)

    } catch (error) {
      console.error('Failed to refresh veteran status:', error)
    }
  }

  const generateFamilyAlerts = async (status: VeteranStatus) => {
    const alerts: FamilyAlert[] = []

    // Crisis alert
    if (status.riskLevel === 'crisis') {
      alerts.push({
        id: `crisis_${Date.now()}`,
        type: 'crisis',
        message: 'Your veteran may need immediate support. Crisis resources are available 24/7.',
        timestamp: new Date().toISOString(),
        priority: 'critical',
        actionRequired: true
      })
    }

    // High risk alert
    if (status.riskLevel === 'high') {
      alerts.push({
        id: `high_risk_${Date.now()}`,
        type: 'check_in',
        message: 'Your veteran may be experiencing increased stress. Consider reaching out.',
        timestamp: new Date().toISOString(),
        priority: 'high',
        actionRequired: true
      })
    }

    // Check-in reminder
    const lastActivity = new Date(status.lastActivity)
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceActivity > 3) {
      alerts.push({
        id: `checkin_${Date.now()}`,
        type: 'check_in',
        message: `It's been ${Math.floor(daysSinceActivity)} days since your veteran's last activity. Consider sending a supportive message.`,
        timestamp: new Date().toISOString(),
        priority: 'medium',
        actionRequired: false
      })
    }

    setFamilyAlerts(alerts)
  }

  const getVeteranInsights = async (veteranId: string): Promise<any> => {
    try {
      // In production, this would fetch real insights from the ecosystem
      return {
        insights: {
          riskTrends: [
            'Sleep patterns have improved over the past week',
            'Engagement with support resources has increased',
            'Stress indicators remain elevated but stable'
          ],
          interventionRecommendations: [
            'Continue current treatment plan',
            'Encourage regular family communication',
            'Monitor for crisis indicators'
          ],
          familyAlerts: [
            'Veteran has been more isolated than usual',
            'Consider planning a low-stress family activity'
          ],
          providerReferrals: []
        },
        correlations: {
          withOtherApps: [],
          crossPlatformPatterns: [],
          familyDynamics: [
            'Family support correlates with improved outcomes',
            'Regular check-ins reduce crisis incidents'
          ]
        },
        alerts: {
          crisisRisk: veteranStatus?.riskLevel === 'crisis',
          familySupport: true,
          providerIntervention: veteranStatus?.riskLevel === 'high'
        }
      }
    } catch (error) {
      console.error('Failed to get veteran insights:', error)
      return {
        insights: { riskTrends: [], interventionRecommendations: [], familyAlerts: [], providerReferrals: [] },
        correlations: { withOtherApps: [], crossPlatformPatterns: [], familyDynamics: [] },
        alerts: { crisisRisk: false, familySupport: false, providerIntervention: false }
      }
    }
  }

  const sendSupportMessage = async (message: string): Promise<boolean> => {
    try {
      if (!veteranStatus) return false

      // In production, this would send through the ecosystem to the veteran's app
      const response = await axios.post('/api/family/send-message', {
        familyMemberId: user?.id,
        veteranId: veteranStatus.veteranId,
        message,
        timestamp: new Date().toISOString()
      })

      return response.data.success
    } catch (error) {
      console.error('Failed to send support message:', error)
      return false
    }
  }

  const requestCheckIn = async (): Promise<boolean> => {
    try {
      if (!veteranStatus) return false

      // In production, this would trigger a check-in request in the veteran's app
      const response = await axios.post('/api/family/request-checkin', {
        familyMemberId: user?.id,
        veteranId: veteranStatus.veteranId,
        timestamp: new Date().toISOString()
      })

      return response.data.success
    } catch (error) {
      console.error('Failed to request check-in:', error)
      return false
    }
  }

  const updateEmergencyContact = async (isEmergencyContact: boolean): Promise<boolean> => {
    try {
      if (!veteranStatus) return false

      const response = await axios.post('/api/family/update-emergency-contact', {
        familyMemberId: user?.id,
        veteranId: veteranStatus.veteranId,
        isEmergencyContact
      })

      if (response.data.success) {
        setVeteranStatus(prev => prev ? {
          ...prev,
          emergencyContactStatus: isEmergencyContact
        } : null)
      }

      return response.data.success
    } catch (error) {
      console.error('Failed to update emergency contact status:', error)
      return false
    }
  }

  const value = {
    veteranStatus,
    familyAlerts,
    connectionHealth,
    connectToVeteran,
    getVeteranInsights,
    sendSupportMessage,
    requestCheckIn,
    updateEmergencyContact
  }

  return (
    <VeteranConnectionContext.Provider value={value}>
      {children}
    </VeteranConnectionContext.Provider>
  )
}