import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../firebase/config'

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

  useEffect(() => {
    // Check session storage first
    const storedUser = sessionStorage.getItem('taxcurb_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setCurrentUser(userData)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        sessionStorage.removeItem('taxcurb_user')
      }
    }

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
        }
        setCurrentUser(userData)
        // Store in session storage
        sessionStorage.setItem('taxcurb_user', JSON.stringify(userData))
      } else {
        setCurrentUser(null)
        sessionStorage.removeItem('taxcurb_user')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setCurrentUser(null)
      sessionStorage.removeItem('taxcurb_user')
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value = {
    currentUser,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

