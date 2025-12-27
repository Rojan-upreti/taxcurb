import React from 'react'
import Navbar from '../components/Navbar'

function Tutorial() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6">Tutorial</h1>
          <p className="text-xl text-slate-700 mb-12">Learn how to file your taxes with TaxCurb.</p>
          
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 1: Gather Your Documents</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Before you begin, make sure you have all your tax documents ready. You'll need:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>W-2 forms from your employer(s)</li>
                <li>1042-S forms for scholarship or fellowship income</li>
                <li>1099 forms (if applicable) for other income</li>
                <li>Your passport and visa information</li>
                <li>Previous year's tax return (if you filed one)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 2: Create an Account</h2>
              <p className="text-slate-700 leading-relaxed">
                Sign up for a free TaxCurb account. We'll securely store your information so you can access your 
                tax returns anytime.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 3: Answer Questions</h2>
              <p className="text-slate-700 leading-relaxed">
                We'll guide you through a series of simple questions about your residency status, income, and deductions. 
                Don't worry about tax jargon—we explain everything in plain language.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-ink mb-4">Step 4: Review and File</h2>
              <p className="text-slate-700 leading-relaxed">
                Review your completed forms carefully. Once you're satisfied, you can file directly with the IRS and 
                your state tax agency through our platform.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Tutorial

