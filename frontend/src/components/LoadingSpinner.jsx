import React from 'react'

function LoadingSpinner({ message = 'Loading...', fullScreen = true }) {
  const containerClasses = fullScreen
    ? 'min-h-screen bg-stone-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8'

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink mx-auto mb-4"></div>
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner

