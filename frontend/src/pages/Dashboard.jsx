import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Dashboard() {
  const { currentUser, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/auth', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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
              <div className="flex items-center gap-4">
                {currentUser && (
                  <span className="text-sm text-slate-600 hidden md:block">
                    {currentUser.email}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm text-ink font-medium border border-ink px-4 py-2 hover:bg-ink hover:text-white transition-colors rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-2">Dashboard</h1>
            <p className="text-xl text-slate-700">
              Welcome back{currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}!
            </p>
          </div>
          <div className="bg-white border border-slate-300 p-8 rounded-lg">
            <p className="text-slate-600">Tax filing form will be implemented here.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
