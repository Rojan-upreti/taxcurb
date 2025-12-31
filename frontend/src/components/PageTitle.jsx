import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'TaxCurb - File U.S. Taxes for Non-Resident Aliens',
  '/dashboard': 'Dashboard - TaxCurb',
  '/onboarding': 'Onboarding - TaxCurb',
  '/filing': 'Tax Filing - TaxCurb',
  '/filing/profile': 'Profile - TaxCurb',
  '/filing/residency': 'Residency - TaxCurb',
  '/filing/visa_status': 'Visa Status - TaxCurb',
  '/filing/income': 'Income - TaxCurb',
  '/filing/identity&Traveldocument': 'Identity & Travel Document - TaxCurb',
  '/filing/program&USpresence': 'Program & US Presence - TaxCurb',
  '/filing/prior_visa_history': 'Prior Visa History - TaxCurb',
  '/filing/address': 'Address - TaxCurb',
  '/filing/review': 'Review - TaxCurb',
  '/auth': 'Sign In / Sign Up - TaxCurb',
  '/reset-password': 'Reset Password - TaxCurb',
  '/about': 'About - TaxCurb',
  '/tutorial': 'Tutorial - TaxCurb',
  '/tax-tool': 'Tax Tool - TaxCurb',
  '/tax-tool/car-interest-deduction-calculator': 'Car Interest Deduction Calculator - TaxCurb',
}

function PageTitle() {
  const location = useLocation()

  useEffect(() => {
    // Get base path (without query params or hash)
    const path = location.pathname
    
    // Check for exact match first
    let title = pageTitles[path]
    
    // If no exact match, check for dynamic routes
    if (!title) {
      // Check for form generation page pattern: /filing/:userEmail/:uniqueId
      if (path.match(/^\/filing\/[^/]+\/[^/]+\/?$/)) {
        title = 'Form 8843 Generated - TaxCurb'
      } else {
        // Default title
        title = 'TaxCurb - File U.S. Taxes for Non-Resident Aliens'
      }
    }
    
    document.title = title
  }, [location.pathname])

  return null
}

export default PageTitle

