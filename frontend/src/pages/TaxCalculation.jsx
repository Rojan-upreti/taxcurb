import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilingProgress from '../components/FilingProgress'
import Breadcrumb from '../components/Breadcrumb'
import { calculateW2Tax } from '../services/w2TaxCalculationService'
import logger from '../utils/logger'

function TaxCalculation() {
  const navigate = useNavigate()
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
          <FilingProgress currentPage="tax-calculation" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <Breadcrumb />
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Tax Calculation</h1>
              <p className="text-sm text-slate-700">
                Your tax calculation based on W-2 information
              </p>
            </div>

            {/* Form Area with Rounded Square Border */}
            <div className="border-2 border-slate-300 rounded-xl p-6 bg-white">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink mx-auto mb-4"></div>
                  <p className="text-slate-600">Calculating your tax...</p>
                  <p className="text-sm text-slate-500 mt-2">Please wait while we process your information</p>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-2">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => navigate('/filing/income')}
                    className="mt-4 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                  >
                    Go Back to Income
                  </button>
                </div>
              ) : taxData ? (
                <div className="space-y-6">
                  {/* Breakdown Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-ink">Income Breakdown</h2>
                    <div className="bg-stone-50 border border-slate-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Total Wages (Box 1)</span>
                        <span className="text-sm font-medium text-ink">{formatCurrency(taxData.breakdown.totalWages)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Total State Tax (Box 17, Row 2)</span>
                        <span className="text-sm font-medium text-ink">{formatCurrency(taxData.breakdown.totalStateTax)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                        <span className="text-sm text-slate-700">Federal Tax Withheld (Box 2)</span>
                        <span className="text-sm font-medium text-ink">{formatCurrency(taxData.breakdown.totalFederalTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Taxable Income - Highlighted */}
                  <div className="bg-ink/5 border-2 border-ink rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">Taxable Income</p>
                      <p className="text-3xl font-bold text-ink">{formatCurrency(taxData.taxableIncome)}</p>
                      <p className="text-xs text-slate-500 mt-2">Total Wages - State Tax</p>
                    </div>
                  </div>

                  {/* Tax Calculation Details */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-800">Calculated Tax ({taxData.taxBracket})</span>
                      <span className="text-sm font-medium text-blue-900">{formatCurrency(taxData.breakdown.calculatedTax)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-800">Federal Tax Withheld</span>
                      <span className="text-sm font-medium text-blue-900">- {formatCurrency(taxData.breakdown.totalFederalTax)}</span>
                    </div>
                  </div>

                  {/* Tax Owed - Highlighted */}
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                    <div className="text-center">
                      <p className="text-sm text-red-700 mb-2">Tax Owed</p>
                      <p className="text-3xl font-bold text-red-600">{formatCurrency(taxData.taxOwed)}</p>
                      <p className="text-xs text-red-600 mt-2">Calculated Tax - Federal Tax Withheld</p>
                      <p className="text-xs text-red-500 mt-1">Tax Bracket: {taxData.taxBracket} ({taxData.bracketRange})</p>
                    </div>
                  </div>

                  {/* Tax Bracket Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> Tax is calculated using progressive tax brackets (2025 rates). 
                      Your taxable income falls in the {taxData.taxBracket} bracket ({taxData.bracketRange}).
                    </p>
                  </div>

                  {/* Continue Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => navigate('/filing/tax-calculation/summary')}
                      className="px-6 py-2 text-xs font-medium transition-all border-2 rounded-full bg-ink text-white hover:bg-slate-800 border-ink cursor-pointer"
                    >
                      Continue →
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

export default TaxCalculation

