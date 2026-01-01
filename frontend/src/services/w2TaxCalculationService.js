import logger from '../utils/logger'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Collect all filing data from localStorage
 * @returns {Object} - All filing data organized by key
 */
function collectAllFilingData() {
  const filingData = {}

  const localStorageKeys = [
    'filing_profile',
    'filing_residency',
    'filing_visa_status',
    'filing_identity_travel',
    'filing_program_presence',
    'filing_prior_visa_history',
    'filing_address',
    'filing_income'
  ]

  localStorageKeys.forEach(key => {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        filingData[key] = JSON.parse(data)
      } catch (e) {
        logger.error(`Error parsing ${key} from localStorage:`, e)
      }
    }
  })

  return filingData
}

/**
 * Calculate W-2 tax by calling the backend API
 * @returns {Promise<Object>} - Tax calculation results
 */
export async function calculateW2Tax() {
  try {
    // Collect all filing data from localStorage
    const filingData = collectAllFilingData()

    if (!filingData.filing_income) {
      throw new Error('No income data found. Please complete the income section first.')
    }

    logger.info('Sending filing data to backend for tax calculation...')

    const response = await fetch(`${API_BASE_URL}/api/tax/calculate-w2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filingData),
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Tax calculation failed')
    }

    logger.info('Tax calculation successful:', result)
    return result
  } catch (error) {
    logger.error('Error calculating W-2 tax:', error)
    throw error
  }
}

