import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logger from '../utils/logger'

function Navbar() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/auth', { replace: true })
    } catch (error) {
      logger.error('Logout error:', error)
    }
  }

  return (
    <header className="sticky top-0 bg-stone-50 border-b border-slate-300 z-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-semibold text-ink tracking-tight hover:text-slate-700">TaxCurb</Link>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-slate-700 hover:text-ink">Home</Link>
              <Link to="/about" className="text-sm text-slate-700 hover:text-ink">About</Link>
              <Link to="/tax-tool" className="text-sm text-slate-700 hover:text-ink">Tax Tools</Link>
            </div>
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600 hidden md:block">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-ink font-medium border border-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/auth#signup" 
                className="text-sm text-ink font-medium border border-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors rounded"
              >
                Get Started
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar

