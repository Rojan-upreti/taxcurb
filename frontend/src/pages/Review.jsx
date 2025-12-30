import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import FilingProgress from '../components/FilingProgress'
import Form8843Preview from '../components/Form8843Preview'
import logger from '../utils/logger'

function Review() {
  const navigate = useNavigate()
  const [profileData, setProfileData] = useState(null)
  const [residencyData, setResidencyData] = useState(null)
  const [visaData, setVisaData] = useState(null)
  const [identityData, setIdentityData] = useState(null)
  const [programData, setProgramData] = useState(null)
  const [visaHistoryData, setVisaHistoryData] = useState(null)
  const [addressData, setAddressData] = useState(null)
  const [incomeData, setIncomeData] = useState(null)

  useEffect(() => {
    // Load all data from localStorage
    try {
      const profile = localStorage.getItem('filing_profile')
      if (profile) setProfileData(JSON.parse(profile))

      const residency = localStorage.getItem('filing_residency')
      if (residency) setResidencyData(JSON.parse(residency))

      const visa = localStorage.getItem('filing_visa_status')
      if (visa) setVisaData(JSON.parse(visa))

      const identity = localStorage.getItem('filing_identity_travel')
      if (identity) setIdentityData(JSON.parse(identity))

      const program = localStorage.getItem('filing_program_presence')
      if (program) setProgramData(JSON.parse(program))

      const visaHistory = localStorage.getItem('filing_prior_visa_history')
      if (visaHistory) setVisaHistoryData(JSON.parse(visaHistory))

      const address = localStorage.getItem('filing_address')
      if (address) setAddressData(JSON.parse(address))

      const income = localStorage.getItem('filing_income')
      if (income) setIncomeData(JSON.parse(income))
    } catch (e) {
      logger.error('Error loading review data:', e)
    }
  }, [])

  const handleEdit = (page) => {
    const routes = {
      profile: '/filing/profile',
      residency: '/filing/residency',
      visa_status: '/filing/visa_status',
      identity_travel: '/filing/identity&Traveldocument',
      program_presence: '/filing/program&USpresence',
      prior_visa_history: '/filing/prior_visa_history',
      address: '/filing/address',
      income: '/filing/income'
    }
    navigate(routes[page])
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch (e) {
      return dateString
    }
  }

  const formatSSN = (ssn) => {
    if (!ssn) return 'N/A'
    // Mask SSN for security (show only last 4 digits)
    if (ssn.length === 11) {
      return `XXX-XX-${ssn.slice(-4)}`
    }
    return ssn
  }

  const completedPages = [
    'profile',
    'residency',
    'visa_status',
    'identity_travel',
    'program_presence',
    'prior_visa_history',
    'address',
    'income'
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilingProgress currentPage="review" completedPages={completedPages} />

          <main className="flex-1 max-w-4xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Review Your Information</h1>
              <p className="text-sm text-slate-700">
                Please review all the information you've provided. Click the edit icon to make changes.
              </p>
            </div>

            <div className="space-y-4">
              {/* Profile Section */}
              {profileData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Profile</h2>
                    <button
                      onClick={() => handleEdit('profile')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Profile"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="font-medium text-slate-600">First Name:</span>
                        <p className="text-ink">{profileData.firstName || 'N/A'}</p>
                      </div>
                      {profileData.middleName && (
                        <div>
                          <span className="font-medium text-slate-600">Middle Name:</span>
                          <p className="text-ink">{profileData.middleName}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-slate-600">Last Name:</span>
                        <p className="text-ink">{profileData.lastName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Date of Birth:</span>
                        <p className="text-ink">{formatDate(profileData.dateOfBirth)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Country of Citizenship:</span>
                        <p className="text-ink">{profileData.countryOfCitizenship || 'N/A'}</p>
                      </div>
                      {profileData.otherCitizenships && profileData.otherCitizenships.length > 0 && profileData.otherCitizenships.some(c => c) && (
                        <div>
                          <span className="font-medium text-slate-600">Additional Citizenships:</span>
                          <p className="text-ink">{profileData.otherCitizenships.filter(c => c).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </QuestionCard>
              )}

              {/* Residency Section */}
              {residencyData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Residency</h2>
                    <button
                      onClick={() => handleEdit('residency')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Residency"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Were you a U.S. citizen on the last day of 2025?</span>
                      <p className="text-ink">{residencyData.usCitizen === 'yes' ? 'Yes' : residencyData.usCitizen === 'no' ? 'No' : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Did you hold a green card at any time in 2025?</span>
                      <p className="text-ink">{residencyData.greenCardHolder === 'yes' ? 'Yes' : residencyData.greenCardHolder === 'no' ? 'No' : 'N/A'}</p>
                    </div>
                  </div>
                </QuestionCard>
              )}

              {/* Visa Status Section */}
              {visaData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Visa Status</h2>
                    <button
                      onClick={() => handleEdit('visa_status')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Visa Status"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Visa Status:</span>
                      <p className="text-ink">{visaData.visaStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Date Entered the US (I-94):</span>
                      <p className="text-ink">{formatDate(visaData.dateEnteredUS)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Did you exit USA?</span>
                      <p className="text-ink">{visaData.exitedUSA === 'yes' ? 'Yes' : visaData.exitedUSA === 'no' ? 'No' : 'N/A'}</p>
                    </div>
                    {visaData.exitedUSA === 'yes' && visaData.exitEntries && visaData.exitEntries.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-600">Exit and Entry Dates:</span>
                        <div className="mt-2 space-y-2">
                          {visaData.exitEntries.map((entry, index) => (
                            <div key={index} className="pl-4 border-l-2 border-slate-200">
                              <p className="text-xs text-slate-500">Exit {index + 1}</p>
                              <p className="text-ink">Exit Date: {formatDate(entry.exitDate)}</p>
                              <p className="text-ink">Entry Date: {formatDate(entry.entryDate)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-slate-600">Program Start Date:</span>
                      <p className="text-ink">{formatDate(visaData.programStartDate)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-600">Program End Date:</span>
                      <p className="text-ink">{formatDate(visaData.programEndDate)}</p>
                    </div>
                  </div>
                </QuestionCard>
              )}

              {/* Identity & Travel Section */}
              {identityData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Identity & Travel Document</h2>
                    <button
                      onClick={() => handleEdit('identity_travel')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Identity & Travel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Do you hold multiple passports?</span>
                      <p className="text-ink">{identityData.hasMultiplePassports === 'yes' ? 'Yes' : identityData.hasMultiplePassports === 'no' ? 'No' : 'N/A'}</p>
                    </div>
                    {identityData.passports && identityData.passports.length > 0 && (
                      <div>
                        <span className="font-medium text-slate-600">Passport Information:</span>
                        <div className="mt-2 space-y-3">
                          {identityData.passports.map((passport, index) => (
                            <div key={index} className="pl-4 border-l-2 border-slate-200">
                              <p className="text-xs text-slate-500">Passport {index + 1}</p>
                              <p className="text-ink">Issuing Country: {passport.country || 'N/A'}</p>
                              <p className="text-ink">Passport Number: {passport.number || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </QuestionCard>
              )}

              {/* Program & Presence Section */}
              {programData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Program & US Presence</h2>
                    <button
                      onClick={() => handleEdit('program_presence')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Program & Presence"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <span className="font-medium text-slate-600">Days in U.S. (2023):</span>
                        <p className="text-ink">{programData.daysInUS2023 || '0'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Days in U.S. (2024):</span>
                        <p className="text-ink">{programData.daysInUS2024 || '0'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Days in U.S. (2025):</span>
                        <p className="text-ink">{programData.daysInUS2025 || '0'}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-600">Academic Institution:</span>
                      <p className="text-ink">{programData.institutionName || 'N/A'}</p>
                      {programData.institutionStreet1 && (
                        <div className="mt-2 text-ink">
                          <p>{programData.institutionStreet1}</p>
                          {programData.institutionStreet2 && <p>{programData.institutionStreet2}</p>}
                          <p>{[programData.institutionCity, programData.institutionState, programData.institutionZip].filter(Boolean).join(', ')}</p>
                          {programData.institutionPhone && <p className="mt-1">Phone: {programData.institutionPhone}</p>}
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-600">DSO / Program Director:</span>
                      <div className="mt-2 space-y-1">
                        <p className="text-ink">Name: {programData.dsoName || 'N/A'}</p>
                        <p className="text-ink">Email: {programData.dsoEmail || 'N/A'}</p>
                        <p className="text-ink">Phone: {programData.dsoPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </QuestionCard>
              )}

              {/* Prior Visa History Section */}
              {visaHistoryData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Prior Visa History</h2>
                    <button
                      onClick={() => handleEdit('prior_visa_history')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Prior Visa History"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Have you ever changed your visa status?</span>
                      <p className="text-ink">{visaHistoryData.hasChangedStatus === 'yes' ? 'Yes' : visaHistoryData.hasChangedStatus === 'no' ? 'No' : 'N/A'}</p>
                    </div>
                    {visaHistoryData.visaHistory && Object.keys(visaHistoryData.visaHistory).length > 0 && (
                      <div>
                        <span className="font-medium text-slate-600">Visa Type by Year:</span>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries(visaHistoryData.visaHistory).map(([year, type]) => (
                            <div key={year} className="p-2 bg-stone-50 rounded-lg">
                              <p className="text-xs text-slate-500">{year}</p>
                              <p className="text-ink font-medium">{type || 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </QuestionCard>
              )}

              {/* Address Section */}
              {addressData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Address</h2>
                    <button
                      onClick={() => handleEdit('address')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Address"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Address in Home Country:</span>
                      <div className="mt-2 text-ink">
                        {addressData.countryOfResidence && (
                          <p>{typeof addressData.countryOfResidence === 'object' ? addressData.countryOfResidence.country : addressData.countryOfResidence}</p>
                        )}
                        {(addressData.residenceStreet1 || (addressData.countryOfResidence && typeof addressData.countryOfResidence === 'object' && addressData.countryOfResidence.street1)) && (
                          <>
                            <p>{addressData.residenceStreet1 || (addressData.countryOfResidence?.street1)}</p>
                            {(addressData.residenceStreet2 || addressData.countryOfResidence?.street2) && (
                              <p>{addressData.residenceStreet2 || addressData.countryOfResidence?.street2}</p>
                            )}
                            <p>
                              {[
                                addressData.residenceCity || addressData.countryOfResidence?.city,
                                addressData.residenceState || addressData.countryOfResidence?.state,
                                addressData.residenceZip || addressData.countryOfResidence?.zip
                              ].filter(Boolean).join(', ')}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <span className="font-medium text-slate-600">Address in the United States:</span>
                      {(addressData.usStreet1 || (addressData.unitedStates && addressData.unitedStates.street1)) && (
                        <div className="mt-2 text-ink">
                          <p>{addressData.usStreet1 || addressData.unitedStates?.street1}</p>
                          {(addressData.usStreet2 || addressData.unitedStates?.street2) && (
                            <p>{addressData.usStreet2 || addressData.unitedStates?.street2}</p>
                          )}
                          <p>
                            {[
                              addressData.usCity || addressData.unitedStates?.city,
                              addressData.usState || addressData.unitedStates?.state,
                              addressData.usZip || addressData.unitedStates?.zip
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </QuestionCard>
              )}

              {/* Income Section */}
              {incomeData && (
                <QuestionCard>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-semibold text-ink">Income</h2>
                    <button
                      onClick={() => handleEdit('income')}
                      className="p-2 text-ink hover:bg-stone-100 rounded-full transition-colors"
                      title="Edit Income"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-600">Did you have ANY U.S. income in 2025?</span>
                      <p className="text-ink">{incomeData.hasIncome === 'yes' ? 'Yes' : incomeData.hasIncome === 'no' ? 'No' : 'N/A'}</p>
                    </div>
                    {incomeData.hasIncome === 'no' && (
                      <>
                        <div>
                          <span className="font-medium text-slate-600">Do you have SSN?</span>
                          <p className="text-ink">{incomeData.hasSSN === 'yes' ? 'Yes' : incomeData.hasSSN === 'no' ? 'No' : 'N/A'}</p>
                        </div>
                        {incomeData.hasSSN === 'yes' && incomeData.ssn && (
                          <div>
                            <span className="font-medium text-slate-600">SSN:</span>
                            <p className="text-ink">{formatSSN(incomeData.ssn)}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </QuestionCard>
              )}

              {/* Form 8843 Preview Section */}
              <div className="mt-8 pt-8 border-t border-slate-300">
                <Form8843Preview />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-4">
                <button
                  onClick={() => navigate('/filing/address')}
                  className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    // Navigate to submission/confirmation page when ready
                    logger.info('Submit for review')
                  }}
                  className="px-6 py-2 bg-ink text-white text-xs font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
                >
                  Submit for Review →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Review

