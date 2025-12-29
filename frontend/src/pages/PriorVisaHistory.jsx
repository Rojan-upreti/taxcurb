import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function PriorVisaHistory() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [hasChangedStatus, setHasChangedStatus] = useState(null)
  const [visaHistory, setVisaHistory] = useState({})
  const [yearsToShow, setYearsToShow] = useState([])
  const [entryYear, setEntryYear] = useState(null)
  const hasLoadedFromCache = useRef(false)

  // Save function to ensure data is saved
  const saveToCache = () => {
    const data = {
      hasChangedStatus,
      visaHistory
    }
    localStorage.setItem('filing_prior_visa_history', JSON.stringify(data))
  }

  // Load cached data and visa status data to determine entry date
  useEffect(() => {
    hasLoadedFromCache.current = false
    // Load cached prior visa history data
    try {
      const cached = localStorage.getItem('filing_prior_visa_history')
      if (cached) {
        const data = JSON.parse(cached)
        setHasChangedStatus(data.hasChangedStatus ?? null)
        if (data.visaHistory) {
          setVisaHistory(data.visaHistory)
        }
      }
    } catch (e) {
      console.error('Error loading cached prior visa history data:', e)
    }

    // Load visa status data to determine entry date
    const savedVisaData = localStorage.getItem('filing_visa_status')
    if (savedVisaData) {
      try {
        const visaData = JSON.parse(savedVisaData)
        if (visaData.dateEnteredUS) {
          const entryDate = new Date(visaData.dateEnteredUS)
          const year = entryDate.getFullYear()
          setEntryYear(year)
          
          // IRS requirement: only from 2019 onwards
          // Show from max(entry year, 2019) to 2025
          const startYear = Math.max(year, 2019)
          const endYear = 2025
          
          const years = []
          for (let y = startYear; y <= endYear; y++) {
            years.push(y.toString())
          }
          
          setYearsToShow(years)
          
          // Initialize visa history state for these years only if not already loaded from cache
          if (!localStorage.getItem('filing_prior_visa_history')) {
            const initialHistory = {}
            years.forEach(year => {
              initialHistory[year] = ''
            })
            setVisaHistory(initialHistory)
          }
        }
      } catch (e) {
        console.error('Error parsing visa data:', e)
        // Default to 2019-2025 if error
        const defaultYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025']
        setYearsToShow(defaultYears)
        setEntryYear(2019)
        if (!localStorage.getItem('filing_prior_visa_history')) {
          const initialHistory = {}
          defaultYears.forEach(year => {
            initialHistory[year] = ''
          })
          setVisaHistory(initialHistory)
        }
      }
    } else {
      // Default to 2019-2025 if no visa data
      const defaultYears = ['2019', '2020', '2021', '2022', '2023', '2024', '2025']
      setYearsToShow(defaultYears)
      setEntryYear(2019)
      if (!localStorage.getItem('filing_prior_visa_history')) {
        const initialHistory = {}
        defaultYears.forEach(year => {
          initialHistory[year] = ''
        })
        setVisaHistory(initialHistory)
      }
    }
    
    setTimeout(() => {
      hasLoadedFromCache.current = true
    }, 0)
  }, [location.pathname])

  // Save to cache whenever form data changes (but not before loading from cache)
  useEffect(() => {
    if (!hasLoadedFromCache.current) return
    saveToCache()
  }, [hasChangedStatus, visaHistory])

  // Auto-fill F-1 if user hasn't changed status
  useEffect(() => {
    if (hasChangedStatus === 'no' && entryYear && yearsToShow.length > 0) {
      const autoFilledHistory = {}
      yearsToShow.forEach(year => {
        const yearNum = parseInt(year)
        // Only auto-fill from entry year onwards
        if (yearNum >= entryYear) {
          autoFilledHistory[year] = 'F-1'
        } else {
          autoFilledHistory[year] = 'Not in U.S.'
        }
      })
      setVisaHistory(autoFilledHistory)
    } else if (hasChangedStatus === 'yes') {
      // Reset to empty if they changed their answer
      const resetHistory = {}
      yearsToShow.forEach(year => {
        resetHistory[year] = ''
      })
      setVisaHistory(resetHistory)
    }
  }, [hasChangedStatus, entryYear, yearsToShow])

  const handleContinue = () => {
    if (allFieldsCompleted) {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/address')
    }
  }

  const handleVisaTypeChange = (year, value) => {
    setVisaHistory(prev => ({
      ...prev,
      [year]: value
    }))
  }

  const allFieldsCompleted = 
    hasChangedStatus !== null &&
    (hasChangedStatus === 'no' || (hasChangedStatus === 'yes' && Object.values(visaHistory).every(value => value !== '')))

  const completedPages = allFieldsCompleted 
    ? ['profile', 'residency', 'visa_status', 'identity_travel', 'program_presence', 'prior_visa_history']
    : ['profile', 'residency', 'visa_status', 'identity_travel', 'program_presence']

  const visaTypes = ['F-1', 'J-1', 'M-1', 'Q', 'Not in U.S.']

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilingProgress currentPage="prior_visa_history" completedPages={completedPages} />

          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Prior Visa History</h1>
              <p className="text-sm text-slate-700">
                Please provide your visa type for each year
              </p>
            </div>

            <div className="space-y-4">
              {/* Status Change Question */}
              <QuestionCard>
                <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                  Have you ever changed your visa status?
                </h2>
                <YesNoButtons 
                  value={hasChangedStatus} 
                  onChange={(value) => {
                    setHasChangedStatus(value)
                    setTimeout(saveToCache, 100)
                  }} 
                />
                {hasChangedStatus === 'no' && (
                  <p className="text-xs text-slate-600 mt-3">
                    All years from your entry date onwards will be set to F-1.
                  </p>
                )}
              </QuestionCard>

              {/* Visa History - Only show if they selected Yes */}
              {hasChangedStatus === 'yes' && (
                <QuestionCard>
                  <h3 className="text-sm font-semibold text-ink mb-4">Visa Type for Each Year</h3>
                  <p className="text-xs text-slate-600 mb-4">
                    IRS requires visa history from 2019 onwards. Years shown are based on your entry date.
                  </p>
                  <div className="space-y-3">
                    {yearsToShow.map((year) => (
                      <div key={year}>
                        <label className="block text-xs font-semibold text-ink mb-2">
                          {year} *
                        </label>
                        <select
                          value={visaHistory[year] || ''}
                          onChange={(e) => {
                            handleVisaTypeChange(year, e.target.value)
                            setTimeout(saveToCache, 100)
                          }}
                          onBlur={saveToCache}
                          className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                        >
                          <option value="">Select visa type</option>
                          {visaTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </QuestionCard>
              )}

              {/* Show auto-filled summary if no status change */}
              {hasChangedStatus === 'no' && (
                <QuestionCard>
                  <h3 className="text-sm font-semibold text-ink mb-3">Visa History Summary</h3>
                  <div className="space-y-2">
                    {yearsToShow.map((year) => (
                      <div key={year} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                        <span className="text-xs font-medium text-ink">{year}</span>
                        <span className="text-xs text-slate-600">{visaHistory[year] || 'Not set'}</span>
                      </div>
                    ))}
                  </div>
                </QuestionCard>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  onClick={() => navigate('/filing/program&USpresence')}
                  className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                >
                  ← Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!allFieldsCompleted}
                  className={`px-6 py-2 text-xs font-medium transition-all border-2 rounded-full ${
                    allFieldsCompleted
                      ? 'bg-ink text-white hover:bg-slate-800 border-ink cursor-pointer'
                      : 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default PriorVisaHistory

