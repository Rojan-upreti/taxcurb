import React from 'react'
import { Link } from 'react-router-dom'

function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6">About TaxCurb</h1>
          <div className="space-y-8 text-slate-700 leading-relaxed">
            <p className="text-xl">
              TaxCurb is a tax filing platform designed specifically for F-1 international students studying in the United States.
            </p>
            <div>
              <h2 className="text-2xl font-semibold text-ink mb-4">Our Mission</h2>
              <p>
                We believe that filing taxes shouldn't be confusing or expensive, especially for international students who are already navigating a complex system. Our mission is to provide accurate, compliant, and free tax filing services tailored specifically for non-resident aliens.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-ink mb-4">Why TaxCurb?</h2>
              <p>
                Traditional tax software is built for U.S. residents and often doesn't properly handle the unique tax situations of F-1 students. TaxCurb is built from the ground up with IRS rules for non-resident aliens in mind, ensuring you file the correct forms and maximize your tax benefits.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-ink mb-4">Transparency & Trust</h2>
              <p>
                We're committed to transparency in everything we do. No hidden fees, no surprise charges. We explain every form and field clearly, so you understand what you're filing and why.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AboutPage

