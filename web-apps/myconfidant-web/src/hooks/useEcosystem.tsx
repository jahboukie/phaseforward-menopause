import React, { createContext, useContext, useState, useEffect } from 'react'

interface EcosystemContextType {
  isConnected: boolean
  crossAppData: any
  sentimentData: any
  relationshipData: any
  connectToEcosystem: () => Promise<void>
}

const EcosystemContext = createContext<EcosystemContextType | undefined>(undefined)

export function EcosystemProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [crossAppData, setCrossAppData] = useState(null)
  const [sentimentData, setSentimentData] = useState(null)
  const [relationshipData, setRelationshipData] = useState(null)

  const connectToEcosystem = async () => {
    try {
      // Simulate ecosystem connection
      setIsConnected(true)
      
      // Mock relationship and intimacy data
      setRelationshipData({
        currentUser: 'Alex',
        partnerName: 'Sarah',
        relationshipYears: 8,
        intimacyScore: 7.2,
        communicationLevel: 8.1,
        stressFactors: ['Work pressure', 'Menopause transition'],
        recentChallenges: ['ED episodes increasing', 'Communication gaps'],
        treatmentProgress: 67,
        confidenceLevel: 6.8,
        lastGoodMoment: '2 days ago - great conversation after dinner'
      })
      
      // Mock cross-app insights
      setCrossAppData({
        menowellness: { 
          effectiveness: 89, 
          insight: 'Sarah had difficult menopause symptoms yesterday - be extra patient with intimacy',
          urgentAlert: 'Hot flashes affecting sleep - may impact mood and desire'
        },
        supportivepartner: { 
          effectiveness: 84, 
          insight: 'Your partner support score is 84% - focus on emotional connection before physical',
          urgentAlert: null
        }
      })
      
      // Mock relationship sentiment data
      setSentimentData({
        overallRelationshipHealth: 7.8,
        intimacyTrend: 'gradually improving',
        communicationScore: 8.1,
        recentPositive: 'Opened up about ED concerns - shows trust',
        areasToImprove: ['Schedule regular check-ins', 'Focus on non-sexual intimacy', 'Reduce performance pressure']
      })
    } catch (error) {
      console.error('Failed to connect to ecosystem:', error)
    }
  }

  useEffect(() => {
    connectToEcosystem()
  }, [])

  return (
    <EcosystemContext.Provider value={{
      isConnected,
      crossAppData,
      sentimentData,
      relationshipData,
      connectToEcosystem
    }}>
      {children}
    </EcosystemContext.Provider>
  )
}

export function useEcosystem() {
  const context = useContext(EcosystemContext)
  if (!context) {
    throw new Error('useEcosystem must be used within an EcosystemProvider')
  }
  return context
}