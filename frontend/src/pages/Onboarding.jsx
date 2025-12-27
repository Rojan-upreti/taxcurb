import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

function Onboarding() {
  const { currentUser } = useAuth()
  
  // Questionnaire state
  const [taxYear, setTaxYear] = useState('2025')
  const [usPresence, setUsPresence] = useState(null) // null, 'yes', or 'no'
  const [currentStep, setCurrentStep] = useState(1) // 1 or 2

  const steps = [
    { id: 1, title: 'Tax Year', completed: !!taxYear },
    { id: 2, title: 'US Presence', completed: usPresence !== null },
  ]

  const handleUsPresenceChange = (value) => {
    setUsPresence(value)
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
                // Stop flow message
                <div className="bg-stone-100 border border-slate-300 p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <svg className="w-12 h-12 text-ink" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-ink mb-3">
                    You are not required to file Tax.
                  </h3>
                  <p className="text-slate-700 leading-relaxed">
                    Since you were not physically present in the United States during the tax year {taxYear}, 
                    you are not required to file Tax.
                  </p>
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

                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default Onboarding
