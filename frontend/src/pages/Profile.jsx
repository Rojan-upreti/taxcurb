import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function Profile() {
  const navigate = useNavigate()
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [countryOfCitizenship, setCountryOfCitizenship] = useState('')
  const [hasOtherCitizenship, setHasOtherCitizenship] = useState(null)
  const [otherCitizenships, setOtherCitizenships] = useState([''])

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

  const handleContinue = () => {
    if (allFieldsCompleted) {
      // Save profile data
      const profileData = {
        firstName,
        lastName,
        dateOfBirth,
        countryOfCitizenship,
        hasOtherCitizenship,
        otherCitizenships: hasOtherCitizenship === 'yes' ? otherCitizenships.filter(c => c !== '') : []
      }
      localStorage.setItem('filing_profile', JSON.stringify(profileData))
      navigate('/filing/residency')
    }
  }

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

  const allFieldsCompleted = 
    firstName !== '' &&
    lastName !== '' &&
    dateOfBirth !== '' &&
    countryOfCitizenship !== '' &&
    hasOtherCitizenship !== null &&
    (hasOtherCitizenship === 'no' || (hasOtherCitizenship === 'yes' && otherCitizenships.some(c => c !== '')))

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
              {/* First Name */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                  placeholder="Enter your first name"
                />
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
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                />
              </QuestionCard>

              {/* Country of Citizenship */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Country of Citizenship *
                </label>
                <select
                  value={countryOfCitizenship}
                  onChange={(e) => setCountryOfCitizenship(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                >
                  <option value="">Select country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </QuestionCard>

              {/* Dual Citizenship Question */}
              {countryOfCitizenship !== '' && (
                <QuestionCard>
                  <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                    Do you hold citizenship of any other country except mentioned above?
                  </h2>
                  <YesNoButtons value={hasOtherCitizenship} onChange={setHasOtherCitizenship} />
                </QuestionCard>
              )}

              {/* Other Citizenships */}
              {hasOtherCitizenship === 'yes' && (
                <QuestionCard>
                  <h3 className="text-sm font-semibold text-ink mb-4">Additional Citizenships</h3>
                  <div className="space-y-3">
                    {otherCitizenships.map((citizenship, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <select
                          value={citizenship}
                          onChange={(e) => handleCitizenshipChange(index, e.target.value)}
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

