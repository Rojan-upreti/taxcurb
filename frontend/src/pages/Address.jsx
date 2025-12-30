import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import FilingProgress from '../components/FilingProgress'
import logger from '../utils/logger'
import { validateZIP, formatZIP } from '../utils/validation'

function Address() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Country of Residence Address
  const [countryOfResidence, setCountryOfResidence] = useState('')
  const [residenceStreet1, setResidenceStreet1] = useState('')
  const [residenceStreet2, setResidenceStreet2] = useState('')
  const [residenceCity, setResidenceCity] = useState('')
  const [residenceState, setResidenceState] = useState('')
  const [residenceZip, setResidenceZip] = useState('')

  // United States Address
  const [usStreet1, setUsStreet1] = useState('')
  const [usStreet2, setUsStreet2] = useState('')
  const [usCity, setUsCity] = useState('')
  const [usState, setUsState] = useState('')
  const [usZip, setUsZip] = useState('')
  const hasLoadedFromCache = useRef(false)

  // Save function to ensure data is saved
  const saveToCache = () => {
    const data = {
      countryOfResidence: {
        country: countryOfResidence,
        street1: residenceStreet1,
        street2: residenceStreet2,
        city: residenceCity,
        state: residenceState,
        zip: residenceZip
      },
      unitedStates: {
        street1: usStreet1,
        street2: usStreet2,
        city: usCity,
        state: usState,
        zip: usZip
      }
    }
    localStorage.setItem('filing_address', JSON.stringify(data))
  }

  // Load cached data on mount
  useEffect(() => {
    hasLoadedFromCache.current = false
    try {
      const cached = localStorage.getItem('filing_address')
      if (cached) {
        const data = JSON.parse(cached)
        if (data.countryOfResidence) {
          setCountryOfResidence(data.countryOfResidence.country || '')
          setResidenceStreet1(data.countryOfResidence.street1 || '')
          setResidenceStreet2(data.countryOfResidence.street2 || '')
          setResidenceCity(data.countryOfResidence.city || '')
          setResidenceState(data.countryOfResidence.state || '')
          setResidenceZip(data.countryOfResidence.zip || '')
        }
        if (data.unitedStates) {
          setUsStreet1(data.unitedStates.street1 || '')
          setUsStreet2(data.unitedStates.street2 || '')
          setUsCity(data.unitedStates.city || '')
          setUsState(data.unitedStates.state || '')
          setUsZip(data.unitedStates.zip || '')
        }
      }
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    } catch (e) {
      logger.error('Error loading cached address data:', e)
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    }
  }, [location.pathname])

  // Save to cache whenever form data changes (but not before loading from cache)
  useEffect(() => {
    if (!hasLoadedFromCache.current) return
    saveToCache()
  }, [countryOfResidence, residenceStreet1, residenceStreet2, residenceCity, residenceState, residenceZip, usStreet1, usStreet2, usCity, usState, usZip])

  const handleContinue = () => {
    if (allFieldsCompleted) {
      saveToCache() // Ensure data is saved before navigation
      navigate('/filing/income')
    }
  }

  const allFieldsCompleted = 
    countryOfResidence !== '' &&
    residenceStreet1 !== '' &&
    residenceCity !== '' &&
    usStreet1 !== '' &&
    usCity !== '' &&
    usState !== '' &&
    validateZIP(usZip)

  const completedPages = allFieldsCompleted 
    ? ['profile', 'residency', 'visa_status', 'identity_travel', 'program_presence', 'prior_visa_history', 'address']
    : ['profile', 'residency', 'visa_status', 'identity_travel', 'program_presence', 'prior_visa_history']

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
          <FilingProgress currentPage="address" completedPages={completedPages} />

          <main className="flex-1 max-w-4xl order-1 lg:order-2">
            <div className="text-center mb-3">
              <h1 className="text-xl md:text-2xl font-semibold text-ink mb-0.5">Address</h1>
              <p className="text-xs text-slate-700">
                Please provide your addresses
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              {/* Address in Home Country */}
              <div className="flex-1 bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-slate-200 rounded-2xl p-3.5 flex flex-col">
                <h3 className="text-xs font-semibold text-ink mb-2.5">Address in Home Country</h3>
                <div className="flex flex-col flex-1 gap-2">
                  {/* Country */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Country *
                    </label>
                    <select
                      value={countryOfResidence}
                      onChange={(e) => setCountryOfResidence(e.target.value)}
                      onBlur={saveToCache}
                      className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                    >
                      <option value="">Select country</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Street Address 1 */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Street Address 1 *
                    </label>
                    <input
                      type="text"
                      value={residenceStreet1}
                      onChange={(e) => setResidenceStreet1(e.target.value)}
                      onBlur={saveToCache}
                      className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Enter street address"
                    />
                  </div>

                  {/* Street Address 2 */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Street Address 2
                    </label>
                    <input
                      type="text"
                      value={residenceStreet2}
                      onChange={(e) => setResidenceStreet2(e.target.value)}
                      onBlur={saveToCache}
                      className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  {/* City, State/Province, ZIP in grid */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex flex-col">
                      <label className="block text-xs font-semibold text-ink mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={residenceCity}
                        onChange={(e) => setResidenceCity(e.target.value)}
                        onBlur={saveToCache}
                        className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-semibold text-ink mb-1">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={residenceState}
                          onChange={(e) => setResidenceState(e.target.value)}
                          onBlur={saveToCache}
                          className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          placeholder="State/Province"
                        />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-semibold text-ink mb-1">
                          ZIP
                        </label>
                        <input
                          type="text"
                          value={residenceZip}
                          onChange={(e) => setResidenceZip(formatZIP(e.target.value))}
                          onBlur={saveToCache}
                          className={`w-full px-3 py-1.5 text-xs border-2 rounded-full font-medium focus:outline-none ${
                            residenceZip && !validateZIP(residenceZip)
                              ? 'border-red-500 bg-red-50'
                              : 'border-slate-300 bg-white text-ink focus:border-ink'
                          }`}
                          placeholder="ZIP"
                          maxLength={5}
                        />
                        {residenceZip && !validateZIP(residenceZip) && (
                          <p className="text-xs text-red-600 mt-0.5">ZIP code must be 5 digits</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address in United States */}
              <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-3.5 flex flex-col">
                <h3 className="text-xs font-semibold text-ink mb-2.5">Address in the United States</h3>
                <div className="flex flex-col flex-1 gap-2">
                  {/* Country - Read-only */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value="United States of America"
                      readOnly
                      disabled
                      className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-stone-50 text-ink font-medium rounded-full cursor-not-allowed"
                    />
                  </div>

                  {/* Street Address 1 */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Street Address 1 *
                    </label>
                    <input
                      type="text"
                      value={usStreet1}
                      onChange={(e) => setUsStreet1(e.target.value)}
                      onBlur={saveToCache}
                      className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Enter street address"
                    />
                  </div>

                  {/* Street Address 2 */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-ink mb-1">
                      Street Address 2
                    </label>
                    <input
                      type="text"
                      value={usStreet2}
                      onChange={(e) => setUsStreet2(e.target.value)}
                      onBlur={saveToCache}
                      className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>

                  {/* City, State, ZIP */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex flex-col">
                      <label className="block text-xs font-semibold text-ink mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={usCity}
                        onChange={(e) => setUsCity(e.target.value)}
                        onBlur={saveToCache}
                        className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="flex flex-row gap-2">
                      <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-semibold text-ink mb-1">
                          State *
                        </label>
                        <select
                          value={usState}
                          onChange={(e) => setUsState(e.target.value)}
                          onBlur={saveToCache}
                          className="w-full px-3 py-1.5 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                        >
                          <option value="">Select state</option>
                          {usStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-semibold text-ink mb-1">
                          ZIP *
                        </label>
                        <input
                          type="text"
                          value={usZip}
                          onChange={(e) => setUsZip(formatZIP(e.target.value))}
                          onBlur={saveToCache}
                          className={`w-full px-3 py-1.5 text-xs border-2 rounded-full font-medium focus:outline-none ${
                            usZip && !validateZIP(usZip)
                              ? 'border-red-500 bg-red-50'
                              : 'border-slate-300 bg-white text-ink focus:border-ink'
                          }`}
                          placeholder="12345"
                          maxLength={5}
                        />
                        {usZip && !validateZIP(usZip) && (
                          <p className="text-xs text-red-600 mt-0.5">ZIP code must be 5 digits</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-3 pt-3">
              <button
                onClick={() => navigate('/filing/prior_visa_history')}
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
          </main>
        </div>
      </div>
    </div>
  )
}

export default Address

