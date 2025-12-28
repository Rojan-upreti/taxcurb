import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import FilingProgress from '../components/FilingProgress'

function VisaStatus() {
  const navigate = useNavigate()
  
  const [visaStatus, setVisaStatus] = useState('')
  const [dateEnteredUS, setDateEnteredUS] = useState('')
  const [exitedUSA, setExitedUSA] = useState(null)
  const [exitEntries, setExitEntries] = useState([{ exitDate: '', entryDate: '' }])
  const [programStartDate, setProgramStartDate] = useState('')
  const [programEndDate, setProgramEndDate] = useState('')

  const handleContinue = () => {
    if (allFieldsCompleted) {
      // Save visa status data to localStorage for calculation
      const visaData = {
        visaStatus,
        dateEnteredUS,
        exitedUSA,
        exitEntries,
        programStartDate,
        programEndDate
      }
      localStorage.setItem('filing_visa_status', JSON.stringify(visaData))
      navigate('/filing/income')
    }
  }

  const handleAddExitEntry = () => {
    setExitEntries([...exitEntries, { exitDate: '', entryDate: '' }])
  }

  const handleExitEntryChange = (index, field, value) => {
    const updated = [...exitEntries]
    updated[index][field] = value
    setExitEntries(updated)
  }

  const handleRemoveExitEntry = (index) => {
    if (exitEntries.length > 1) {
      setExitEntries(exitEntries.filter((_, i) => i !== index))
    }
  }

  // Calculate progress
  const allFieldsCompleted = 
    visaStatus !== '' &&
    dateEnteredUS !== '' &&
    exitedUSA !== null &&
    (exitedUSA === 'no' || (exitedUSA === 'yes' && exitEntries.every(e => e.exitDate && e.entryDate))) &&
    programStartDate !== '' &&
    programEndDate !== ''

  // Determine completed pages for progress
  const completedPages = allFieldsCompleted ? ['profile', 'residency', 'visa_status'] : ['profile', 'residency']


  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
          <FilingProgress currentPage="visa_status" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Visa Status</h1>
              <p className="text-sm text-slate-700">
                Please provide your visa details
              </p>
            </div>

            <div className="space-y-4">
              {/* Visa Status */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Visa Status
                </label>
                <select
                  value={visaStatus}
                  onChange={(e) => setVisaStatus(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                >
                  <option value="">Select visa status</option>
                  <option value="F1">F-1</option>
                </select>
              </QuestionCard>

              {/* Date Entered the US (as per I-94) */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Date Entered the US (I-94)
                </label>
                <input
                  type="date"
                  value={dateEnteredUS}
                  onChange={(e) => setDateEnteredUS(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                />
              </QuestionCard>

              {/* Did you exit USA */}
              <QuestionCard>
                <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                  Did you exit USA?
                </h2>
                <YesNoButtons value={exitedUSA} onChange={setExitedUSA} />
              </QuestionCard>

              {/* Exit/Entry Dates */}
              {exitedUSA === 'yes' && (
                <QuestionCard>
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-ink mb-3">Exit and Entry Dates</h3>
                    {exitEntries.map((entry, index) => (
                      <div key={index} className="p-3 bg-stone-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-ink">Entry {index + 1}</span>
                          {exitEntries.length > 1 && (
                            <button
                              onClick={() => handleRemoveExitEntry(index)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink mb-2">Date of Exit</label>
                          <input
                            type="date"
                            value={entry.exitDate}
                            onChange={(e) => handleExitEntryChange(index, 'exitDate', e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ink mb-2">Date of Entry</label>
                          <input
                            type="date"
                            value={entry.entryDate}
                            onChange={(e) => handleExitEntryChange(index, 'entryDate', e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleAddExitEntry}
                      className="w-full px-4 py-2 text-xs font-medium text-ink border-2 border-slate-300 hover:border-ink rounded-full"
                    >
                      + Add Another Exit/Entry
                    </button>
                  </div>
                </QuestionCard>
              )}

              {/* Program Start Date */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Program Start Date
                </label>
                <input
                  type="date"
                  value={programStartDate}
                  onChange={(e) => setProgramStartDate(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                />
              </QuestionCard>

              {/* Program End Date */}
              <QuestionCard>
                <label className="block text-sm font-semibold text-ink mb-3">
                  Program End Date
                </label>
                <input
                  type="date"
                  value={programEndDate}
                  onChange={(e) => setProgramEndDate(e.target.value)}
                  className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                />
              </QuestionCard>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-3 pt-2">
                <button
                  onClick={() => navigate('/filing/residency')}
                  className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                >
                  ← Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!allFieldsCompleted}
                  className={`px-6 py-2 text-xs font-medium transition-all border-2 rounded-full ${
                    allFieldsCompleted
                      ? 'bg-ink text-white hover:bg-slate-800 border-ink cursor-pointer'
                      : 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  Continue →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default VisaStatus

