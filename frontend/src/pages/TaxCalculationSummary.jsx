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
                  {/* Net Amount Section - Highlighted (Top) */}
                  <div className={`border-2 rounded-lg p-6 ${taxData.netAmount < 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                    <div className="text-center space-y-2">
                      <p className={`text-sm mb-1 ${taxData.netAmount < 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {taxData.netAmount < 0 ? 'Net Refund' : 'Net Amount to Pay'}
                      </p>
                      <p className={`text-4xl font-bold ${taxData.netAmount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(taxData.netAmount))}
                      </p>
                      <div className="pt-3 border-t border-slate-200">
                        <p className={`text-xs mt-2 ${taxData.netAmount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Tax Owed - FICA Refund = Net Amount
                        </p>
                        <p className={`text-xs mt-1 ${taxData.netAmount < 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(taxData.taxOwed)} - {formatCurrency(taxData.ficaBreakdown?.ficaRefund || 0)} = {formatCurrency(taxData.netAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Income Summary Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-ink">Income Summary</h2>
                    <div className="bg-stone-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Total Wages, Tips, Other Compensation</span>
                        <span className="text-sm font-semibold text-ink">{formatCurrency(taxData.breakdown?.totalWages)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                        <span className="text-sm text-slate-700">Less: Total State Income Tax (Box 17, Row 2)</span>
                        <span className="text-sm font-semibold text-ink">{formatCurrency(taxData.breakdown?.totalStateTax)}</span>
                      </div>
                      {taxData.breakdown?.saltCapApplied && taxData.breakdown?.stateTaxDeduction !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-amber-700">Less: State Tax Deduction (Capped at $10,000 per IRS SALT limit)</span>
                          <span className="text-xs font-semibold text-amber-700">- {formatCurrency(taxData.breakdown.stateTaxDeduction)}</span>
                        </div>
                      )}
                      {!taxData.breakdown?.saltCapApplied && taxData.breakdown?.stateTaxDeduction !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Less: State Tax Deduction</span>
                          <span className="text-xs font-medium text-slate-600">- {formatCurrency(taxData.breakdown.stateTaxDeduction)}</span>
                        </div>
                      )}
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
                        <span className="text-sm font-bold text-blue-900">{formatCurrency(taxData.breakdown?.calculatedTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tax Withheld Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-ink">Tax Withheld</h2>
                    <div className="bg-stone-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Federal Income Tax Withheld (Box 2)</span>
                        <span className="text-sm font-semibold text-ink">{formatCurrency(taxData.breakdown?.totalFederalTax)}</span>
                      </div>
                    </div>
                  </div>

                  {/* FICA Refund Section */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-ink">FICA Refund</h2>
                    <div className="bg-stone-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">Total FICA Paid (Box 4 + Box 6)</span>
                        <span className="text-sm font-semibold text-ink">{formatCurrency(taxData.ficaBreakdown?.totalFICA)}</span>
                      </div>
                      {taxData.ficaBreakdown?.dateEnteredUS && (
                        <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                          <span className="text-sm text-slate-700">Date Entered US (I-94)</span>
                          <span className="text-sm font-medium text-ink">
                            {new Date(taxData.ficaBreakdown.dateEnteredUS).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                        <span className="text-sm text-slate-700">Years Since Entry (to Dec 31, 2025)</span>
                        <span className="text-sm font-medium text-ink">
                          {taxData.ficaBreakdown?.yearsSinceEntry !== null && taxData.ficaBreakdown?.yearsSinceEntry !== undefined
                            ? taxData.ficaBreakdown.yearsSinceEntry
                            : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                        <span className="text-sm text-slate-700">Eligible for FICA Refund</span>
                        <span className={`text-sm font-semibold ${taxData.ficaBreakdown?.eligibleForRefund ? 'text-green-600' : 'text-red-600'}`}>
                          {taxData.ficaBreakdown?.eligibleForRefund ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {taxData.ficaBreakdown?.eligibleForRefund ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                          <p className="text-xs text-green-800">
                            <strong>Eligible:</strong> You entered the US {taxData.ficaBreakdown.yearsSinceEntry} year{taxData.ficaBreakdown.yearsSinceEntry !== 1 ? 's' : ''} ago (5 years or less from tax year end). You are eligible for a FICA refund.
                          </p>
                        </div>
                      ) : taxData.ficaBreakdown?.yearsSinceEntry !== null && taxData.ficaBreakdown?.yearsSinceEntry !== undefined ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                          <p className="text-xs text-amber-800">
                            <strong>Not Eligible:</strong> You entered the US {taxData.ficaBreakdown.yearsSinceEntry} year{taxData.ficaBreakdown.yearsSinceEntry !== 1 ? 's' : ''} ago (more than 5 years from tax year end). FICA refund is not available.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                          <p className="text-xs text-amber-800">
                            <strong>Not Eligible:</strong> I-94 entry date not found. Please complete the visa status section.
                          </p>
                        </div>
                      )}
                      {taxData.ficaBreakdown?.ficaRefund > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t-2 border-green-300">
                          <span className="text-sm font-semibold text-green-700">FICA Refund Amount</span>
                          <span className="text-sm font-bold text-green-600">{formatCurrency(taxData.ficaBreakdown.ficaRefund)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Information Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> This calculation is based on 2025 tax brackets. 
                      Net amount represents the final amount you may need to pay (if positive) or receive as a refund (if negative) 
                      after accounting for federal income tax withheld and FICA refund (if eligible).
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

