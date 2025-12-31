import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { clearAllSessionData } from '../services/sessionTimeoutService'
import SessionTimeoutWarning from '../components/SessionTimeoutWarning'
import logger from '../utils/logger'

const SessionTimeoutContext = createContext({})

export const useSessionTimeout = () => {
  const context = useContext(SessionTimeoutContext)
  if (!context) {
    throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider')
  }
  return context
}

const TIMEOUT_DURATION = 20 * 60 * 1000 // 20 minutes in milliseconds
const WARNING_THRESHOLD = 1 * 60 * 1000 // 1 minute before timeout (19 minutes elapsed)

export const SessionTimeoutProvider = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut, currentUser } = useAuth()
  
  const [isActive, setIsActive] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(60)
  const [lastActivityTime, setLastActivityTime] = useState(null)
  
  const timerIntervalRef = useRef(null)
  const warningIntervalRef = useRef(null)
  const isFilingPageRef = useRef(false)

  // Check if current route is a filing page
  useEffect(() => {
    isFilingPageRef.current = location.pathname.startsWith('/filing')
    
    // Start session if user is on a filing page and authenticated
    if (isFilingPageRef.current && currentUser) {
      if (!isActive) {
        setIsActive(true)
        setLastActivityTime(Date.now())
        logger.info('Session timeout started - user on filing page')
      }
    } else if (!isFilingPageRef.current) {
      // Stop session if user navigates away from filing pages
      if (isActive) {
        setIsActive(false)
        setShowWarning(false)
        logger.info('Session timeout paused - user left filing pages')
      }
    }
  }, [location.pathname, currentUser, isActive])

  // Handle user activity - reset timer
  const handleActivity = useCallback(() => {
    if (isActive && isFilingPageRef.current) {
      setLastActivityTime(Date.now())
      setShowWarning(false)
      setRemainingSeconds(60)
      
      // Clear any existing warning interval
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
        warningIntervalRef.current = null
      }
    }
  }, [isActive])

  // Set up activity event listeners
  useEffect(() => {
    if (!isActive || !currentUser) return

    const events = [
      'mousedown',
      'mousemove',
      'mouseup',
      'keydown',
      'keypress',
      'keyup',
      'click',
      'touchstart',
      'touchmove',
      'touchend',
      'scroll',
      'wheel',
      'focus',
    ]

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [isActive, currentUser, handleActivity])

  // Main timer logic - check every second
  useEffect(() => {
    if (!isActive || !lastActivityTime || !currentUser) {
      // Clear intervals if session is not active
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
        warningIntervalRef.current = null
      }
      return
    }

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityTime
      const remainingTime = TIMEOUT_DURATION - timeSinceLastActivity

      // Check if timeout has been reached
      if (remainingTime <= 0) {
        // Timeout reached - logout and clear data
        handleTimeout()
        return
      }

      // Check if warning should be shown (1 minute remaining)
      if (remainingTime <= WARNING_THRESHOLD && !showWarning) {
        setShowWarning(true)
        setRemainingSeconds(Math.ceil(remainingTime / 1000))
        
        // Start countdown for warning
        warningIntervalRef.current = setInterval(() => {
          const currentRemaining = TIMEOUT_DURATION - (Date.now() - lastActivityTime)
          const seconds = Math.ceil(currentRemaining / 1000)
          
          if (seconds <= 0) {
            clearInterval(warningIntervalRef.current)
            warningIntervalRef.current = null
            handleTimeout()
          } else {
            setRemainingSeconds(seconds)
          }
        }, 1000)
      }
    }, 1000)

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
        warningIntervalRef.current = null
      }
    }
  }, [isActive, lastActivityTime, currentUser, showWarning])

  // Handle timeout - logout and clear data
  const handleTimeout = useCallback(async () => {
    try {
      logger.info('Session timeout - logging out user and clearing data')
      
      // Clear all filing data
      const cleared = clearAllSessionData()
      logger.info('Cleared session data', cleared)
      
      // Sign out user
      await signOut()
      
      // Navigate to auth page with logout message
      navigate('/auth', {
        replace: true,
        state: {
          timeoutLogout: true,
          message: 'Due to inactivity, you have been logged out. All entered data has been cleared.'
        }
      })
      
      // Reset state
      setIsActive(false)
      setShowWarning(false)
      setLastActivityTime(null)
      setRemainingSeconds(60)
    } catch (error) {
      logger.error('Error during session timeout:', error)
      // Still navigate to auth page even if there's an error
      navigate('/auth', {
        replace: true,
        state: {
          timeoutLogout: true,
          message: 'Due to inactivity, you have been logged out. All entered data has been cleared.'
        }
      })
    }
  }, [signOut, navigate])

  // Handle continue session button click
  const handleContinueSession = useCallback(() => {
    setLastActivityTime(Date.now())
    setShowWarning(false)
    setRemainingSeconds(60)
    
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current)
      warningIntervalRef.current = null
    }
    
    logger.info('User continued session - timer reset')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current)
      }
    }
  }, [])

  const value = {
    isActive,
    showWarning,
    remainingSeconds,
  }

  return (
    <SessionTimeoutContext.Provider value={value}>
      {children}
      {showWarning && (
        <SessionTimeoutWarning
          onContinue={handleContinueSession}
          remainingSeconds={remainingSeconds}
        />
      )}
    </SessionTimeoutContext.Provider>
  )
}

