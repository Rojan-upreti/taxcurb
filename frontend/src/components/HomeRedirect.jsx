import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LandingPage from '../LandingPage'
import LoadingSpinner from './LoadingSpinner'

function HomeRedirect() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  // If user is authenticated, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/dashboard" replace />
  }

  // If not authenticated, show landing page
  return <LandingPage />
}

export default HomeRedirect

