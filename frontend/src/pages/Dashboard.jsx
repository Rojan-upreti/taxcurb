import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'

function Dashboard() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // Mock data
  const mockData = {
    taxYear: '2024',
    totalIncome: 28500,
    federalTaxOwed: 1250,
    stateTaxOwed: 320,
    totalTaxOwed: 1570,
    refund: 0,
    filingStatus: 'Single',
    w2Count: 1,
    income1042SCount: 2,
    lastUpdated: '2024-01-15'
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
            <h2 className="text-2xl font-semibold text-ink">Tax Year {mockData.taxYear}</h2>
            <span className="text-sm text-slate-600">Last updated: {mockData.lastUpdated}</span>
          </div>
          <p className="text-slate-700">Filing Status: <span className="font-semibold text-ink">{mockData.filingStatus}</span></p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Income */}
          <div className="bg-white border border-slate-300 p-6">
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">Total Income</p>
            </div>
            <p className="text-3xl font-semibold text-ink">{formatCurrency(mockData.totalIncome)}</p>
          </div>

          {/* Federal Tax Owed */}
          <div className="bg-white border border-slate-300 p-6">
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">Federal Tax</p>
            </div>
            <p className="text-3xl font-semibold text-ink">{formatCurrency(mockData.federalTaxOwed)}</p>
          </div>

          {/* State Tax Owed */}
          <div className="bg-white border border-slate-300 p-6">
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">State Tax</p>
            </div>
            <p className="text-3xl font-semibold text-ink">{formatCurrency(mockData.stateTaxOwed)}</p>
          </div>

          {/* Total Tax Owed */}
          <div className="bg-white border border-slate-300 p-6">
            <div className="mb-2">
              <p className="text-sm text-slate-600 uppercase tracking-wide">Total Tax Owed</p>
            </div>
            <p className="text-3xl font-semibold text-ink">{formatCurrency(mockData.totalTaxOwed)}</p>
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
                  <p className="text-sm text-slate-600">{mockData.w2Count} document{mockData.w2Count !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-lg font-semibold text-ink">{formatCurrency(18500)}</p>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <p className="font-semibold text-ink">1042-S Forms</p>
                  <p className="text-sm text-slate-600">{mockData.income1042SCount} document{mockData.income1042SCount !== 1 ? 's' : ''}</p>
                </div>
                <p className="text-lg font-semibold text-ink">{formatCurrency(10000)}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="font-semibold text-ink">Total</p>
                <p className="text-xl font-semibold text-ink">{formatCurrency(mockData.totalIncome)}</p>
              </div>
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="bg-white border border-slate-300 p-6">
            <h3 className="text-xl font-semibold text-ink mb-6">Tax Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <p className="text-slate-700">Federal Income Tax</p>
                <p className="font-semibold text-ink">{formatCurrency(mockData.federalTaxOwed)}</p>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <p className="text-slate-700">State Income Tax</p>
                <p className="font-semibold text-ink">{formatCurrency(mockData.stateTaxOwed)}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="font-semibold text-ink text-lg">Total Tax Owed</p>
                <p className="text-xl font-semibold text-ink">{formatCurrency(mockData.totalTaxOwed)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Summary */}
        <div className="bg-white border border-slate-300 p-6 mb-8">
          <h3 className="text-xl font-semibold text-ink mb-6">Documents Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wide mb-2">W-2 Forms</p>
              <p className="text-2xl font-semibold text-ink">{mockData.w2Count}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wide mb-2">1042-S Forms</p>
              <p className="text-2xl font-semibold text-ink">{mockData.income1042SCount}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 uppercase tracking-wide mb-2">Total Documents</p>
              <p className="text-2xl font-semibold text-ink">{mockData.w2Count + mockData.income1042SCount}</p>
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
