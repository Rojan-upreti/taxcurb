import React from 'react'
import { useLocation, Link } from 'react-router-dom'

function Breadcrumb() {
  const location = useLocation()
  const pathname = location.pathname

  // Only show breadcrumb on filing pages (not on the main /filing page)
  if (!pathname.startsWith('/filing/') || pathname === '/filing') {
    return null
  }

  // Define the order of filing pages (matching the flow)
  const filingPages = [
    { path: '/filing/profile', name: 'Profile' },
    { path: '/filing/residency', name: 'Residency Status' },
    { path: '/filing/visa_status', name: 'Visa Status' },
    { path: '/filing/identity&Traveldocument', name: 'Identity & Travel Document' },
    { path: '/filing/program&USpresence', name: 'Program & US Presence' },
    { path: '/filing/prior_visa_history', name: 'Prior Visa History' },
    { path: '/filing/address', name: 'Address' },
    { path: '/filing/income', name: 'Income' },
    { path: '/filing/review', name: 'Review' }
  ]

  // Find the current page index
  const currentPageIndex = filingPages.findIndex(page => page.path === pathname)
  
  // If current page not found, fallback to simple breadcrumb
  if (currentPageIndex === -1) {
    const pageNames = {
      '/filing/profile': 'Profile',
      '/filing/residency': 'Residency Status',
      '/filing/visa_status': 'Visa Status',
      '/filing/income': 'Income',
      '/filing/identity&Traveldocument': 'Identity & Travel Document',
      '/filing/program&USpresence': 'Program & US Presence',
      '/filing/prior_visa_history': 'Prior Visa History',
      '/filing/address': 'Address',
      '/filing/review': 'Review'
    }
    const currentPageName = pageNames[pathname] || 'Filing'

    return (
      <nav className="mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              to="/dashboard" 
              className="text-slate-600 hover:text-ink transition-colors"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <Link 
              to="/filing" 
              className="text-slate-600 hover:text-ink transition-colors"
            >
              Filing
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-ink font-medium" aria-current="page">
              {currentPageName}
            </span>
          </li>
        </ol>
      </nav>
    )
  }

  // Build breadcrumb path: Dashboard > Filing > all previous pages > current page
  const breadcrumbItems = [
    { path: '/dashboard', name: 'Dashboard', isLink: true },
    { path: '/filing', name: 'Filing', isLink: true }
  ]

  // Add all pages up to and including the current page
  for (let i = 0; i <= currentPageIndex; i++) {
    breadcrumbItems.push({
      path: filingPages[i].path,
      name: filingPages[i].name,
      isLink: i < currentPageIndex, // Only make clickable if not current page
      isCurrent: i === currentPageIndex
    })
  }

  const Separator = () => (
    <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  )

  // Smart truncation: if more than 4 items, show Dashboard > ... > last 2-3 items
  // This prevents horizontal scrollbar from appearing
  const shouldTruncate = breadcrumbItems.length > 4
  let displayItems = breadcrumbItems

  if (shouldTruncate) {
    // Keep Dashboard, Filing, and last 2 items (or 3 if we have space)
    const lastItems = breadcrumbItems.length > 6 
      ? breadcrumbItems.slice(-2) // If very long, show only last 2
      : breadcrumbItems.slice(-3) // Otherwise show last 3
    displayItems = [
      breadcrumbItems[0], // Dashboard
      breadcrumbItems[1], // Filing
      { path: '', name: '...', isLink: false, isEllipsis: true },
      ...lastItems
    ]
  }

  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-xs md:text-sm flex-wrap">
        {displayItems.map((item, index) => (
          <React.Fragment key={item.path || `ellipsis-${index}`}>
            {index > 0 && (
              <li className="flex-shrink-0">
                <Separator />
              </li>
            )}
            <li className="flex-shrink-0">
              {item.isEllipsis ? (
                <span className="text-slate-400 px-1">
                  {item.name}
                </span>
              ) : item.isLink ? (
                <Link 
                  to={item.path} 
                  className="text-slate-600 hover:text-ink transition-colors px-1.5 py-0.5 rounded hover:bg-slate-100"
                >
                  {item.name}
                </Link>
              ) : (
                <span 
                  className={`px-1.5 py-0.5 rounded ${item.isCurrent ? 'text-ink font-semibold' : 'text-slate-600'}`}
                  aria-current={item.isCurrent ? 'page' : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumb

