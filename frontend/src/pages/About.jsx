import React from 'react'
import { Link } from 'react-router-dom'

function About() {
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
              <Link to="/auth#signup" className="text-sm text-ink font-medium border border-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors">Get Started</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6">About TaxCurb</h1>
          <div className="space-y-8 text-slate-700 leading-relaxed text-lg">
            <p>
              TaxCurb is a tax filing platform designed specifically for F-1 international students studying in the United States. 
              We understand the unique challenges that non-resident aliens face when navigating the U.S. tax system.
            </p>
            <p>
              Our mission is to make tax filing simple, accurate, and accessible for international students. We guide you through 
              the process of filing the correct forms, including 1040-NR and 8843, ensuring compliance with IRS regulations while 
              maximizing your tax benefits.
            </p>
            <p>
              TaxCurb is built with transparency, affordability, and compliance in mind. We believe that filing your taxes shouldn't 
              be complicated or expensive, especially for students who are already managing the challenges of studying abroad.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default About

