import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import FilingProgress from '../components/FilingProgress'
import { validateEmail, validatePhone, validateZIP, formatPhone, formatZIP } from '../utils/validation'

function ProgramUSPresence() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [daysInUS2023, setDaysInUS2023] = useState('')
  const [daysInUS2024, setDaysInUS2024] = useState('')
  const [daysInUS2025, setDaysInUS2025] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [institutionStreet1, setInstitutionStreet1] = useState('')
  const [institutionStreet2, setInstitutionStreet2] = useState('')
  const [institutionCity, setInstitutionCity] = useState('')
  const [institutionState, setInstitutionState] = useState('')
  const [institutionZip, setInstitutionZip] = useState('')
  const [institutionPhone, setInstitutionPhone] = useState('')
  const [dsoName, setDsoName] = useState('')
  const [dsoEmail, setDsoEmail] = useState('')
  const [dsoPhone, setDsoPhone] = useState('')
  const hasLoadedFromCache = useRef(false)

  // Save function to ensure data is saved
  const saveToCache = () => {
    const data = {
      daysInUS2023,
      daysInUS2024,
      daysInUS2025,
      institutionName,
      institutionStreet1,
      institutionStreet2,
      institutionCity,
      institutionState,
      institutionZip,
      institutionPhone,
      dsoName,
      dsoEmail,
      dsoPhone
    }
    localStorage.setItem('filing_program_presence', JSON.stringify(data))
  }

  // Load cached data and visa data on mount
  useEffect(() => {
    hasLoadedFromCache.current = false
    // Load cached program presence data
    try {
      const cached = localStorage.getItem('filing_program_presence')
      if (cached) {
        const data = JSON.parse(cached)
        setInstitutionName(data.institutionName || '')
        setInstitutionStreet1(data.institutionStreet1 || '')
        setInstitutionStreet2(data.institutionStreet2 || '')
        setInstitutionCity(data.institutionCity || '')
        setInstitutionState(data.institutionState || '')
        setInstitutionZip(data.institutionZip || '')
        setInstitutionPhone(data.institutionPhone || '')
        setDsoName(data.dsoName || '')
        setDsoEmail(data.dsoEmail || '')
        setDsoPhone(data.dsoPhone || '')
        // Load cached days if available (will be recalculated from visa data anyway)
        if (data.daysInUS2023) setDaysInUS2023(data.daysInUS2023)
        if (data.daysInUS2024) setDaysInUS2024(data.daysInUS2024)
        if (data.daysInUS2025) setDaysInUS2025(data.daysInUS2025)
      }
    } catch (e) {
      console.error('Error loading cached program presence data:', e)
    }

    // Load visa data and calculate days for all years
    const savedVisaData = localStorage.getItem('filing_visa_status')
    if (savedVisaData) {
      try {
        const visaData = JSON.parse(savedVisaData)
        const days2023 = calculateDaysInUS(visaData, 2023)
        const days2024 = calculateDaysInUS(visaData, 2024)
        const days2025 = calculateDaysInUS(visaData, 2025)
        setDaysInUS2023(days2023.toString())
        setDaysInUS2024(days2024.toString())
        setDaysInUS2025(days2025.toString())
      } catch (e) {
        console.error('Error parsing visa data:', e)
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
  }, [daysInUS2023, daysInUS2024, daysInUS2025, institutionName, institutionStreet1, institutionStreet2, institutionCity, institutionState, institutionZip, institutionPhone, dsoName, dsoEmail, dsoPhone])

  // Calculate days in US for a specific tax year
  const calculateDaysInUS = (visaData, year = 2025) => {
    if (!visaData || !visaData.dateEnteredUS) return 0

    const yearStart = new Date(`${year}-01-01`)
    const yearEnd = new Date(`${year}-12-31`)
    const initialEntryDate = new Date(visaData.dateEnteredUS)
    
    // Reset time to start of day for accurate date comparison
    yearStart.setHours(0, 0, 0, 0)
    yearEnd.setHours(0, 0, 0, 0)
    initialEntryDate.setHours(0, 0, 0, 0)

    // If entry date is after the year, return 0
    if (initialEntryDate > yearEnd) return 0

    // Determine the effective end date (program end or year end, whichever is earlier)
    const programEnd = visaData.programEndDate ? new Date(visaData.programEndDate) : null
    if (programEnd) {
      programEnd.setHours(0, 0, 0, 0)
    }
    const effectiveEndDate = programEnd && programEnd < yearEnd ? programEnd : yearEnd

    // If no exits, calculate days from entry (or year start) to effective end
    if (visaData.exitedUSA === 'no' || !visaData.exitEntries || visaData.exitEntries.length === 0) {
      const startDate = initialEntryDate > yearStart ? initialEntryDate : yearStart
      
      if (effectiveEndDate < startDate) return 0
      
      // Calculate inclusive days (both start and end dates count)
      const diffTime = effectiveEndDate - startDate
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 0
    }

    // Handle exits and re-entries
    let totalDays = 0
    
    // Get valid exit/entry pairs and sort by exit date
    const validExits = visaData.exitEntries
      .filter(e => e.exitDate && e.entryDate)
      .map(e => {
        const exit = new Date(e.exitDate)
        const entry = new Date(e.entryDate)
        exit.setHours(0, 0, 0, 0)
        entry.setHours(0, 0, 0, 0)
        return { exit, entry }
      })
      .sort((a, b) => a.exit - b.exit)

    // Start from initial entry date or year start, whichever is later
    let periodStart = initialEntryDate > yearStart ? initialEntryDate : yearStart

    // Process each exit/entry pair
    for (const exitEntry of validExits) {
      // If exit is before our current period start, check if re-entry affects us
      if (exitEntry.exit < periodStart) {
        // If re-entry is after period start and within the year, update period start
        if (exitEntry.entry > periodStart && exitEntry.entry <= yearEnd) {
          periodStart = exitEntry.entry > yearStart ? exitEntry.entry : yearStart
        }
        continue
      }

      // If exit is after the effective end date, we're done
      if (exitEntry.exit > effectiveEndDate) {
        // Count remaining days from periodStart to effectiveEndDate
        if (periodStart <= effectiveEndDate) {
          const diffTime = effectiveEndDate - periodStart
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
          totalDays += diffDays > 0 ? diffDays : 0
        }
        return totalDays
      }

      // Count days from periodStart to exit date (inclusive)
      // Clamp exit date to year boundaries
      const exitDate = exitEntry.exit > yearEnd ? yearEnd : exitEntry.exit
      if (exitDate >= periodStart) {
        const diffTime = exitDate - periodStart
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
        totalDays += diffDays > 0 ? diffDays : 0
      }

      // Update periodStart to re-entry date (if within year) or continue from where we left off
      if (exitEntry.entry > yearEnd) {
        // Re-entry is after the year, we're done
        return totalDays
      } else if (exitEntry.entry >= yearStart) {
        // Re-entry is within the year, start new period from re-entry
        periodStart = exitEntry.entry
      } else {
        // Re-entry is before the year, start from year start
        periodStart = yearStart
      }
    }

    // Calculate remaining days from last period start to effective end date
    if (periodStart <= effectiveEndDate) {
      const diffTime = effectiveEndDate - periodStart
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
      totalDays += diffDays > 0 ? diffDays : 0
    }

    return totalDays
  }

  const handleContinue = () => {
    if (allFieldsCompleted) {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/prior_visa_history')
    }
  }

  const allFieldsCompleted = 
    daysInUS2025 !== '' &&
    institutionName !== '' &&
    institutionStreet1 !== '' &&
    institutionCity !== '' &&
    institutionState !== '' &&
    validateZIP(institutionZip) &&
    validatePhone(institutionPhone) &&
    dsoName !== '' &&
    validateEmail(dsoEmail) &&
    validatePhone(dsoPhone)

  const completedPages = allFieldsCompleted 
    ? ['profile', 'residency', 'visa_status', 'income', 'identity_travel', 'program_presence']
    : ['profile', 'residency', 'visa_status', 'income', 'identity_travel']

  // US States list
  const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilingProgress currentPage="program_presence" completedPages={completedPages} />

          <main className="flex-1 max-w-3xl order-1 lg:order-2">
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Program & US Presence</h1>
              <p className="text-sm text-slate-700">
                Please provide your academic institution and DSO information
              </p>
            </div>

            <div className="space-y-3">
              {/* Days in U.S. for multiple years */}
              <QuestionCard>
                <h3 className="text-xs font-semibold text-ink mb-3">Days in U.S.</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Days in U.S. (2023)
                    </label>
                    <input
                      type="number"
                      value={daysInUS2023}
                      readOnly
                      className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-stone-50 text-ink font-medium rounded-full cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Days in U.S. (2024)
                    </label>
                    <input
                      type="number"
                      value={daysInUS2024}
                      readOnly
                      className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-stone-50 text-ink font-medium rounded-full cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Days in U.S. (2025)
                    </label>
                    <input
                      type="number"
                      value={daysInUS2025}
                      readOnly
                      className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-stone-50 text-ink font-medium rounded-full cursor-not-allowed"
                    />
                  </div>
                </div>
              </QuestionCard>

              {/* Academic Institution Section */}
              <QuestionCard>
                <h3 className="text-xs font-semibold text-ink mb-3">Academic Institution</h3>
                <div className="space-y-3">
                  {/* Institution Name */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Enter institution name"
                    />
                  </div>

                  {/* Address Section - Modular */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-semibold text-ink mb-2">Institution Address</label>
                    <div className="space-y-2">
                      {/* Street Address 1 */}
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Street Address 1 *
                        </label>
                        <input
                          type="text"
                          value={institutionStreet1}
                          onChange={(e) => setInstitutionStreet1(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          placeholder="Enter street address"
                        />
                      </div>

                      {/* Street Address 2 */}
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Street Address 2
                        </label>
                        <input
                          type="text"
                          value={institutionStreet2}
                          onChange={(e) => setInstitutionStreet2(e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>

                      {/* City, State, ZIP in grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* City */}
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={institutionCity}
                            onChange={(e) => setInstitutionCity(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                            placeholder="Enter city"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            State *
                          </label>
                          <select
                            value={institutionState}
                            onChange={(e) => setInstitutionState(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          >
                            <option value="">Select state</option>
                            {usStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* ZIP Code */}
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            value={institutionZip}
                            onChange={(e) => setInstitutionZip(formatZIP(e.target.value))}
                            className={`w-full px-3 py-1.5 text-sm border-2 rounded-full font-medium focus:outline-none ${
                              institutionZip && !validateZIP(institutionZip)
                                ? 'border-red-500 bg-red-50'
                                : 'border-slate-300 bg-white text-ink focus:border-ink'
                            }`}
                            placeholder="12345"
                            maxLength={5}
                          />
                          {institutionZip && !validateZIP(institutionZip) && (
                            <p className="text-xs text-red-600 mt-1">ZIP code must be 5 digits</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Institution Phone */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Institution Phone *
                    </label>
                    <input
                      type="tel"
                      value={institutionPhone}
                      onChange={(e) => setInstitutionPhone(formatPhone(e.target.value))}
                      className={`w-full px-3 py-1.5 text-sm border-2 rounded-full font-medium focus:outline-none ${
                        institutionPhone && !validatePhone(institutionPhone)
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-300 bg-white text-ink focus:border-ink'
                      }`}
                      placeholder="(123) 456-7890"
                      maxLength={14}
                    />
                    {institutionPhone && !validatePhone(institutionPhone) && (
                      <p className="text-xs text-red-600 mt-1">Phone number must be 10 digits</p>
                    )}
                  </div>
                </div>
              </QuestionCard>

              {/* DSO / Program Director Section with Gradient */}
              <div className="bg-gradient-to-br from-stone-100 to-stone-200 border-2 border-slate-200 rounded-3xl p-4">
                <h3 className="text-xs font-semibold text-ink mb-3">DSO / Program Director</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* DSO Name */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      DSO Name *
                    </label>
                    <input
                      type="text"
                      value={dsoName}
                      onChange={(e) => setDsoName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Enter DSO name"
                    />
                  </div>

                  {/* DSO Email */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      DSO Email *
                    </label>
                    <input
                      type="email"
                      value={dsoEmail}
                      onChange={(e) => setDsoEmail(e.target.value)}
                      className={`w-full px-3 py-1.5 text-sm border-2 rounded-full font-medium focus:outline-none ${
                        dsoEmail && !validateEmail(dsoEmail)
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-300 bg-white text-ink focus:border-ink'
                      }`}
                      placeholder="email@example.com"
                    />
                    {dsoEmail && !validateEmail(dsoEmail) && (
                      <p className="text-xs text-red-600 mt-1">Please enter a valid email address</p>
                    )}
                  </div>

                  {/* DSO Phone */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      DSO Phone *
                    </label>
                    <input
                      type="tel"
                      value={dsoPhone}
                      onChange={(e) => setDsoPhone(formatPhone(e.target.value))}
                      className={`w-full px-3 py-1.5 text-sm border-2 rounded-full font-medium focus:outline-none ${
                        dsoPhone && !validatePhone(dsoPhone)
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-300 bg-white text-ink focus:border-ink'
                      }`}
                      placeholder="(123) 456-7890"
                      maxLength={14}
                    />
                    {dsoPhone && !validatePhone(dsoPhone) && (
                      <p className="text-xs text-red-600 mt-1">Phone number must be 10 digits</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  onClick={() => navigate('/filing/identity&Traveldocument')}
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

export default ProgramUSPresence

