import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from './components/Navbar'

function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main>
          <section className="min-h-screen flex items-center border-b border-slate-300">
            <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
              <div className="max-w-4xl">
                <div className="mb-6">
                  <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">For F1 Students</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-semibold text-ink mb-8 leading-tight tracking-tight">
                  File U.S. taxes without the confusion
                </h2>
                <p className="text-xl md:text-2xl text-slate-700 mb-10 leading-relaxed max-w-2xl font-light">
                  Accurate, compliant tax filing designed specifically for international students For Free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/auth#signup"
                    className="inline-block px-8 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink text-center"
                  >
                    Start Filing
                  </Link>
                  <Link
                    to="/auth#login"
                    className="inline-block px-8 py-4 bg-white text-ink text-sm font-medium hover:bg-stone-100 transition-colors border border-slate-300 text-center"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="min-h-screen flex items-center border-b border-slate-300">
            <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
              <div className="grid md:grid-cols-2 gap-20 md:gap-32">
                <div>
                  <h3 className="text-3xl font-semibold text-ink mb-12">Who this is for</h3>
                  <ul className="space-y-8">
                    <li>
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-ink uppercase tracking-wide">F-1 Students</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        TaxCurb is designed specifically for international students studying in the United States on F-1 visas. 
                        Whether you're an undergraduate, graduate, or doctoral student, we help you navigate the complex 
                        U.S. tax filing requirements for non-resident aliens. Our platform understands the unique tax 
                        situations of international students, including income from on-campus employment, scholarships, 
                        fellowships, and other U.S. source income. We guide you through filing the correct forms, including 
                        1040-NR and 8843, ensuring compliance with IRS regulations while maximizing your tax benefits.
                      </p>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-3xl font-semibold text-ink mb-12">What we handle</h3>
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wide">Federal Forms</h4>
                      <ul className="space-y-3 text-slate-700">
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">1040-NR</span>
                          <span className="text-sm">U.S. Nonresident Alien Income Tax Return</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">8843</span>
                          <span className="text-sm">Statement for Exempt Individuals</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wide">Income Types</h4>
                      <ul className="space-y-3 text-slate-700">
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">W-2</span>
                          <span className="text-sm">Wage and Tax Statement</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">1042-S</span>
                          <span className="text-sm">Foreign Person's U.S. Source Income</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">1099-DIV</span>
                          <span className="text-sm">Dividend Income</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">1099-INT</span>
                          <span className="text-sm">Interest Income</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">W-2G</span>
                          <span className="text-sm">Gambling Winnings</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-ink font-medium">1099-MISC / 1099-NEC</span>
                          <span className="text-sm">Other Income (Honoraria, Prizes, One-time Payments)</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wide">State Returns</h4>
                      <p className="text-slate-700 text-sm">All states except Puerto Rico</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="min-h-screen flex items-center border-b border-slate-300">
            <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
              <div className="max-w-4xl">
                <h3 className="text-3xl font-semibold text-ink mb-16">How it works</h3>
                <div className="space-y-16">
                  <div className="flex gap-12">
                    <div className="flex-shrink-0 w-12 text-ink font-semibold text-2xl">01</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-ink mb-3">Gather your documents</h4>
                      <p className="text-slate-700 leading-relaxed text-lg">Collect your W-2, 1042-S, and other tax documents. We guide you through what you need.</p>
                    </div>
                  </div>
                  <div className="flex gap-12">
                    <div className="flex-shrink-0 w-12 text-ink font-semibold text-2xl">02</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-ink mb-3">Answer questions</h4>
                      <p className="text-slate-700 leading-relaxed text-lg">We ask clear questions about your residency status, income, and deductions. No tax jargon.</p>
                    </div>
                  </div>
                  <div className="flex gap-12">
                    <div className="flex-shrink-0 w-12 text-ink font-semibold text-2xl">03</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-ink mb-3">Review and file</h4>
                      <p className="text-slate-700 leading-relaxed text-lg">Review your completed forms, then file directly with the IRS and your state tax agency.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="min-h-screen flex items-center border-b border-slate-300">
            <div className="max-w-6xl mx-auto px-4 md:px-8 w-full">
              <div className="space-y-16">
                <div className="grid md:grid-cols-3 gap-16 md:gap-20">
                  <div>
                    <h4 className="text-xl font-semibold text-ink mb-4">Transparency</h4>
                    <p className="text-slate-700 leading-relaxed">Clear explanations of every form and field. No hidden fees or surprise charges.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-ink mb-4">Lower cost</h4>
                    <p className="text-slate-700 leading-relaxed">Affordable pricing designed for students and workers, not expensive tax preparation services.</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-ink mb-4">Non-resident focused</h4>
                    <p className="text-slate-700 leading-relaxed">Built specifically for non-resident aliens, not adapted from generic U.S. tax software.</p>
                  </div>
                </div>
                <div className="max-w-4xl">
                  <h3 className="text-3xl font-semibold text-ink mb-8">Trust and compliance</h3>
                  <div className="space-y-6 text-slate-700 leading-relaxed text-lg">
                    <p>
                      TaxCurb is built with IRS rules for non-resident aliens in mind. We help you understand your filing requirements and complete the correct forms accurately.
                    </p>
                    <p>
                      Our forms are designed to comply with current IRS regulations for non-resident alien tax filing, including 1040-NR and 8843 requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="min-h-screen flex flex-col justify-between border-b border-slate-300">
            <div className="max-w-6xl mx-auto px-4 md:px-8 w-full flex-1 flex items-center">
              <div className="max-w-3xl w-full">
                <h3 className="text-4xl font-semibold text-ink mb-6">Ready to file?</h3>
                <p className="text-xl text-slate-700 mb-10 leading-relaxed">
                  Check if you need to file and get started with your tax return.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/auth#login"
                    className="inline-block px-8 py-4 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth#signup"
                    className="inline-block px-8 py-4 bg-white text-ink text-sm font-medium hover:bg-stone-100 transition-colors border border-slate-300 text-center"
                  >
                    Start filing
                  </Link>
                </div>
              </div>
            </div>
            <footer className="w-full py-12 border-t border-slate-300 bg-slate-100">
              <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="text-sm text-slate-600">
                  <p className="mb-2 font-medium text-ink">TaxCurb</p>
                  <p className="text-xs text-slate-500">Built with IRS rules for non-resident aliens in mind.</p>
                </div>
                <nav className="flex flex-wrap gap-6 text-sm">
                  <Link to="/" className="text-slate-700 hover:text-ink">Home</Link>
                  <Link to="/about" className="text-slate-700 hover:text-ink">About</Link>
                  <Link to="/tutorial" className="text-slate-700 hover:text-ink">Tutorial</Link>
                  <Link to="/check" className="text-slate-700 hover:text-ink">Check if you need to file</Link>
                  <Link to="/auth#signup" className="text-slate-700 hover:text-ink">Start filing</Link>
                </nav>
                </div>
              </div>
            </footer>
          </section>

      </main>
    </div>
  )
}

export default LandingPage
