import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function IdentityTravelDocument() {
  const navigate = useNavigate()
  
  const [hasSSN, setHasSSN] = useState(null)
  const [ssn, setSSN] = useState('')
  const [passports, setPassports] = useState([{ country: '', number: '' }])
  const [hasMultiplePassports, setHasMultiplePassports] = useState(null)
  const [allCitizenships, setAllCitizenships] = useState([])

  // Load profile data to get all citizenships
  useEffect(() => {
    const savedProfile = localStorage.getItem('filing_profile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        const citizenships = [profile.countryOfCitizenship]
        if (profile.otherCitizenships && profile.otherCitizenships.length > 0) {
          citizenships.push(...profile.otherCitizenships)
        }
        setAllCitizenships(citizenships.filter(c => c))
        
        // Set first passport country to first citizenship by default
        if (profile.countryOfCitizenship) {
          setPassports([{ country: profile.countryOfCitizenship, number: '' }])
        }
      } catch (e) {
        console.error('Error parsing profile data:', e)
      }
    }
  }, [])

  const handleSSNChange = (value) => {
    // Format SSN as XXX-XX-XXXX
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 9) {
      let formatted = cleaned
      if (cleaned.length > 3) {
        formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3)
      }
      if (cleaned.length > 5) {
        formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 5) + '-' + cleaned.slice(5, 9)
      }
      setSSN(formatted)
    }
  }

  const handlePassportChange = (index, field, value) => {
    const updated = [...passports]
    updated[index][field] = value
    setPassports(updated)
  }

  const handleAddPassport = () => {
    setPassports([...passports, { country: '', number: '' }])
  }

  const handleRemovePassport = (index) => {
    if (passports.length > 1) {
      setPassports(passports.filter((_, i) => i !== index))
    }
  }

  const handleContinue = () => {
    if (allFieldsCompleted) {
      const data = {
        hasSSN,
        ssn: hasSSN === 'yes' ? ssn : '',
        passports: passports.filter(p => p.country && p.number),
        hasMultiplePassports
      }
      localStorage.setItem('filing_identity_travel', JSON.stringify(data))
      navigate('/filing/program&USpresence')
    }
  }

  const allFieldsCompleted = 
    hasSSN !== null &&
    (hasSSN === 'no' || (hasSSN === 'yes' && ssn.length === 11)) &&
    hasMultiplePassports !== null &&
    passports[0].country !== '' &&
    passports[0].number !== '' &&
    (hasMultiplePassports === 'no' || (hasMultiplePassports === 'yes' && passports.slice(1).every(p => p.country !== '' && p.number !== '')))

  const completedPages = allFieldsCompleted 
    ? ['profile', 'residency', 'visa_status', 'income', 'identity_travel']
    : ['profile', 'residency', 'visa_status', 'income']

  // List of countries
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh',
    'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia',
    'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'India', 'Indonesia', 'Iran', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia',
    'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines',
    'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa',
    'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey',
    'Ukraine', 'United Kingdom', 'United States', 'Venezuela', 'Vietnam', 'Other'
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilingProgress currentPage="identity_travel" completedPages={completedPages} />

          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Identity & Travel Document</h1>
              <p className="text-sm text-slate-700">
                Please provide your identity and travel document information
              </p>
            </div>

            <div className="space-y-4">
              {/* SSN Question */}
              <QuestionCard>
                <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                  Do you have SSN?
                </h2>
                <YesNoButtons value={hasSSN} onChange={setHasSSN} />
              </QuestionCard>

              {/* SSN Input */}
              {hasSSN === 'yes' && (
                <QuestionCard>
                  <label className="block text-sm font-semibold text-ink mb-3">
                    SSN *
                  </label>
                  <input
                    type="text"
                    value={ssn}
                    onChange={(e) => handleSSNChange(e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    maxLength={11}
                    className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                  />
                  <p className="text-xs text-slate-600 mt-2">
                    Format: XXX-XX-XXXX
                  </p>
                </QuestionCard>
              )}

              {/* Passport Information */}
              <QuestionCard>
                <h3 className="text-sm font-semibold text-ink mb-4">Passport Information</h3>
                <div className="space-y-4">
                  {/* First Passport */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-2">
                      Passport Issuing Country *
                    </label>
                    <select
                      value={passports[0].country}
                      onChange={(e) => handlePassportChange(0, 'country', e.target.value)}
                      className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-2">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      value={passports[0].number}
                      onChange={(e) => handlePassportChange(0, 'number', e.target.value)}
                      className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Enter passport number"
                    />
                  </div>
                </div>
              </QuestionCard>

              {/* Multiple Passports Question */}
              <QuestionCard>
                <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                  Do you hold multiple passports?
                </h2>
                <YesNoButtons value={hasMultiplePassports} onChange={setHasMultiplePassports} />
              </QuestionCard>

              {/* Additional Passports */}
              {hasMultiplePassports === 'yes' && (
                <QuestionCard>
                  <h3 className="text-sm font-semibold text-ink mb-4">Additional Passports</h3>
                  <div className="space-y-4">
                    {passports.slice(1).map((passport, index) => (
                      <div key={index + 1} className="p-3 bg-stone-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-ink">Passport {index + 2}</span>
                          <button
                            onClick={() => handleRemovePassport(index + 1)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink mb-2">
                            Passport Issuing Country *
                          </label>
                          <select
                            value={passport.country}
                            onChange={(e) => handlePassportChange(index + 1, 'country', e.target.value)}
                            className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          >
                            <option value="">Select country</option>
                            {countries
                              .filter(c => !passports.some((p, i) => i !== index + 1 && p.country === c))
                              .map((country) => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink mb-2">
                            Passport Number *
                          </label>
                          <input
                            type="text"
                            value={passport.number}
                            onChange={(e) => handlePassportChange(index + 1, 'number', e.target.value)}
                            className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                            placeholder="Enter passport number"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleAddPassport}
                      className="w-full px-4 py-2 text-xs font-medium text-ink border-2 border-slate-300 hover:border-ink rounded-full"
                    >
                      More passport? Click here to add
                    </button>
                  </div>
                </QuestionCard>
              )}

              {/* Country of Citizenship (read-only) */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Country of Citizenship
                </label>
                <div className="space-y-2">
                  {allCitizenships.map((citizenship, index) => (
                    <input
                      key={index}
                      type="text"
                      value={citizenship}
                      readOnly
                      className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-stone-50 text-ink font-medium rounded-full cursor-not-allowed"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  This information was collected in your profile
                </p>
              </QuestionCard>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  onClick={() => navigate('/filing/income')}
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

export default IdentityTravelDocument

