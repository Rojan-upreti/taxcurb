import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function VisaStatus() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [visaStatus, setVisaStatus] = useState('')
  const [dateEnteredUS, setDateEnteredUS] = useState('')
  const [exitedUSA, setExitedUSA] = useState(null)
  const [exitEntries, setExitEntries] = useState([{ exitDate: '', entryDate: '' }])
  const [programStartDate, setProgramStartDate] = useState('')
  const [programEndDate, setProgramEndDate] = useState('')
  const hasLoadedFromCache = useRef(false)

  // Save function to ensure data is saved
  const saveToCache = () => {
    const visaData = {
      visaStatus,
      dateEnteredUS,
      exitedUSA,
      exitEntries,
      programStartDate,
      programEndDate
    }
    localStorage.setItem('filing_visa_status', JSON.stringify(visaData))
  }

  // Load cached data on mount and whenever location changes (navigation)
  useEffect(() => {
    hasLoadedFromCache.current = false
    try {
      const cached = localStorage.getItem('filing_visa_status')
      if (cached) {
        const data = JSON.parse(cached)
        setVisaStatus(data.visaStatus || '')
        setDateEnteredUS(data.dateEnteredUS || '')
        setExitedUSA(data.exitedUSA ?? null)
        setExitEntries(data.exitEntries && data.exitEntries.length > 0 
          ? data.exitEntries 
          : [{ exitDate: '', entryDate: '' }])
        setProgramStartDate(data.programStartDate || '')
        setProgramEndDate(data.programEndDate || '')
      }
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    } catch (e) {
      console.error('Error loading cached visa status data:', e)
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    }
  }, [location.pathname])

  // Save to cache whenever form data changes (but not before loading from cache)
  useEffect(() => {
    if (!hasLoadedFromCache.current) return
    saveToCache()
  }, [visaStatus, dateEnteredUS, exitedUSA, exitEntries, programStartDate, programEndDate])

  const handleContinue = () => {
    if (allFieldsCompleted) {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/identity&Traveldocument')
    }
  }

  const handleAddExitEntry = () => {
    setExitEntries([...exitEntries, { exitDate: '', entryDate: '' }])
    setTimeout(saveToCache, 100)
  }

  const handleExitEntryChange = (index, field, value) => {
    const updated = [...exitEntries]
    updated[index][field] = value
    setExitEntries(updated)
  }

  const handleRemoveExitEntry = (index) => {
    if (exitEntries.length > 1) {
      setExitEntries(exitEntries.filter((_, i) => i !== index))
    }
  }

  // Validate exit/entry dates
  const isValidExitEntryDates = () => {
    if (exitedUSA === 'no' || !exitEntries || exitEntries.length === 0) return true
    if (!dateEnteredUS) return true // Can't validate if entry date not set
    
    const entryDateUS = new Date(dateEnteredUS)
    
    return exitEntries.every(entry => {
      if (!entry.exitDate || !entry.entryDate) return true // Don't validate if empty (handled by allFieldsCompleted)
      const exitDate = new Date(entry.exitDate)
      const reEntryDate = new Date(entry.entryDate)
      
      // Exit date must be after US entry date and before re-entry date
      return exitDate >= entryDateUS && exitDate < reEntryDate
    })
  }

  // Get error state for a specific exit entry
  const getExitEntryError = (entry) => {
    if (!entry.exitDate || !entry.entryDate) return false
    if (!dateEnteredUS) return false
    
    const exitDate = new Date(entry.exitDate)
    const entryDate = new Date(entry.entryDate)
    const entryDateUS = new Date(dateEnteredUS)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    exitDate.setHours(0, 0, 0, 0)
    entryDate.setHours(0, 0, 0, 0)
    
    // Check if exit date is before entry date OR if exit/entry dates are before US entry date OR if dates are in the future
    return exitDate >= entryDate || exitDate < entryDateUS || entryDate < entryDateUS || exitDate > today || entryDate > today
  }

  // Get specific error messages for exit/entry dates
  const getExitEntryErrorMessages = (entry) => {
    if (!entry.exitDate || !entry.entryDate || !dateEnteredUS) return { exit: '', entry: '' }
    
    const exitDate = new Date(entry.exitDate)
    const entryDate = new Date(entry.entryDate)
    const entryDateUS = new Date(dateEnteredUS)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    exitDate.setHours(0, 0, 0, 0)
    entryDate.setHours(0, 0, 0, 0)
    
    const errors = { exit: '', entry: '' }
    
    if (exitDate > today) {
      errors.exit = 'Exit date cannot be in the future'
    } else if (exitDate < entryDateUS) {
      errors.exit = 'Exit date cannot be earlier than Date Entered the US (I-94)'
    } else if (exitDate >= entryDate) {
      errors.exit = 'Exit date must be earlier than entry date'
    }
    
    if (entryDate > today) {
      errors.entry = 'Entry date cannot be in the future'
    } else if (entryDate < entryDateUS) {
      errors.entry = 'Entry date cannot be earlier than Date Entered the US (I-94)'
    } else if (exitDate >= entryDate) {
      errors.entry = 'Entry date must be later than exit date'
    }
    
    return errors
  }

  // Validate date entered US is not in the future
  const isValidDateEnteredUS = () => {
    if (!dateEnteredUS) return true // Don't validate if empty (handled by allFieldsCompleted)
    const entryDate = new Date(dateEnteredUS)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    entryDate.setHours(0, 0, 0, 0)
    return entryDate <= today
  }

  const dateEnteredUSError = dateEnteredUS && !isValidDateEnteredUS()

  // Validate program dates
  const isValidProgramDates = () => {
    if (!programStartDate || !programEndDate) return true // Don't validate if empty (handled by allFieldsCompleted)
    const startDate = new Date(programStartDate)
    const endDate = new Date(programEndDate)
    return startDate < endDate
  }

  const programDatesError = programStartDate && programEndDate && !isValidProgramDates()

  // Calculate progress
  const allFieldsCompleted = 
    visaStatus !== '' &&
    dateEnteredUS !== '' &&
    isValidDateEnteredUS() &&
    exitedUSA !== null &&
    (exitedUSA === 'no' || (exitedUSA === 'yes' && exitEntries.every(e => e.exitDate && e.entryDate) && isValidExitEntryDates())) &&
    programStartDate !== '' &&
    programEndDate !== '' &&
    isValidProgramDates()

  // Determine completed pages for progress
  const completedPages = allFieldsCompleted ? ['profile', 'residency', 'visa_status'] : ['profile', 'residency']


  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
          <FilingProgress currentPage="visa_status" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Visa Status</h1>
              <p className="text-sm text-slate-700">
                Please provide your visa details
              </p>
            </div>

            <div className="space-y-4">
              {/* Visa Status */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Visa Status
                </label>
                <select
                  value={visaStatus}
                  onChange={(e) => setVisaStatus(e.target.value)}
                  onBlur={saveToCache}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                >
                  <option value="">Select visa status</option>
                  <option value="F1">F-1</option>
                </select>
              </QuestionCard>

              {/* Date Entered the US (as per I-94) */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Date Entered the US (I-94)
                </label>
                <input
                  type="date"
                  value={dateEnteredUS}
                  onChange={(e) => setDateEnteredUS(e.target.value)}
                  onBlur={saveToCache}
                  max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
                  className={`w-full px-4 py-2 text-sm border-2 rounded-full font-medium focus:outline-none ${
                    dateEnteredUSError
                      ? 'border-red-500 bg-red-50 text-ink'
                      : 'border-slate-300 bg-white text-ink focus:border-ink'
                  }`}
                />
                {dateEnteredUSError && (
                  <p className="text-xs text-red-600 mt-2">
                    Date entered cannot be in the future
                  </p>
                )}
              </QuestionCard>

              {/* Did you exit USA */}
              <QuestionCard>
                <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                  Did you exit USA?
                </h2>
                <YesNoButtons 
                  value={exitedUSA} 
                  onChange={(value) => {
                    setExitedUSA(value)
                    setTimeout(saveToCache, 100)
                  }} 
                />
              </QuestionCard>

              {/* Exit/Entry Dates */}
              {exitedUSA === 'yes' && (
                <QuestionCard>
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-ink mb-3">Exit and Entry Dates</h3>
                    {exitEntries.map((entry, index) => {
                      const hasError = getExitEntryError(entry)
                      const errorMessages = getExitEntryErrorMessages(entry)
                      return (
                        <div key={index} className="p-3 bg-stone-50 border border-slate-200 rounded-2xl space-y-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-ink">Entry {index + 1}</span>
                            {exitEntries.length > 1 && (
                              <button
                                onClick={() => handleRemoveExitEntry(index)}
                                className="text-xs text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink mb-2">Date of Exit</label>
                            <input
                              type="date"
                              value={entry.exitDate}
                              onChange={(e) => {
                                handleExitEntryChange(index, 'exitDate', e.target.value)
                                setTimeout(saveToCache, 100)
                              }}
                              onBlur={saveToCache}
                              min={dateEnteredUS || undefined}
                              max={(() => {
                                const today = new Date().toISOString().split('T')[0]
                                if (!entry.entryDate) return today
                                return new Date(entry.entryDate) < new Date(today) ? entry.entryDate : today
                              })()}
                              className={`w-full px-3 py-2 text-xs border-2 rounded-full font-medium focus:outline-none ${
                                hasError && errorMessages.exit
                                  ? 'border-red-500 bg-red-50 text-ink'
                                  : 'border-slate-300 bg-white text-ink focus:border-ink'
                              }`}
                            />
                            {hasError && errorMessages.exit && (
                              <p className="text-xs text-red-600 mt-1">
                                {errorMessages.exit}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-ink mb-2">Date of Entry</label>
                            <input
                              type="date"
                              value={entry.entryDate}
                              onChange={(e) => {
                                handleExitEntryChange(index, 'entryDate', e.target.value)
                                setTimeout(saveToCache, 100)
                              }}
                              onBlur={saveToCache}
                              min={(() => {
                                if (!dateEnteredUS) return undefined
                                if (!entry.exitDate) return dateEnteredUS
                                // Use the later of exit date or US entry date
                                return new Date(entry.exitDate) > new Date(dateEnteredUS) ? entry.exitDate : dateEnteredUS
                              })()}
                              max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
                              className={`w-full px-3 py-2 text-xs border-2 rounded-full font-medium focus:outline-none ${
                                hasError && errorMessages.entry
                                  ? 'border-red-500 bg-red-50 text-ink'
                                  : 'border-slate-300 bg-white text-ink focus:border-ink'
                              }`}
                            />
                            {hasError && errorMessages.entry && (
                              <p className="text-xs text-red-600 mt-1">
                                {errorMessages.entry}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <button
                      onClick={handleAddExitEntry}
                      className="w-full px-4 py-2 text-xs font-medium text-ink border-2 border-slate-300 hover:border-ink rounded-full"
                    >
                      + Add Another Exit/Entry
                    </button>
                  </div>
                </QuestionCard>
              )}

              {/* Program Start Date */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Program Start Date
                </label>
                <input
                  type="date"
                  value={programStartDate}
                  onChange={(e) => setProgramStartDate(e.target.value)}
                  onBlur={saveToCache}
                  max={programEndDate || undefined}
                  className={`w-full px-4 py-2 text-sm border-2 rounded-full font-medium focus:outline-none ${
                    programDatesError
                      ? 'border-red-500 bg-red-50 text-ink'
                      : 'border-slate-300 bg-white text-ink focus:border-ink'
                  }`}
                />
                {programDatesError && (
                  <p className="text-xs text-red-600 mt-2">
                    Program Start Date must be earlier than Program End Date
                  </p>
                )}
              </QuestionCard>

              {/* Program End Date */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Program End Date
                </label>
                <input
                  type="date"
                  value={programEndDate}
                  onChange={(e) => setProgramEndDate(e.target.value)}
                  onBlur={saveToCache}
                  min={programStartDate || undefined}
                  className={`w-full px-4 py-2 text-sm border-2 rounded-full font-medium focus:outline-none ${
                    programDatesError
                      ? 'border-red-500 bg-red-50 text-ink'
                      : 'border-slate-300 bg-white text-ink focus:border-ink'
                  }`}
                />
                {programDatesError && (
                  <p className="text-xs text-red-600 mt-2">
                    Program End Date must be later than Program Start Date
                  </p>
                )}
              </QuestionCard>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  onClick={() => navigate('/filing/residency')}
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

export default VisaStatus

