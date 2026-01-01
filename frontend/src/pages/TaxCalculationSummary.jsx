import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilingProgress from '../components/FilingProgress'
import Breadcrumb from '../components/Breadcrumb'
import { calculateW2Tax } from '../services/w2TaxCalculationService'
import logger from '../utils/logger'

function TaxCalculationSummary() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [taxData, setTaxData] = useState(null)

  // Get completed pages from localStorage
  const getCompletedPages = () => {
    const pages = ['profile', 'residency', 'visa_status', 'identity&Traveldocument', 'program&USpresence', 'prior_visa_history', 'address', 'income']
    const completed = []
    
    pages.forEach(page => {
      const key = page === 'identity&Traveldocument' ? 'filing_identity_travel' :
                  page === 'program&USpresence' ? 'filing_program_presence' :
                  page === 'prior_visa_history' ? 'filing_prior_visa_history' :
                  `filing_${page}`
      if (localStorage.getItem(key)) {
        completed.push(page)
      }
    })
    
    return completed
  }

  useEffect(() => {
    const performCalculation = async () => {
      setLoading(true)
      setError('')
      setTaxData(null)

      try {
        const result = await calculateW2Tax()
        setTaxData(result)
      } catch (err) {
        logger.error('Tax calculation error:', err)
        setError(err.message || 'Failed to calculate tax. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    performCalculation()
  }, [])

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const completedPages = getCompletedPages()

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
          <FilingProgress currentPage="tax-calculation-summary" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <Breadcrumb />
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Tax Calculation Summary</h1>
              <p className="text-sm text-slate-700">
                Complete breakdown of your tax calculation
              </p>
            </div>

            {/* Form Area with Rounded Square Border */}
            <div className="border-2 border-slate-300 rounded-xl p-6 bg-white">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading tax calculation...</p>
                  <p className="text-sm text-slate-500 mt-2">Please wait while we retrieve your information</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => navigate('/filing/tax-calculation')}
                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              ) : taxData ? (
                <div className="space-y-6">
                  {/* Income Summary Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-ink">Income Summary</h2>
                    <div className="bg-stone-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Total Wages, Tips, Other Compensation</span>
                        <span className="text-sm font-semibold text-ink">{formatCurrency(taxData.breakdown.totalWages)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                        <span className="text-sm text-slate-700">Less: Total State Income Tax (Box 17, Row 2)</span>
                        <span className="text-sm font-semibold text-ink">- {formatCurrency(taxData.breakdown.totalStateTax)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t-2 border-ink">
                        <span className="text-base font-semibold text-ink">Taxable Income</span>
                        <span className="text-base font-bold text-ink">{formatCurrency(taxData.taxableIncome)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Calculation Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-ink">Tax Calculation</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">Tax Bracket</span>
                        <span className="text-sm font-semibold text-blue-900">{taxData.taxBracket}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">Bracket Range</span>
                        <span className="text-sm font-medium text-blue-900">{taxData.bracketRange}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                        <span className="text-sm font-semibold text-blue-900">Calculated Tax ({taxData.taxBracket} of Taxable Income)</span>
                        <span className="text-sm font-bold text-blue-900">{formatCurrency(taxData.breakdown.calculatedTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Withheld Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-ink">Tax Withheld</h2>
                    <div className="bg-stone-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Federal Income Tax Withheld (Box 2)</span>
                        <span className="text-sm font-semibold text-ink">{formatCurrency(taxData.breakdown.totalFederalTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Final Tax Owed Section - Highlighted */}
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-red-700 mb-1">Final Tax Owed</p>
                      <p className="text-4xl font-bold text-red-600">{formatCurrency(taxData.taxOwed)}</p>
                      <div className="pt-3 border-t border-red-200">
                        <p className="text-xs text-red-600 mt-2">
                          Calculated Tax - Federal Tax Withheld
                        </p>
                        <p className="text-xs text-red-500 mt-1">
                          {formatCurrency(taxData.breakdown.calculatedTax)} - {formatCurrency(taxData.breakdown.totalFederalTax)} = {formatCurrency(taxData.taxOwed)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Information Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> This calculation is based on 2025 tax brackets. 
                      Tax owed represents the amount you may need to pay (if positive) or receive as a refund (if negative) 
                      after accounting for federal income tax already withheld.
                    </p>
                  </div>

                  {/* Continue Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => navigate('/filing/review')}
                      className="px-6 py-2 text-xs font-medium transition-all border-2 rounded-full bg-ink text-white hover:bg-slate-800 border-ink cursor-pointer"
                    >
                      Continue to Review →
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default TaxCalculationSummary

