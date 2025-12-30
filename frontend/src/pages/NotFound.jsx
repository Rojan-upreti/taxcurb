import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

function NotFound() {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-9xl font-bold text-ink mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink mb-6">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-700 mb-8 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, 
            deleted, or the URL might be incorrect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-ink text-white rounded-lg hover:bg-ink/90 transition-colors font-medium"
            >
              Go to Home
            </Link>
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default NotFound

