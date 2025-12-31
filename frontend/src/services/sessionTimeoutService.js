// Service for clearing all filing-related data from localStorage and sessionStorage
import logger from '../utils/logger'

/**
 * List of all filing-related localStorage keys to clear
 */
const FILING_STORAGE_KEYS = [
  'filing_profile',
  'filing_residency',
  'filing_visa_status',
  'filing_identity_travel',
  'filing_program_presence',
  'filing_prior_visa_history',
  'filing_address',
  'filing_income',
]

/**
 * Clear all filing-related data from localStorage
 * @returns {Array<string>} List of cleared keys
 */
export const clearFilingData = () => {
  const clearedKeys = []
  
  try {
    // Clear all known filing keys
    FILING_STORAGE_KEYS.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        clearedKeys.push(key)
      }
    })
    
    // Clear all onboarding data keys (they follow pattern: taxcurb_onboarding_data_*)
    const onboardingKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('taxcurb_onboarding_data_')) {
        localStorage.removeItem(key)
        onboardingKeys.push(key)
      }
    }
    clearedKeys.push(...onboardingKeys)
    
    logger.info('Cleared filing data from localStorage', { clearedKeys })
  } catch (error) {
    logger.error('Error clearing filing data:', error)
  }
  
  return clearedKeys
}

/**
 * Clear all data from sessionStorage
 * @returns {Array<string>} List of cleared keys
 */
export const clearSessionStorage = () => {
  const clearedKeys = []
  
  try {
    // Store keys before clearing
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key) {
        clearedKeys.push(key)
      }
    }
    
    sessionStorage.clear()
    logger.info('Cleared sessionStorage', { clearedKeys })
  } catch (error) {
    logger.error('Error clearing sessionStorage:', error)
  }
  
  return clearedKeys
}

/**
 * Clear all filing-related data and session storage
 * This is the main function to call when session times out
 * @returns {Object} Summary of cleared data
 */
export const clearAllSessionData = () => {
  const filingKeys = clearFilingData()
  const sessionKeys = clearSessionStorage()
  
  return {
    filingKeys,
    sessionKeys,
    totalCleared: filingKeys.length + sessionKeys.length
  }
}

