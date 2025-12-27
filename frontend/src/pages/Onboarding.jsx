import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { saveOnboardingData, getOnboardingData, updateOnboardingAnswer } from '../services/onboardingService'

function Onboarding() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  // Questionnaire state
  const [taxYear, setTaxYear] = useState('2025')
  const [usPresence, setUsPresence] = useState(null)
  const [filingStatus, setFilingStatus] = useState('')
  const [visaType, setVisaType] = useState('')
  const [daysInUS, setDaysInUS] = useState('')
  const [hasW2, setHasW2] = useState(null)
  const [has1042S, setHas1042S] = useState(null)
  const [hasOtherIncome, setHasOtherIncome] = useState(null)
  const [state, setState] = useState('')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const steps = [
    { id: 1, title: 'Tax Year', completed: !!taxYear },
    { id: 2, title: 'US Presence', completed: usPresence !== null },
    { id: 3, title: 'Filing Status', completed: !!filingStatus },
    { id: 4, title: 'Visa Info', completed: !!visaType && !!daysInUS },
    { id: 5, title: 'Income Sources', completed: hasW2 !== null && has1042S !== null && hasOtherIncome !== null },
    { id: 6, title: 'State', completed: !!state },
  ]

  // Load saved data on mount
  useEffect(() => {
    if (currentUser) {
      const saved = getOnboardingData(currentUser.uid, taxYear)
      if (saved && saved.answers) {
        setTaxYear(saved.taxYear || taxYear)
        setUsPresence(saved.answers.usPresence || null)
        setFilingStatus(saved.answers.filingStatus || '')
        setVisaType(saved.answers.visaType || '')
        setDaysInUS(saved.answers.daysInUS || '')
        setHasW2(saved.answers.hasW2 ?? null)
        setHas1042S(saved.answers.has1042S ?? null)
        setHasOtherIncome(saved.answers.hasOtherIncome ?? null)
        setState(saved.answers.state || '')
      }
      setIsLoading(false)
    }
  }, [currentUser])

  // Save data whenever answers change
  useEffect(() => {
    if (currentUser && !isLoading) {
      const answers = {
        taxYear,
        usPresence,
        filingStatus,
        visaType,
        daysInUS,
        hasW2,
        has1042S,
        hasOtherIncome,
        state,
      }
      saveOnboardingData(currentUser.uid, taxYear, answers)
    }
  }, [taxYear, usPresence, filingStatus, visaType, daysInUS, hasW2, has1042S, hasOtherIncome, state, currentUser, isLoading])

  const handleUsPresenceChange = (value) => {
    setUsPresence(value)
    if (value === 'yes' && currentStep === 2) {
      setTimeout(() => setCurrentStep(3), 500)
    }
  }

  const handleComplete = () => {
    if (currentUser) {
      const answers = {
        taxYear,
        usPresence,
        filingStatus,
        visaType,
        daysInUS,
        hasW2,
        has1042S,
        hasOtherIncome,
        state,
      }
      saveOnboardingData(currentUser.uid, taxYear, answers)
      navigate('/dashboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-3">Tax Filing Questionnaire</h1>
          <p className="text-xl text-slate-700">
            Let's get started with a few quick questions
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center">
                  <div className={`flex flex-col items-center ${step.completed || currentStep === step.id ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                      currentStep === step.id
                        ? 'bg-ink text-white border-ink'
                        : step.completed
                        ? 'bg-white text-ink border-ink'
                        : 'bg-white text-slate-400 border-slate-300'
                    }`}>
                      {step.completed && currentStep !== step.id ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-semibold ${currentStep === step.id ? 'text-ink' : 'text-slate-600'}`}>
                      {step.title}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-0.5 mx-2 md:mx-4 transition-all ${
                    step.completed ? 'bg-ink' : 'bg-slate-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white border border-slate-300 p-8 md:p-12">
          {/* Step 1: Tax Year */}
          {currentStep === 1 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink text-white font-semibold text-lg mb-4">
                  1
                </div>
                <h2 className="text-3xl font-semibold text-ink mb-3">Tax Year</h2>
                <p className="text-slate-700 text-lg">Select the tax year you are filing for.</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <label htmlFor="tax-year" className="block text-sm font-semibold text-ink mb-3 uppercase tracking-wide">
                  Tax Year
                </label>
                <select
                  id="tax-year"
                  value={taxYear}
                  onChange={(e) => {
                    setTaxYear(e.target.value)
                    setCurrentStep(2)
                  }}
                  className="w-full px-4 py-3 border border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              <div className="flex justify-center pt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: US Presence */}
          {currentStep === 2 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink text-white font-semibold text-lg mb-4">
                  2
                </div>
                <h2 className="text-3xl font-semibold text-ink mb-3">US Presence</h2>
                <p className="text-slate-700 text-lg leading-relaxed">
                  Were you physically present in the United States at any time during the selected tax year?
                </p>
              </div>

              {usPresence === 'no' ? (
                <div className="bg-stone-100 border border-slate-300 p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-ink" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-ink mb-3">
                    You are not required to file Tax.
                  </h3>
                  <p className="text-slate-700 leading-relaxed mb-6">
                    Since you were not physically present in the United States during the tax year {taxYear}, 
                    you are not required to file Tax.
                  </p>
                  <button
                    onClick={() => setUsPresence(null)}
                    className="px-6 py-3 text-sm text-ink font-medium border border-ink hover:bg-ink hover:text-white transition-colors"
                  >
                    Change Answer
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <button
                      onClick={() => handleUsPresenceChange('yes')}
                      className={`px-12 py-6 text-base font-medium border transition-colors ${
                        usPresence === 'yes'
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleUsPresenceChange('no')}
                      className={`px-12 py-6 text-base font-medium border transition-colors ${
                        usPresence === 'no'
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  {usPresence === 'yes' && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="px-8 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink"
                      >
                        Continue →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Filing Status */}
          {currentStep === 3 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink text-white font-semibold text-lg mb-4">
                  3
                </div>
                <h2 className="text-3xl font-semibold text-ink mb-3">Filing Status</h2>
                <p className="text-slate-700 text-lg">What is your filing status for {taxYear}?</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                {['Single', 'Married Filing Jointly', 'Married Filing Separately', 'Head of Household'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilingStatus(status)
                      setTimeout(() => setCurrentStep(4), 300)
                    }}
                    className={`w-full px-6 py-4 text-left border transition-colors ${
                      filingStatus === status
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2 text-sm text-slate-600 hover:text-ink"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Visa Information */}
          {currentStep === 4 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink text-white font-semibold text-lg mb-4">
                  4
                </div>
                <h2 className="text-3xl font-semibold text-ink mb-3">Visa Information</h2>
                <p className="text-slate-700 text-lg">Tell us about your visa status.</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label htmlFor="visa-type" className="block text-sm font-semibold text-ink mb-3 uppercase tracking-wide">
                    Visa Type
                  </label>
                  <select
                    id="visa-type"
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink"
                  >
                    <option value="">Select visa type</option>
                    <option value="F-1">F-1 (Student)</option>
                    <option value="J-1">J-1 (Exchange Visitor)</option>
                    <option value="M-1">M-1 (Vocational Student)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="days-in-us" className="block text-sm font-semibold text-ink mb-3 uppercase tracking-wide">
                    Days in US during {taxYear}
                  </label>
                  <input
                    type="number"
                    id="days-in-us"
                    value={daysInUS}
                    onChange={(e) => setDaysInUS(e.target.value)}
                    min="0"
                    max="366"
                    placeholder="e.g., 365"
                    className="w-full px-4 py-3 border border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink"
                  />
                  <p className="text-xs text-slate-600 mt-2">Enter the number of days you were physically present in the US</p>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2 text-sm text-slate-600 hover:text-ink"
                >
                  ← Back
                </button>
                {visaType && daysInUS && (
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-8 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink"
                  >
                    Continue →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Income Sources */}
          {currentStep === 5 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink text-white font-semibold text-lg mb-4">
                  5
                </div>
                <h2 className="text-3xl font-semibold text-ink mb-3">Income Sources</h2>
                <p className="text-slate-700 text-lg">Do you have income from any of these sources?</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-white border border-slate-300 p-6">
                  <h3 className="font-semibold text-ink mb-4">W-2 Forms (Wages)</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setHasW2(true)}
                      className={`flex-1 px-6 py-3 border transition-colors ${
                        hasW2 === true
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setHasW2(false)}
                      className={`flex-1 px-6 py-3 border transition-colors ${
                        hasW2 === false
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-300 p-6">
                  <h3 className="font-semibold text-ink mb-4">1042-S Forms (Scholarships/Fellowships)</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setHas1042S(true)}
                      className={`flex-1 px-6 py-3 border transition-colors ${
                        has1042S === true
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setHas1042S(false)}
                      className={`flex-1 px-6 py-3 border transition-colors ${
                        has1042S === false
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-300 p-6">
                  <h3 className="font-semibold text-ink mb-4">Other Income (1099, Interest, Dividends, etc.)</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setHasOtherIncome(true)}
                      className={`flex-1 px-6 py-3 border transition-colors ${
                        hasOtherIncome === true
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setHasOtherIncome(false)}
                      className={`flex-1 px-6 py-3 border transition-colors ${
                        hasOtherIncome === false
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-ink border-slate-300 hover:bg-stone-50'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2 text-sm text-slate-600 hover:text-ink"
                >
                  ← Back
                </button>
                {hasW2 !== null && has1042S !== null && hasOtherIncome !== null && (
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-8 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink"
                  >
                    Continue →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 6: State */}
          {currentStep === 6 && (
            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ink text-white font-semibold text-lg mb-4">
                  6
                </div>
                <h2 className="text-3xl font-semibold text-ink mb-3">State of Residence</h2>
                <p className="text-slate-700 text-lg">Which state were you a resident of during {taxYear}?</p>
              </div>
              
              <div className="max-w-md mx-auto">
                <label htmlFor="state" className="block text-sm font-semibold text-ink mb-3 uppercase tracking-wide">
                  State
                </label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink"
                >
                  <option value="">Select state</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                  <option value="DC">District of Columbia</option>
                </select>
              </div>

              <div className="flex justify-center gap-4 pt-6">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2 text-sm text-slate-600 hover:text-ink"
                >
                  ← Back
                </button>
                {state && (
                  <button
                    onClick={handleComplete}
                    className="px-8 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink"
                  >
                    Complete →
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default Onboarding
