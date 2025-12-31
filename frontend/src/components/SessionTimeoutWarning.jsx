import React from 'react'

function SessionTimeoutWarning({ onContinue, remainingSeconds }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="ml-3 text-lg font-semibold text-ink">
            Session Timeout Warning
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-slate-700 mb-2">
            Due to inactivity, you will be logged out in{' '}
            <span className="font-semibold text-red-600">
              {remainingSeconds} second{remainingSeconds !== 1 ? 's' : ''}
            </span>.
          </p>
          <p className="text-xs text-slate-600">
            All entered data will be cleared for security purposes.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onContinue}
            className="px-4 py-2 text-sm font-medium text-white bg-ink hover:bg-slate-800 rounded-full transition-colors"
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionTimeoutWarning

