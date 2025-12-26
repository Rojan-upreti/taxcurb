import React from 'react'
import { Link } from 'react-router-dom'

function TutorialPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 bg-stone-50 border-b border-slate-300 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <nav className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-semibold text-ink tracking-tight hover:text-slate-700">TaxCurb</Link>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm text-slate-700 hover:text-ink">Home</Link>
                <Link to="/about" className="text-sm text-slate-700 hover:text-ink">About</Link>
                <Link to="/tutorial" className="text-sm text-slate-700 hover:text-ink">Tutorial</Link>
              </div>
              <Link to="/start" className="text-sm text-ink font-medium border border-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors">Start filing</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6">Tutorial</h1>
          <p className="text-xl text-slate-700 mb-12 leading-relaxed">
            Learn how to file your taxes as an F-1 student with our step-by-step guide.
          </p>
          
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 1: Gather Your Documents</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Before you begin, make sure you have all your tax documents ready:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>W-2 forms from any on-campus employment</li>
                <li>1042-S forms for scholarships, fellowships, or other income</li>
                <li>1099 forms (if applicable) for interest, dividends, or other income</li>
                <li>Your passport and I-20 form</li>
                <li>Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 2: Determine Your Residency Status</h2>
              <p className="text-slate-700 leading-relaxed">
                As an F-1 student, you're typically considered a non-resident alien for tax purposes. This means you'll file Form 1040-NR instead of the standard 1040 form. TaxCurb will help you determine your correct filing status.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 3: Complete Your Tax Forms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                TaxCurb will guide you through completing:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Form 1040-NR:</strong> Your main tax return as a non-resident alien</li>
                <li><strong>Form 8843:</strong> Required even if you had no income, to claim exemption from the substantial presence test</li>
                <li><strong>State tax forms:</strong> If required by your state of residence</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 4: Review and File</h2>
              <p className="text-slate-700 leading-relaxed">
                Once you've completed all the forms, review them carefully. TaxCurb will help you file electronically with the IRS and your state tax agency. Make sure to file by the deadline (typically April 15th).
              </p>
            </div>

            <div className="bg-slate-100 border border-slate-300 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-ink mb-2">Need Help?</h3>
              <p className="text-slate-700">
                If you have questions or need assistance, our platform provides clear explanations for each step. Remember, even if you had no income, you may still need to file Form 8843.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TutorialPage

