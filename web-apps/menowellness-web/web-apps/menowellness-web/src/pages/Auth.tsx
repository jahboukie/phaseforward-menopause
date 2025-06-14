import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AuthForm from '../components/AuthForm'

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleToggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  const handleAuthSuccess = () => {
    navigate('/dashboard')
  }

  return (
    <AuthForm 
      mode={mode} 
      onToggleMode={handleToggleMode}
      onSuccess={handleAuthSuccess}
    />
  )
}