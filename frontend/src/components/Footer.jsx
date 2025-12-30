import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-slate-300 text-slate-700">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-ink mb-2">TaxCurb</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-2">
              Simplifying tax filing for international students in the United States. 
              File your tax forms and manage your tax obligations with confidence.
            </p>
            <p className="text-xs text-slate-500">
              © {currentYear} TaxCurb. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-3 uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-slate-600 hover:text-ink transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-slate-600 hover:text-ink transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/tutorial" className="text-sm text-slate-600 hover:text-ink transition-colors">
                  Tutorial
                </Link>
              </li>
              <li>
                <Link to="/tax-calculator" className="text-sm text-slate-600 hover:text-ink transition-colors">
                  Tax Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-3 uppercase tracking-wide">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-slate-600 hover:text-ink transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@taxcurb.com" 
                  className="text-sm text-slate-600 hover:text-ink transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-slate-600 hover:text-ink transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    // Add privacy policy link when available
                    console.log('Privacy Policy - Coming soon')
                  }}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-slate-600 hover:text-ink transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    // Add terms of service link when available
                    console.log('Terms of Service - Coming soon')
                  }}
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-500 text-center md:text-left">
              TaxCurb is not a substitute for professional tax advice. Please consult with a tax professional for complex situations.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.irs.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-slate-600 hover:text-ink transition-colors"
              >
                IRS.gov
              </a>
              <span className="text-slate-400">|</span>
              <a 
                href="https://www.irs.gov/forms-pubs/about-form-8843" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-slate-600 hover:text-ink transition-colors"
              >
                Form 8843 Info
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

