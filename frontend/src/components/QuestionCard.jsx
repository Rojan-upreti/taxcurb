import React from 'react'

function QuestionCard({ children, className = '' }) {
  return (
    <div className={`bg-white border-2 border-slate-300 p-4 rounded-xl ${className}`}>
      {children}
    </div>
  )
}

export default QuestionCard

