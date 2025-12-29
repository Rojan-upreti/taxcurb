import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function IdentityTravelDocument() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [hasSSN, setHasSSN] = useState(null)
  const [ssn, setSSN] = useState('')
  const [passports, setPassports] = useState([{ country: '', number: '' }])
  const [hasMultiplePassports, setHasMultiplePassports] = useState(null)
  const [allCitizenships, setAllCitizenships] = useState([])
  const hasLoadedFromCache = useRef(false)

  // Save function to ensure data is saved
  const saveToCache = () => {
    const data = {
      hasSSN,
      ssn: hasSSN === 'yes' ? ssn : '',
      passports: passports.length > 0 ? passports : [{ country: '', number: '' }], // Always save full array
      hasMultiplePassports
    }
    localStorage.setItem('filing_identity_travel', JSON.stringify(data))
  }

  // Load profile data to get all citizenships and cached identity data
  useEffect(() => {
    hasLoadedFromCache.current = false
    let hasCachedPassports = false
    
    // Load cached identity data first
    try {
      const cached = localStorage.getItem('filing_identity_travel')
      if (cached) {
        const data = JSON.parse(cached)
        setHasSSN(data.hasSSN ?? null)
        setSSN(data.ssn || '')
        setHasMultiplePassports(data.hasMultiplePassports ?? null)
        if (data.passports && data.passports.length > 0) {
          setPassports(data.passports)
          hasCachedPassports = true
        }
      }
    } catch (e) {
      console.error('Error loading cached identity data:', e)
    }

    // Load profile data to get all citizenships
    const savedProfile = localStorage.getItem('filing_profile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        const citizenships = [profile.countryOfCitizenship]
        if (profile.otherCitizenships && profile.otherCitizenships.length > 0) {
          citizenships.push(...profile.otherCitizenships)
        }
        setAllCitizenships(citizenships.filter(c => c))
        
        // Set first passport country to first citizenship by default if not already loaded from cache
        if (profile.countryOfCitizenship && !hasCachedPassports) {
          setPassports([{ country: profile.countryOfCitizenship, number: '' }])
        }
      } catch (e) {
        console.error('Error parsing profile data:', e)
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
  }, [hasSSN, ssn, passports, hasMultiplePassports])

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
    setTimeout(saveToCache, 100)
  }

  const handleRemovePassport = (index) => {
    if (passports.length > 1) {
      setPassports(passports.filter((_, i) => i !== index))
    }
  }

  const handleContinue = () => {
    if (allFieldsCompleted) {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/program&USpresence')
    }
  }

  // Check if any passport country is United States
  const hasUSPassport = passports.some(p => p.country === 'United States')

  const allFieldsCompleted = 
    hasSSN !== null &&
    (hasSSN === 'no' || (hasSSN === 'yes' && ssn.length === 11)) &&
    hasMultiplePassports !== null &&
    passports[0].country !== '' &&
    passports[0].number !== '' &&
    !hasUSPassport &&
    (hasMultiplePassports === 'no' || (hasMultiplePassports === 'yes' && passports.slice(1).every(p => p.country !== '' && p.number !== '' && p.country !== 'United States')))

  const completedPages = allFieldsCompleted 
    ? ['profile', 'residency', 'visa_status', 'income', 'identity_travel']
    : ['profile', 'residency', 'visa_status', 'income']

  // List of countries
  const countries = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Cape Verde',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
    'Other'
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
                <YesNoButtons 
                  value={hasSSN} 
                  onChange={(value) => {
                    setHasSSN(value)
                    setTimeout(saveToCache, 100)
                  }} 
                />
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
                    onBlur={saveToCache}
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
                      onChange={(e) => {
                        handlePassportChange(0, 'country', e.target.value)
                        setTimeout(saveToCache, 100)
                      }}
                      onBlur={saveToCache}
                      className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                    {passports[0].country === 'United States' && (
                      <div className="mt-3 bg-stone-100 border border-slate-300 p-4 text-center rounded-3xl">
                        <div className="flex justify-center mb-2">
                          <svg className="w-8 h-8 text-ink" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-ink">
                          This is for Specifically F1 Non Resident alien only
                        </p>
                        <p className="text-xs text-slate-700 mt-1">
                          U.S. citizens are not eligible for this service.
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-2">
                      Passport Number *
                    </label>
                    <input
                      type="text"
                      value={passports[0].number}
                      onChange={(e) => {
                        handlePassportChange(0, 'number', e.target.value)
                        setTimeout(saveToCache, 100)
                      }}
                      onBlur={saveToCache}
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
                <YesNoButtons 
                  value={hasMultiplePassports} 
                  onChange={(value) => {
                    setHasMultiplePassports(value)
                    setTimeout(saveToCache, 100)
                  }} 
                />
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
                            onChange={(e) => {
                              handlePassportChange(index + 1, 'country', e.target.value)
                              setTimeout(saveToCache, 100)
                            }}
                            onBlur={saveToCache}
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
                          {passport.country === 'United States' && (
                            <div className="mt-3 bg-stone-100 border border-slate-300 p-3 text-center rounded-2xl">
                              <p className="text-xs font-semibold text-ink">
                                This is for Specifically F1 Non Resident alien only
                              </p>
                              <p className="text-xs text-slate-700 mt-1">
                                U.S. citizens are not eligible for this service.
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-ink mb-2">
                            Passport Number *
                          </label>
                          <input
                            type="text"
                            value={passport.number}
                            onChange={(e) => {
                              handlePassportChange(index + 1, 'number', e.target.value)
                              setTimeout(saveToCache, 100)
                            }}
                            onBlur={saveToCache}
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

