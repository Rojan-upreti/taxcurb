import React from 'react'

function YesNoButtons({ value, onChange, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-2 justify-start ${className}`}>
      <button
        onClick={() => onChange('yes')}
        className={`px-6 py-2 text-sm font-medium border-2 transition-all rounded-full ${
          value === 'yes'
            ? 'bg-ink text-white border-ink shadow-md'
            : 'bg-white text-ink border-slate-300 hover:border-ink hover:bg-stone-50'
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange('no')}
        className={`px-6 py-2 text-sm font-medium border-2 transition-all rounded-full ${
          value === 'no'
            ? 'bg-ink text-white border-ink shadow-md'
            : 'bg-white text-ink border-slate-300 hover:border-ink hover:bg-stone-50'
        }`}
      >
        No
      </button>
    </div>
  )
}

export default YesNoButtons

