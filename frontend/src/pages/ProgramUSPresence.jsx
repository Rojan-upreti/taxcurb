import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import FilingProgress from '../components/FilingProgress'
import { validateEmail, validatePhone, validateZIP, formatPhone, formatZIP } from '../utils/validation'

function ProgramUSPresence() {
  const navigate = useNavigate()
  
  const [daysInUS, setDaysInUS] = useState('')
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

  // Load visa data and calculate days
  useEffect(() => {
    const savedVisaData = localStorage.getItem('filing_visa_status')
    if (savedVisaData) {
      try {
        const visaData = JSON.parse(savedVisaData)
        const calculatedDays = calculateDaysInUS(visaData)
        setDaysInUS(calculatedDays.toString())
      } catch (e) {
        console.error('Error parsing visa data:', e)
      }
    }
  }, [])

  // Calculate days in US (same logic as Income page)
  const calculateDaysInUS = (visaData) => {
    if (!visaData || !visaData.dateEnteredUS) return 0

    const yearStart = new Date('2025-01-01')
    const yearEnd = new Date('2025-12-31')
    const entryDate = new Date(visaData.dateEnteredUS)

    if (entryDate > yearEnd) return 0

    const startDate = entryDate > yearStart ? entryDate : yearStart

    if (visaData.exitedUSA === 'no' || !visaData.exitEntries || visaData.exitEntries.length === 0) {
      const endDate = visaData.programEndDate ? new Date(visaData.programEndDate) : yearEnd
      const finalEndDate = endDate < yearEnd ? endDate : yearEnd
      
      if (finalEndDate < startDate) return 0
      
      const diffTime = finalEndDate - startDate
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 0
    }

    let totalDays = 0
    let currentStart = startDate

    const sortedExits = [...visaData.exitEntries]
      .filter(e => e.exitDate && e.entryDate)
      .map(e => ({
        exit: new Date(e.exitDate),
        entry: new Date(e.entryDate)
      }))
      .sort((a, b) => a.exit - b.exit)

    for (const exitEntry of sortedExits) {
      if (exitEntry.exit < currentStart) {
        if (exitEntry.entry > currentStart && exitEntry.entry <= yearEnd) {
          currentStart = exitEntry.entry
        }
        continue
      }

      if (exitEntry.exit >= currentStart && exitEntry.exit <= yearEnd) {
        const exitDate = exitEntry.exit > yearEnd ? yearEnd : exitEntry.exit
        if (exitDate >= currentStart) {
          const diffTime = exitDate - currentStart
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
          totalDays += diffDays > 0 ? diffDays : 0
        }
      }

      if (exitEntry.entry >= yearStart && exitEntry.entry <= yearEnd) {
        currentStart = exitEntry.entry
      } else if (exitEntry.entry > yearEnd) {
        break
      } else if (exitEntry.entry < yearStart) {
        currentStart = yearStart
      }
    }

    if (currentStart <= yearEnd) {
      const endDate = visaData.programEndDate ? new Date(visaData.programEndDate) : yearEnd
      const finalEndDate = endDate < yearEnd ? endDate : yearEnd
      
      if (finalEndDate >= currentStart) {
        const diffTime = finalEndDate - currentStart
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        totalDays += diffDays > 0 ? diffDays : 0
      }
    }

    return totalDays
  }

  const handleContinue = () => {
    if (allFieldsCompleted) {
      const data = {
        daysInUS,
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
      navigate('/filing/prior_visa_history')
    }
  }

  const allFieldsCompleted = 
    daysInUS !== '' &&
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
              {/* Days in U.S. */}
              <QuestionCard>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Days in U.S. (2025)
                </label>
                <input
                  type="number"
                  value={daysInUS}
                  readOnly
                  className="w-full px-3 py-1.5 text-sm border-2 border-slate-300 bg-stone-50 text-ink font-medium rounded-full cursor-not-allowed"
                />
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

