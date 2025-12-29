import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function Income() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [hasIncome, setHasIncome] = useState(null)
  const hasLoadedFromCache = useRef(false)

  // Load visa status data from localStorage (or context in future)
  const [visaData, setVisaData] = useState(null)

  useEffect(() => {
    // Try to load visa status data from localStorage
    const savedVisaData = localStorage.getItem('filing_visa_status')
    if (savedVisaData) {
      try {
        setVisaData(JSON.parse(savedVisaData))
      } catch (e) {
        console.error('Error parsing visa data:', e)
      }
    }
  }, [])

  // Check if person was in USA at all in 2025
  const wasInUSAIn2025 = () => {
    if (!visaData || !visaData.dateEnteredUS) return false

    const yearStart = new Date('2025-01-01')
    const yearEnd = new Date('2025-12-31')
    const entryDate = new Date(visaData.dateEnteredUS)

    // If entry date is after year end, not in USA in 2025
    if (entryDate > yearEnd) return false

    // If no exits, check if entry date is before or during 2025
    if (visaData.exitedUSA === 'no' || !visaData.exitEntries || visaData.exitEntries.length === 0) {
      return entryDate <= yearEnd
    }

    // If there are exits, check if any period overlaps with 2025
    const validExits = visaData.exitEntries.filter(e => e.exitDate && e.entryDate)
    
    // Check if entry date is before 2025 and first exit is after 2025 start
    if (entryDate < yearStart) {
      const firstExit = validExits.length > 0 ? new Date(validExits[0].exitDate) : null
      if (firstExit && firstExit > yearStart) return true
    }

    // Check if any re-entry is before or during 2025
    for (const exit of validExits) {
      const reEntry = new Date(exit.entryDate)
      if (reEntry <= yearEnd) return true
    }

    // Check if entry date is during 2025
    return entryDate >= yearStart && entryDate <= yearEnd
  }



  // Save function to ensure data is saved
  const saveToCache = () => {
    if (hasIncome !== null) {
      const incomeData = {
        hasIncome
      }
      localStorage.setItem('filing_income', JSON.stringify(incomeData))
    }
  }

  // Load cached data on mount and whenever location changes (navigation)
  useEffect(() => {
    hasLoadedFromCache.current = false
    try {
      const cached = localStorage.getItem('filing_income')
      if (cached) {
        const data = JSON.parse(cached)
        setHasIncome(data.hasIncome ?? null)
      }
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    } catch (e) {
      console.error('Error loading cached income data:', e)
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    }
  }, [location.pathname])

  // Save to cache whenever form data changes (but not before loading from cache)
  useEffect(() => {
    if (!hasLoadedFromCache.current) return
    saveToCache()
  }, [hasIncome])

  const handleContinue = () => {
    if (hasIncome === 'no') {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/identity&Traveldocument')
    }
  }

  const completedPages = hasIncome !== null
    ? ['profile', 'residency', 'visa_status', 'income']
    : ['profile', 'residency', 'visa_status']

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
          <FilingProgress currentPage="income" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Income</h1>
              <p className="text-sm text-slate-700">
                Please answer questions about your U.S. income
              </p>
            </div>

            <div className="space-y-4">
              {/* Check if person was in USA in 2025 */}
              {visaData && !wasInUSAIn2025() && (
                <QuestionCard>
                  <div className="bg-stone-100 border border-slate-300 p-6 text-center rounded-3xl">
                    <div className="flex justify-center mb-4">
                      <svg className="w-12 h-12 text-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-ink mb-3">
                      No Tax Filing Required
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Since you were not physically present in the United States for even a single day in 2025, 
                      you are not required to file tax.
                    </p>
                  </div>
                </QuestionCard>
              )}

              {/* Income Question */}
              {(!visaData || wasInUSAIn2025()) && (
                <QuestionCard>
                  <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                    Did you have ANY U.S. income in 2025?
                  </h2>
                  <div className="mb-4 text-xs text-slate-600 space-y-1">
                    <p className="font-medium">Examples:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>On-campus job (W-2)</li>
                      <li>CPT / OPT</li>
                      <li>Scholarship (1042-S)</li>
                      <li>Bank interest</li>
                      <li>Any U.S. paid work</li>
                    </ul>
                  </div>
                  <YesNoButtons 
                    value={hasIncome} 
                    onChange={(value) => {
                      setHasIncome(value)
                      setTimeout(saveToCache, 100)
                    }} 
                  />
                </QuestionCard>
              )}

              {/* No Income Path - Show continue button with back button */}
              {hasIncome === 'no' && (!visaData || wasInUSAIn2025()) && (
                <div className="flex justify-between gap-3 pt-2">
                  <button
                    onClick={() => navigate('/filing/visa_status')}
                    className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-2 bg-ink text-white text-xs font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
                  >
                    Continue →
                  </button>
                </div>
              )}

              {/* Yes Income Path - Show nothing for now */}
              {hasIncome === 'yes' && (
                <QuestionCard>
                  <p className="text-sm text-slate-700 text-center py-4">
                    Income details will be collected in a future update.
                  </p>
                </QuestionCard>
              )}

              {/* Navigation Buttons - Show when income is null or yes */}
              {(hasIncome === null || hasIncome === 'yes') && (
                <div className="flex justify-between gap-3 pt-2">
                  <button
                    onClick={() => navigate('/filing/visa_status')}
                    className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Income

