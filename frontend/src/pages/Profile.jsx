import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [countryOfCitizenship, setCountryOfCitizenship] = useState('')
  const [hasOtherCitizenship, setHasOtherCitizenship] = useState(null)
  const [otherCitizenships, setOtherCitizenships] = useState([''])
  const hasLoadedFromCache = useRef(false)

  // Load cached data on mount and whenever location changes (navigation)
  useEffect(() => {
    hasLoadedFromCache.current = false // Reset flag when navigating to this page
    try {
      const cached = localStorage.getItem('filing_profile')
      if (cached) {
        const data = JSON.parse(cached)
        setFirstName(data.firstName || '')
        setMiddleName(data.middleName || '')
        setLastName(data.lastName || '')
        setDateOfBirth(data.dateOfBirth || '')
        setCountryOfCitizenship(data.countryOfCitizenship || '')
        setHasOtherCitizenship(data.hasOtherCitizenship ?? null)
        setOtherCitizenships(data.otherCitizenships && data.otherCitizenships.length > 0 
          ? data.otherCitizenships 
          : [''])
      }
      // Wait a tick to ensure state is set before allowing saves
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    } catch (e) {
      console.error('Error loading cached profile data:', e)
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    }
  }, [location.pathname]) // Reload when pathname changes (navigation)

  // Save to cache whenever form data changes (but not before loading from cache)
  useEffect(() => {
    if (!hasLoadedFromCache.current) return // Don't save before loading from cache
    
    // Always save the full array to preserve state, including empty strings
    const profileData = {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      countryOfCitizenship,
      hasOtherCitizenship,
      otherCitizenships: otherCitizenships.length > 0 ? otherCitizenships : [''] // Always preserve at least one empty slot if array is empty
    }
    localStorage.setItem('filing_profile', JSON.stringify(profileData))
  }, [firstName, middleName, lastName, dateOfBirth, countryOfCitizenship, hasOtherCitizenship, otherCitizenships])

  const handleAddCitizenship = () => {
    setOtherCitizenships([...otherCitizenships, ''])
  }

  const handleCitizenshipChange = (index, value) => {
    const updated = [...otherCitizenships]
    updated[index] = value
    setOtherCitizenships(updated)
  }

  const handleRemoveCitizenship = (index) => {
    if (otherCitizenships.length > 1) {
      setOtherCitizenships(otherCitizenships.filter((_, i) => i !== index))
    }
  }

  // Save function to ensure data is saved
  const saveToCache = () => {
    const profileData = {
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      countryOfCitizenship,
      hasOtherCitizenship,
      otherCitizenships: otherCitizenships.length > 0 ? otherCitizenships : ['']
    }
    localStorage.setItem('filing_profile', JSON.stringify(profileData))
  }

  const handleContinue = () => {
    if (allFieldsCompleted) {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/residency')
    }
  }

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

  // Validate date of birth is in the past
  const isValidDateOfBirth = () => {
    if (!dateOfBirth) return true // Don't validate if empty (handled by allFieldsCompleted)
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare dates only
    return birthDate < today
  }

  const dateOfBirthError = dateOfBirth && !isValidDateOfBirth()

  // Check if United States is selected as citizenship
  const hasUSCitizenship = countryOfCitizenship === 'United States' || 
    (hasOtherCitizenship === 'yes' && otherCitizenships.some(c => c === 'United States'))

  const allFieldsCompleted = 
    firstName !== '' &&
    lastName !== '' &&
    dateOfBirth !== '' &&
    isValidDateOfBirth() &&
    countryOfCitizenship !== '' &&
    !hasUSCitizenship &&
    hasOtherCitizenship !== null &&
    (hasOtherCitizenship === 'no' || (hasOtherCitizenship === 'yes' && otherCitizenships.some(c => c !== '' && c !== 'United States')))

  const completedPages = allFieldsCompleted ? ['profile'] : []

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
          <FilingProgress currentPage="profile" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Profile</h1>
              <p className="text-sm text-slate-700">
                Please provide your basic information
              </p>
            </div>

            <div className="space-y-4">
              {/* First Name and Middle Name */}
              <QuestionCard>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-3">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={saveToCache}
                      className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-3">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      onBlur={saveToCache}
                      className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Enter your middle name (optional)"
                    />
                  </div>
                </div>
              </QuestionCard>

              {/* Last Name */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={saveToCache}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                  placeholder="Enter your last name"
                />
              </QuestionCard>

              {/* Date of Birth */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  onBlur={saveToCache}
                  max={new Date().toISOString().split('T')[0]} // Prevent selecting future dates
                  className={`w-full px-4 py-2 text-sm border-2 rounded-full font-medium focus:outline-none ${
                    dateOfBirthError
                      ? 'border-red-500 bg-red-50 text-ink'
                      : 'border-slate-300 bg-white text-ink focus:border-ink'
                  }`}
                />
                {dateOfBirthError && (
                  <p className="text-xs text-red-600 mt-2">
                    Please enter correct date of birth
                  </p>
                )}
              </QuestionCard>

              {/* Country of Citizenship */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Country of Citizenship *
                </label>
                <select
                  value={countryOfCitizenship}
                  onChange={(e) => setCountryOfCitizenship(e.target.value)}
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
                {countryOfCitizenship === 'United States' && (
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
              </QuestionCard>

              {/* Dual Citizenship Question */}
              {countryOfCitizenship !== '' && (
                <QuestionCard>
                  <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                    Do you hold citizenship of any other country except mentioned above?
                  </h2>
                  <YesNoButtons 
                    value={hasOtherCitizenship} 
                    onChange={(value) => {
                      setHasOtherCitizenship(value)
                      // Save after a brief delay to ensure state is updated
                      setTimeout(saveToCache, 100)
                    }} 
                  />
                </QuestionCard>
              )}

              {/* Other Citizenships */}
              {hasOtherCitizenship === 'yes' && (
                <QuestionCard>
                  <h3 className="text-sm font-semibold text-ink mb-4">Additional Citizenships</h3>
                  <div className="space-y-3">
                    {otherCitizenships.map((citizenship, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2 items-start">
                          <select
                            value={citizenship}
                            onChange={(e) => {
                              handleCitizenshipChange(index, e.target.value)
                              setTimeout(saveToCache, 100)
                            }}
                            onBlur={saveToCache}
                            className="flex-1 px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          >
                            <option value="">Select country</option>
                            {countries
                              .filter(c => c !== countryOfCitizenship && !otherCitizenships.some((oc, i) => i !== index && oc === c))
                              .map((country) => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))}
                          </select>
                          {otherCitizenships.length > 1 && (
                            <button
                              onClick={() => handleRemoveCitizenship(index)}
                              className="px-3 py-2 text-xs text-red-600 hover:text-red-800 border-2 border-red-300 hover:border-red-500 rounded-full"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {citizenship === 'United States' && (
                          <div className="bg-stone-100 border border-slate-300 p-3 text-center rounded-2xl">
                            <p className="text-xs font-semibold text-ink">
                              This is for Specifically F1 Non Resident alien only
                            </p>
                            <p className="text-xs text-slate-700 mt-1">
                              U.S. citizens are not eligible for this service.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddCitizenship}
                      className="w-full px-4 py-2 text-xs font-medium text-ink border-2 border-slate-300 hover:border-ink rounded-full"
                    >
                      + Add Another Citizenship
                    </button>
                  </div>
                </QuestionCard>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  onClick={() => navigate('/filing')}
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

export default Profile

