import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'

function Residency() {
  const navigate = useNavigate()
  
  const [usCitizen, setUsCitizen] = useState(null)
  const [everGreenCardHolder, setEverGreenCardHolder] = useState(null)
  const [greenCardHolder2024, setGreenCardHolder2024] = useState(null)
  const [everAppliedCitizenship, setEverAppliedCitizenship] = useState(null)
  const [applicationStatus, setApplicationStatus] = useState('')

  const handleContinue = () => {
    // Save data and navigate to next step
    // navigate('/filing/next-step')
  }

  const handleGreenCardChange = (value) => {
    setEverGreenCardHolder(value)
    if (value === 'no') {
      setGreenCardHolder2024(null)
    }
  }

  const handleCitizenshipChange = (value) => {
    setEverAppliedCitizenship(value)
    if (value === 'no') {
      setApplicationStatus('')
    }
  }

  // Calculate progress
  const questions = [
    { id: 1, title: 'US Citizen', completed: usCitizen !== null },
    { 
      id: 2, 
      title: 'Green Card Holder', 
      completed: everGreenCardHolder !== null && (everGreenCardHolder === 'no' || greenCardHolder2024 !== null)
    },
    { 
      id: 3, 
      title: 'Citizenship Application', 
      completed: everAppliedCitizenship !== null && (everAppliedCitizenship === 'no' || applicationStatus !== '')
    }
  ]

  const completedCount = questions.filter(q => q.completed).length
  const totalQuestions = questions.length
  const progressPercentage = (completedCount / totalQuestions) * 100
  const allCompleted = completedCount === totalQuestions

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
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
                  {completedCount} of {totalQuestions} completed
                </p>
              </div>

              {/* Question List */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    allCompleted
                      ? 'bg-ink border-ink'
                      : 'bg-white border-slate-300'
                  }`}>
                    {allCompleted && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    allCompleted ? 'text-ink' : 'text-slate-500'
                  }`}>
                    Residency
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Residency Status</h1>
              <p className="text-sm text-slate-700">
                Please answer the following questions about your residency status
              </p>
            </div>

            <div className="space-y-4">
          {/* Question 1: US Citizen */}
          <QuestionCard>
            <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
              Have you been a US citizen, by birth or naturalization, on the last day of 2024?
            </h2>
            <YesNoButtons value={usCitizen} onChange={setUsCitizen} />
          </QuestionCard>

          {/* Question 2: Ever been a green card holder */}
          <QuestionCard>
            <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
              Have you ever been a green card holder?
            </h2>
            <YesNoButtons value={everGreenCardHolder} onChange={handleGreenCardChange} />

            {/* Conditional Question: Green card holder on last day of 2024 */}
            {everGreenCardHolder === 'yes' && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-ink mb-3 leading-relaxed">
                  Have you been a lawful permanent resident of US or hold a valid Green card at the last day of 2024?
                </h3>
                <YesNoButtons value={greenCardHolder2024} onChange={setGreenCardHolder2024} />
              </div>
            )}
          </QuestionCard>

          {/* Question 3: Ever applied for citizenship/residence */}
          <QuestionCard>
            <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
              Have you ever applied for US citizenship/ lawful residence?
            </h2>
            <YesNoButtons value={everAppliedCitizenship} onChange={handleCitizenshipChange} />

            {/* Conditional Question: Application Status */}
            {everAppliedCitizenship === 'yes' && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-ink mb-3">
                  What is the status of your application?
                </h3>
                <div className="max-w-xs">
                  <select
                    value={applicationStatus}
                    onChange={(e) => setApplicationStatus(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                  >
                    <option value="">Select status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Denied">Denied</option>
                  </select>
                </div>
              </div>
            )}
          </QuestionCard>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 pt-2">
            <button
              onClick={() => navigate('/filing')}
              className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-ink text-white text-xs font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
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

export default Residency

