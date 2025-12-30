import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

function Filing() {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (agreedToTerms) {
      navigate('/filing/profile')
    }
  }

  const requiredDocuments = [
    {
      name: 'Passport',
      description: 'Valid passport or government-issued ID',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    },
    {
      name: 'I-94',
      description: 'Arrival/Departure Record',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'All Income Slips (Including W-2)',
      description: 'W-2 forms, 1099 forms, and other income documents',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'SSN (Social Security Number)',
      description: 'Optional if no US income. Your Social Security Number or ITIN',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold text-ink mb-2">Tax Filing</h1>
          <p className="text-lg text-slate-700">
            Let's get started with your tax filing
          </p>
        </div>

        <div className="bg-white border border-slate-300 p-6 md:p-8 mb-8">
          {/* Required Documents Section */}
          <div className="mb-6">
            <div className="text-center mb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-ink mb-2">
                Required Documents
              </h2>
              <p className="text-slate-700 text-sm">
                Please make sure you have the following documents ready:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {requiredDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 border border-slate-200 bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ink/10 text-ink flex items-center justify-center">
                    <div className="w-4 h-4">
                      {doc.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink text-sm mb-0.5">{doc.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acknowledgment Section */}
          <div className="border-t border-slate-200 pt-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-stone-50 border border-slate-200 p-4 mb-4">
                <h3 className="font-semibold text-ink mb-2 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Important Acknowledgment
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  By proceeding, you acknowledge that you have all the required documents listed above 
                  and understand that accurate information is essential for proper tax filing.
                </p>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-4 h-4 text-ink border-slate-300 rounded focus:ring-ink focus:ring-2 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-700 font-medium text-sm group-hover:text-ink transition-colors">
                      I agree to the Terms and Conditions
                    </span>
                    <p className="text-xs text-slate-600 mt-1">
                      By checking this box, you confirm that you have read and agree to our terms of service 
                      and privacy policy.
                    </p>
                  </div>
                </label>
              </div>

              {/* Get Started Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGetStarted}
                  disabled={!agreedToTerms}
                  className={`px-8 py-3 text-sm font-medium transition-all ${
                    agreedToTerms
                      ? 'bg-ink text-white hover:bg-slate-800 border border-ink cursor-pointer'
                      : 'bg-slate-300 text-slate-500 border border-slate-300 cursor-not-allowed'
                  }`}
                >
                  Get Started →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Filing

