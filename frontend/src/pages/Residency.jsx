import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import logger from '../utils/logger'
import FilingProgress from '../components/FilingProgress'
import Breadcrumb from '../components/Breadcrumb'

function Residency() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [usCitizen, setUsCitizen] = useState(null)
  const [greenCardHolder, setGreenCardHolder] = useState(null)
  const hasLoadedFromCache = useRef(false)

  // Save function to ensure data is saved
  const saveToCache = () => {
    const residencyData = {
      usCitizen,
      greenCardHolder
    }
    localStorage.setItem('filing_residency', JSON.stringify(residencyData))
  }

  // Load cached data on mount and whenever location changes (navigation)
  useEffect(() => {
    hasLoadedFromCache.current = false
    try {
      const cached = localStorage.getItem('filing_residency')
      if (cached) {
        const data = JSON.parse(cached)
        setUsCitizen(data.usCitizen ?? null)
        setGreenCardHolder(data.greenCardHolder ?? null)
      }
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    } catch (e) {
      logger.error('Error loading cached residency data:', e)
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    }
  }, [location.pathname])

  // Save to cache whenever form data changes (but not before loading from cache)
  useEffect(() => {
    if (!hasLoadedFromCache.current) return
    saveToCache()
  }, [usCitizen, greenCardHolder])

  const handleContinue = () => {
    if (usCitizen === 'no' && greenCardHolder === 'no') {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/visa_status')
    }
  }

  // Calculate progress
  const allCompleted = usCitizen !== null && greenCardHolder !== null && usCitizen === 'no' && greenCardHolder === 'no'

  // Determine completed pages for progress
  const completedPages = allCompleted ? ['profile', 'residency'] : ['profile']
  
  // Check if should stop flow
  const shouldStop = (usCitizen === 'yes') || (greenCardHolder === 'yes')

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
          <FilingProgress currentPage="residency" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <Breadcrumb />
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Residency Status</h1>
              <p className="text-sm text-slate-700">
                Please answer the following questions about your residency status
              </p>
            </div>

            <div className="space-y-4">
              {/* Stop Message */}
              {shouldStop && (
                <QuestionCard>
                  <div className="bg-stone-100 border border-slate-300 p-6 text-center rounded-3xl">
                    <div className="flex justify-center mb-4">
                      <svg className="w-12 h-12 text-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-ink mb-3">
                      Taxcurb is specifically a non-resident F1 Student only
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {usCitizen === 'yes' 
                        ? 'U.S. citizens are not eligible for this service. Please use Form 1040 for resident tax filing.'
                        : 'Green card holders are not eligible for this service. Please use Form 1040 for resident tax filing.'}
                    </p>
                  </div>
                </QuestionCard>
              )}

              {/* Question 1: US Citizen */}
              {!shouldStop && (
                <>
                  <QuestionCard>
                    <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                      Were you a U.S. citizen on the last day of 2025?
                    </h2>
                    <YesNoButtons 
                      value={usCitizen} 
                      onChange={(value) => {
                        setUsCitizen(value)
                        setTimeout(saveToCache, 100)
                      }} 
                    />
                  </QuestionCard>

                  {/* Question 2: Green Card Holder */}
                  {usCitizen === 'no' && (
                    <QuestionCard>
                      <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                        Did you hold a green card at any time in 2025?
                      </h2>
                      <YesNoButtons 
                        value={greenCardHolder} 
                        onChange={(value) => {
                          setGreenCardHolder(value)
                          setTimeout(saveToCache, 100)
                        }} 
                      />
                    </QuestionCard>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between gap-3 pt-2">
                    <button
                      onClick={() => navigate('/filing/profile')}
                      className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                    >
                      ← Back
                    </button>
                    {usCitizen === 'no' && greenCardHolder === 'no' && (
                      <button
                        onClick={handleContinue}
                        className="px-6 py-2 bg-ink text-white text-xs font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Residency

