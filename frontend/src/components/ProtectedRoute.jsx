import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSessionTimeout } from '../contexts/SessionTimeoutContext'
import LoadingSpinner from './LoadingSpinner'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()
  // Activate session timeout - context automatically detects filing pages
  useSessionTimeout()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!currentUser) {
    // Redirect to auth page if not authenticated
    return <Navigate to="/auth" replace />
  }

  return children
}

export default ProtectedRoute

