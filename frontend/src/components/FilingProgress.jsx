import React from 'react'

function FilingProgress({ currentPage, completedPages = [] }) {
  const allPages = [
    { id: 'profile', name: 'Profile', path: '/filing/profile' },
    { id: 'residency', name: 'Residency', path: '/filing/residency' },
    { id: 'visa_status', name: 'Visa Status', path: '/filing/visa_status' },
    { id: 'income', name: 'Income', path: '/filing/income' },
    { id: 'identity_travel', name: 'Identity & Travel', path: '/filing/identity&Traveldocument' },
    { id: 'program_presence', name: 'Program & Presence', path: '/filing/program&USpresence' },
    { id: 'prior_visa_history', name: 'Prior Visa History', path: '/filing/prior_visa_history' },
    { id: 'address', name: 'Address', path: '/filing/address' },
  ]

  const totalPages = allPages.length
  const completedCount = completedPages.length
  const progressPercentage = (completedCount / totalPages) * 100

  return (
    <aside className="lg:w-64 flex-shrink-0 order-2 lg:order-1">
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sticky top-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Progress</h3>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-ink transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-600 mt-2 text-center">
            {completedCount} of {totalPages} completed
          </p>
        </div>

        {/* Page List */}
        <div className="space-y-3">
          {allPages.map((page) => {
            const isCompleted = completedPages.includes(page.id)
            const isCurrent = currentPage === page.id
            
            return (
              <div key={page.id} className="flex items-center gap-2">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-ink border-ink'
                    : isCurrent
                    ? 'bg-ink/20 border-ink'
                    : 'bg-white border-slate-300'
                }`}>
                  {isCompleted && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  isCompleted ? 'text-ink' : isCurrent ? 'text-ink' : 'text-slate-500'
                }`}>
                  {page.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

export default FilingProgress

