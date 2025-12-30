import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

function TaxTool() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-2">Tax Tools</h1>
          <p className="text-xl text-slate-700">
            Calculate your tax deductions and savings with our helpful tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Car Interest Deduction Calculator */}
          <Link
            to="/tax-tool/car-interest-deduction-calculator"
            className="bg-white border border-slate-300 p-6 rounded-lg hover:border-ink hover:shadow-lg transition-all"
          >
            <div className="mb-4">
              <div className="w-12 h-12 bg-ink/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-ink mb-2">Car Interest Deduction Calculator</h3>
              <p className="text-slate-600 text-sm">
                Calculate your vehicle loan interest deduction for eligible vehicles purchased in 2025.
              </p>
            </div>
            <div className="text-ink text-sm font-medium">
              Open Calculator →
            </div>
          </Link>

          {/* Placeholder for future tools */}
          <div className="bg-white border border-slate-200 p-6 rounded-lg opacity-50">
            <div className="mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-400 mb-2">More Tools Coming Soon</h3>
              <p className="text-slate-400 text-sm">
                We're working on additional tax calculation tools.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TaxTool

