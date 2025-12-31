import React, { createContext, useContext, useState, useEffect } from 'react'
import { checkAuth, getCurrentUser } from '../services/authService'
import logger from '../utils/logger'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshAuth = async () => {
    try {
      const user = await checkAuth()
      if (user) {
        setCurrentUser(user)
      } else {
        setCurrentUser(null)
      }
      return user
    } catch (error) {
      logger.error('Auth verification error:', error)
      setCurrentUser(null)
      return null
    }
  }

  useEffect(() => {
    // Check authentication status from backend (cookies)
    const verifyAuth = async () => {
      // First check sessionStorage for quick load
      const storedUser = getCurrentUser()
      if (storedUser) {
        setCurrentUser(storedUser)
        setLoading(false)
      }

      // Then verify with backend (checks cookies)
      await refreshAuth()
      setLoading(false)
    }

    verifyAuth()
  }, [])

  const signOut = async () => {
    try {
      const { signOut: signOutService } = await import('../services/authService')
      await signOutService()
      setCurrentUser(null)
      return { success: true }
    } catch (error) {
      logger.error('Sign out error:', error)
      // Clear state even if there's an error
      setCurrentUser(null)
      return { success: true }
    }
  }

  const value = {
    currentUser,
    loading,
    signOut,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
