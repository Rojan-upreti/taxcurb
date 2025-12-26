import React from 'react'
import { Link } from 'react-router-dom'

function LoginPage() {
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
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-6">Login</h1>
          <p className="text-xl text-slate-700 mb-8 leading-relaxed">
            Sign in to access your tax returns and continue where you left off.
          </p>
          <div className="bg-white border border-slate-300 p-8 rounded-lg">
            <p className="text-slate-600">Login form will be implemented here.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage

