import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signUp, signIn, forgotPassword } from '../services/authService'
import { useAuth } from '../contexts/AuthContext'
import logger from '../utils/logger'

function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser, refreshAuth } = useAuth()
  const [activeTab, setActiveTab] = useState('signup')
  
  // Form states
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  // UI states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Forgot password modal states
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (currentUser) {
      navigate('/dashboard', { replace: true })
      return
    }

    // Check hash fragment on mount and when location changes
    const hash = location.hash.replace('#', '')
    if (hash === 'login' || hash === 'signup') {
      setActiveTab(hash)
      // Scroll to the section after a brief delay to ensure it's rendered
      setTimeout(() => {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      // Default to signup if no hash
      setActiveTab('signup')
      navigate('/auth#signup', { replace: true })
    }
  }, [location, navigate, currentUser])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`/auth#${tab}`, { replace: true })
    // Clear errors when switching tabs
    setError('')
  }

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (!signupEmail || !signupPassword) {
      setError('Please fill in all fields')
      return
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    try {
      await signUp(signupEmail, signupPassword)
      // Refresh auth state to get the new user from cookies
      await refreshAuth()
      // Success - redirect to dashboard
      navigate('/dashboard', { replace: true })
    } catch (err) {
      logger.error('Signup error:', err)
      // Handle backend API errors
      if (err.message) {
        setError(err.message)
      } else {
        setError('Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle signin
  const handleSignin = async (e) => {
    e.preventDefault()
    setError('')

    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await signIn(loginEmail, loginPassword)
      // Refresh auth state to get the new user from cookies
      await refreshAuth()
      // Success - redirect to dashboard
      navigate('/dashboard', { replace: true })
    } catch (err) {
      logger.error('Signin error:', err)
      // Handle backend API errors
      if (err.message) {
        setError(err.message)
      } else {
        setError('Failed to sign in. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setForgotPasswordSuccess(false)

    if (!forgotPasswordEmail) {
      setError('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotPasswordEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setForgotPasswordLoading(true)
    try {
      await forgotPassword(forgotPasswordEmail)
      setForgotPasswordSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-slate-50">
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <nav className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-semibold text-ink tracking-tight hover:text-slate-700 transition-colors">TaxCurb</Link>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm text-slate-700 hover:text-ink transition-colors">Home</Link>
                <Link to="/about" className="text-sm text-slate-700 hover:text-ink transition-colors">About</Link>
                <Link to="/tutorial" className="text-sm text-slate-700 hover:text-ink transition-colors">Tutorial</Link>
              </div>
              <Link to="/auth#signup" className="text-sm text-ink font-medium border border-ink px-4 py-2 hover:bg-ink hover:text-white transition-all duration-200 rounded">Get Started</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Visual/Content */}
          <div className="hidden md:block space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-semibold text-ink leading-tight">
                {activeTab === 'signup' ? 'Start your tax journey' : 'Welcome back'}
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed">
                {activeTab === 'signup' 
                  ? 'Join thousands of F-1 students filing their taxes with confidence. Free, accurate, and designed for you.'
                  : 'Continue where you left off. Access your tax returns and file with ease.'}
              </p>
            </div>
            
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ink/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-ink mb-1">Free for students</h3>
                  <p className="text-slate-600 text-sm">No hidden fees, no credit card required</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ink/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-ink mb-1">Secure & compliant</h3>
                  <p className="text-slate-600 text-sm">IRS-compliant forms, encrypted data</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ink/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-ink mb-1">Fast & easy</h3>
                  <p className="text-slate-600 text-sm">Complete your return in minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                <button
                  onClick={() => handleTabChange('signup')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === 'signup'
                      ? 'text-ink bg-white'
                      : 'text-slate-600 hover:text-ink hover:bg-white/50'
                  }`}
                >
                  <span className="relative z-10">Sign Up</span>
                  {activeTab === 'signup' && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-ink"></span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('login')}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-300 relative ${
                    activeTab === 'login'
                      ? 'text-ink bg-white'
                      : 'text-slate-600 hover:text-ink hover:bg-white/50'
                  }`}
                >
                  <span className="relative z-10">Sign In</span>
                  {activeTab === 'login' && (
                    <span className="absolute bottom-0 left-0 right-0 h-1 bg-ink"></span>
                  )}
                </button>
              </div>

              <div className="p-8 md:p-10">
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Sign Up Section */}
                <div id="signup" className={`transition-all duration-500 ${activeTab === 'signup' ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-4'}`}>
                  <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold text-ink mb-2">Create your account</h1>
                    <p className="text-slate-600">Get started with TaxCurb and file your taxes for free.</p>
                  </div>
                  <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-semibold text-ink mb-2">Email</label>
                      <input
                        type="email"
                        id="signup-email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all bg-white hover:border-slate-400"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-semibold text-ink mb-2">Password</label>
                      <input
                        type="password"
                        id="signup-password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all bg-white hover:border-slate-400"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-8 py-4 bg-ink text-white text-sm font-semibold hover:bg-slate-800 transition-all duration-200 border border-ink rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                  <p className="mt-6 text-sm text-slate-600 text-center">
                    Already have an account?{' '}
                    <button
                      onClick={() => handleTabChange('login')}
                      className="text-ink font-semibold hover:underline transition-all"
                    >
                      Sign in
                    </button>
                  </p>
                </div>

                {/* Sign In Section */}
                <div id="login" className={`transition-all duration-500 ${activeTab === 'login' ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-4'}`}>
                  <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-semibold text-ink mb-2">Welcome back</h1>
                    <p className="text-slate-600">Sign in to your TaxCurb account.</p>
                  </div>
                  <form onSubmit={handleSignin} className="space-y-5">
                    <div>
                      <label htmlFor="login-email" className="block text-sm font-semibold text-ink mb-2">Email</label>
                      <input
                        type="email"
                        id="login-email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all bg-white hover:border-slate-400"
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="login-password" className="block text-sm font-semibold text-ink mb-2">Password</label>
                      <input
                        type="password"
                        id="login-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all bg-white hover:border-slate-400"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer group">
                        <input type="checkbox" className="mr-2 rounded border-slate-300 text-ink focus:ring-ink w-4 h-4 cursor-pointer" />
                        <span className="text-sm text-slate-700 group-hover:text-ink transition-colors">Remember me</span>
                      </label>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          setShowForgotPassword(true)
                          setError('')
                        }}
                        className="text-sm text-ink font-medium hover:underline transition-all"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-8 py-4 bg-ink text-white text-sm font-semibold hover:bg-slate-800 transition-all duration-200 border border-ink rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>
                  <p className="mt-6 text-sm text-slate-600 text-center">
                    Don't have an account?{' '}
                    <button
                      onClick={() => handleTabChange('signup')}
                      className="text-ink font-semibold hover:underline transition-all"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
          onClick={() => {
            if (!forgotPasswordLoading) {
              setShowForgotPassword(false)
              setForgotPasswordEmail('')
              setError('')
              setForgotPasswordSuccess(false)
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            {!forgotPasswordSuccess ? (
              <>
                <h2 className="text-2xl font-semibold text-ink mb-2">Reset Password</h2>
                <p className="text-slate-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-semibold text-ink mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent transition-all bg-white"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false)
                        setForgotPasswordEmail('')
                        setError('')
                        setForgotPasswordSuccess(false)
                      }}
                      disabled={forgotPasswordLoading}
                      className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotPasswordLoading}
                      className="flex-1 px-4 py-3 bg-ink text-white rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-ink mb-2">Check Your Email</h2>
                <p className="text-slate-600 mb-6">
                  If an account exists with <strong>{forgotPasswordEmail}</strong>, we've sent a password reset link.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordEmail('')
                    setForgotPasswordSuccess(false)
                  }}
                  className="w-full px-4 py-3 bg-ink text-white rounded-lg hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Auth
