import React from 'react'

function QuestionCard({ children, className = '' }) {
  return (
    <div className={`bg-white border-2 border-slate-200 p-4 rounded-3xl ${className}`}>
      {children}
    </div>
  )
}

export default QuestionCard

