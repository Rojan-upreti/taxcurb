import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { getOnboardingData } from '../services/onboardingService'
import { calculateTax, getMockIncomeData } from '../services/taxCalculationService'

function Dashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  const [taxData, setTaxData] = useState(null)
  const [onboardingData, setOnboardingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (currentUser) {
      // Get onboarding data to determine tax year and other info
      const taxYear = '2024' // Default, could be from onboarding
      const saved = getOnboardingData(currentUser.uid, taxYear)
      
      if (saved) {
        setOnboardingData(saved)
        
        // Get mock income data (will be replaced with real documents in Phase 2)
        const mockIncome = getMockIncomeData()
        
        // Calculate tax based on onboarding answers and income
        const calculated = calculateTax({
          taxYear: saved.taxYear || taxYear,
          filingStatus: saved.answers?.filingStatus || 'Single',
          income: {
            w2Income: mockIncome.w2Income,
            income1042S: mockIncome.income1042S,
            otherIncome: mockIncome.otherIncome,
          },
          deductions: 0, // Will be calculated from itemized deductions later
          state: saved.answers?.state || null,
          w2Withholdings: mockIncome.w2Withholdings,
          otherWithholdings: mockIncome.otherWithholdings,
        })
        
        setTaxData(calculated)
      } else {
        // If no onboarding data, use default calculations with mock data
        const mockIncome = getMockIncomeData()
        const calculated = calculateTax({
          taxYear: '2024',
          filingStatus: 'Single',
          income: {
            w2Income: mockIncome.w2Income,
            income1042S: mockIncome.income1042S,
            otherIncome: mockIncome.otherIncome,
          },
          deductions: 0,
          state: null,
          w2Withholdings: mockIncome.w2Withholdings,
          otherWithholdings: mockIncome.otherWithholdings,
        })
        setTaxData(calculated)
      }
      
      setIsLoading(false)
    }
  }, [currentUser])

  if (isLoading || !taxData) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tax data...</p>
        </div>
      </div>
    )
  }

  // Extract data for display
  const displayData = {
    taxYear: taxData.taxYear,
    totalIncome: taxData.income.totalIncome,
    federalTaxOwed: taxData.federalTax,
    stateTaxOwed: taxData.stateTax,
    totalTaxOwed: taxData.totalTaxOwed,
    refund: taxData.refund,
    amountOwed: taxData.amountOwed,
    filingStatus: taxData.filingStatus,
    w2Count: taxData.income.w2Income > 0 ? 1 : 0,
    income1042SCount: taxData.income.income1042S > 0 ? 1 : 0,
    lastUpdated: new Date().toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-2">Dashboard</h1>
          <p className="text-xl text-slate-700">
            Welcome back{currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}!
          </p>
        </div>

        {/* Tax Year Summary */}
        <div className="bg-white border border-slate-300 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-ink">Tax Year {displayData.taxYear}</h2>
            <span className="text-sm text-slate-600">Last updated: {displayData.lastUpdated}</span>
          </div>
          <p className="text-slate-700">Filing Status: <span className="font-semibold text-ink">{displayData.filingStatus}</span></p>
          {onboardingData?.answers?.state && (
            <p className="text-slate-700 mt-2">State: <span className="font-semibold text-ink">{onboardingData.answers.state}</span></p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-white border border-slate-300 p-6">
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">Total Income</p>
            </div>
            <p className="text-3xl font-semibold text-ink">{formatCurrency(displayData.totalIncome)}</p>
          </div>

          {/* Federal Tax Owed */}
          <div className="bg-white border border-slate-300 p-6">
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">Federal Tax</p>
            </div>
            <p className="text-3xl font-semibold text-ink">{formatCurrency(displayData.federalTaxOwed)}</p>
          </div>

          {/* State Tax Owed */}
          <div className="bg-white border border-slate-300 p-6">
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">State Tax</p>
            </div>
            <p className="text-3xl font-semibold text-ink">{formatCurrency(displayData.stateTaxOwed)}</p>
          </div>

          {/* Refund or Amount Owed */}
          <div className={`bg-white border border-slate-300 p-6 ${displayData.refund > 0 ? 'border-green-500' : displayData.amountOwed > 0 ? 'border-red-500' : ''}`}>
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">
                {displayData.refund > 0 ? 'Refund' : displayData.amountOwed > 0 ? 'Amount Owed' : 'Balance'}
              </p>
            </div>
            <p className={`text-3xl font-semibold ${displayData.refund > 0 ? 'text-green-600' : displayData.amountOwed > 0 ? 'text-red-600' : 'text-ink'}`}>
              {displayData.refund > 0 
                ? formatCurrency(displayData.refund) 
                : displayData.amountOwed > 0 
                ? formatCurrency(displayData.amountOwed)
                : formatCurrency(0)}
            </p>
          </div>
        </div>

        {/* Income Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Income Sources */}
          <div className="bg-white border border-slate-300 p-6">
            <h3 className="text-xl font-semibold text-ink mb-6">Income Sources</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <p className="font-semibold text-ink">W-2 Forms</p>
                  <p className="text-sm text-slate-600">{displayData.w2Count} document{displayData.w2Count !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-lg font-semibold text-ink">{formatCurrency(taxData.income.w2Income)}</p>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <p className="font-semibold text-ink">1042-S Forms</p>
                  <p className="text-sm text-slate-600">{displayData.income1042SCount} document{displayData.income1042SCount !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-lg font-semibold text-ink">{formatCurrency(taxData.income.income1042S)}</p>
              </div>
              {taxData.income.otherIncome > 0 && (
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <p className="font-semibold text-ink">Other Income</p>
                    <p className="text-sm text-slate-600">1099, Interest, etc.</p>
                  </div>
                  <p className="text-lg font-semibold text-ink">{formatCurrency(taxData.income.otherIncome)}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <p className="font-semibold text-ink">Total</p>
                <p className="text-xl font-semibold text-ink">{formatCurrency(displayData.totalIncome)}</p>
              </div>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="bg-white border border-slate-300 p-6">
            <h3 className="text-xl font-semibold text-ink mb-6">Tax Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <p className="text-slate-700">Federal Income Tax</p>
                <p className="font-semibold text-ink">{formatCurrency(displayData.federalTaxOwed)}</p>
              </div>
              {displayData.stateTaxOwed > 0 && (
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <p className="text-slate-700">State Income Tax</p>
                  <p className="font-semibold text-ink">{formatCurrency(displayData.stateTaxOwed)}</p>
                </div>
              )}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <p className="text-slate-700">Total Withholdings</p>
                <p className="font-semibold text-ink">{formatCurrency(taxData.withholdings.total)}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="font-semibold text-ink text-lg">Total Tax Owed</p>
                <p className="text-xl font-semibold text-ink">{formatCurrency(displayData.totalTaxOwed)}</p>
              </div>
              {(displayData.refund > 0 || displayData.amountOwed > 0) && (
                <div className={`flex items-center justify-between pt-4 mt-4 border-t-2 ${displayData.refund > 0 ? 'border-green-500' : 'border-red-500'}`}>
                  <p className={`font-semibold text-lg ${displayData.refund > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {displayData.refund > 0 ? 'Refund' : 'Amount Owed'}
                  </p>
                  <p className={`text-xl font-semibold ${displayData.refund > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {displayData.refund > 0 
                      ? formatCurrency(displayData.refund) 
                      : formatCurrency(displayData.amountOwed)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Summary */}
        <div className="bg-white border border-slate-300 p-6 mb-8">
          <h3 className="text-xl font-semibold text-ink mb-6">Documents Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wide mb-2">W-2 Forms</p>
              <p className="text-2xl font-semibold text-ink">{displayData.w2Count}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wide mb-2">1042-S Forms</p>
              <p className="text-2xl font-semibold text-ink">{displayData.income1042SCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wide mb-2">Total Documents</p>
              <p className="text-2xl font-semibold text-ink">{displayData.w2Count + displayData.income1042SCount}</p>
            </div>
          </div>
        </div>

        {/* Start Filing Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={() => navigate('/onboarding')}
            className="px-12 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink"
          >
            Start Filing
          </button>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
