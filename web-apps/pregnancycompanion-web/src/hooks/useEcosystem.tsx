import React, { createContext, useContext, useState, useEffect } from 'react'

interface EcosystemContextType {
  isConnected: boolean
  crossAppData: any
  sentimentData: any
  pregnancyData: any
  connectToEcosystem: () => Promise<void>
}

const EcosystemContext = createContext<EcosystemContextType | undefined>(undefined)

export function EcosystemProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [crossAppData, setCrossAppData] = useState(null)
  const [sentimentData, setSentimentData] = useState(null)
  const [pregnancyData, setPregnancyData] = useState(null)

  const connectToEcosystem = async () => {
    try {
      // Simulate ecosystem connection
      setIsConnected(true)
      
      // Mock pregnancy journey data
      setPregnancyData({
        currentUser: 'Lisa',
        partnerName: 'David',
        gestationalWeek: 24,
        trimester: 'Second',
        dueDate: '2024-06-15',
        babySize: 'Corn on the cob',
        weightGain: '12 lbs',
        currentSymptoms: ['Back pain', 'Heartburn', 'Fatigue'],
        nextAppointment: '2024-01-18',
        doctorName: 'Dr. Martinez',
        pregnancyMilestones: ['Anatomy scan completed', 'Gender revealed', 'Quickening felt'],
        riskFactors: [],
        prenatalVitamins: 'Daily',
        exerciseRoutine: 'Prenatal yoga 3x/week'
      })
      
      // Mock cross-app insights
      setCrossAppData({
        fertilitytracker: { 
          effectiveness: 95, 
          insight: 'Previous tracking data helped achieve conception on optimal cycle',
          connection: 'Fertility awareness supporting healthy pregnancy progression'
        },
        supportivepartner: { 
          effectiveness: 91, 
          insight: 'Partner support crucial during second trimester challenges',
          connection: 'David is learning about pregnancy symptoms and how to help'
        },
        innerarchitect: { 
          effectiveness: 87, 
          insight: 'Mindfulness techniques helping with pregnancy anxiety',
          connection: 'Breathing exercises supporting labor preparation'
        }
      })
      
      // Mock pregnancy sentiment data
      setSentimentData({
        overallWellbeing: 8.2,
        pregnancyExcitement: 'very high',
        anxietyLevel: 3.8,
        partnerConnection: 9.3,
        recentJoy: 'Felt baby kick during partner bonding time',
        concernAreas: ['Labor preparation', 'Body changes', 'Work balance'],
        confidenceInJourney: 8.7,
        supportNetworkStrength: 9.0
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
      pregnancyData,
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