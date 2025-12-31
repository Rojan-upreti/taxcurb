import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import QuestionCard from '../components/QuestionCard'
import YesNoButtons from '../components/YesNoButtons'
import logger from '../utils/logger'
import FilingProgress from '../components/FilingProgress'
import Breadcrumb from '../components/Breadcrumb'
import W2Form from '../components/incomeForms/W2Form'
import Form1042S from '../components/incomeForms/Form1042S'
import Form1099B from '../components/incomeForms/Form1099B'
import Form1099DIV from '../components/incomeForms/Form1099DIV'
import Form1099G from '../components/incomeForms/Form1099G'
import Form1099INT from '../components/incomeForms/Form1099INT'
import Form1099MISC from '../components/incomeForms/Form1099MISC'
import Form1099R from '../components/incomeForms/Form1099R'
import Form1099NEC from '../components/incomeForms/Form1099NEC'

function Income() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [hasIncome, setHasIncome] = useState(null)
  const [hasSSN, setHasSSN] = useState(null)
  const [ssn, setSSN] = useState('')
  const [hasCPTOPT, setHasCPTOPT] = useState(null)
  const hasLoadedFromCache = useRef(false)

  // New state for income document collection
  const [documentCount, setDocumentCount] = useState(null)
  const [documentTypes, setDocumentTypes] = useState([])
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(null)
  const [incomeDocuments, setIncomeDocuments] = useState([])
  const [currentFormData, setCurrentFormData] = useState({})
  const [isCurrentFormValid, setIsCurrentFormValid] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const w2FormRef = useRef(null)

  // Load visa status data from localStorage
  const [visaData, setVisaData] = useState(null)

  useEffect(() => {
    // Try to load visa status data from localStorage
    const savedVisaData = localStorage.getItem('filing_visa_status')
    if (savedVisaData) {
      try {
        setVisaData(JSON.parse(savedVisaData))
      } catch (e) {
        logger.error('Error parsing visa data:', e)
      }
    }
  }, [])

  // Check if person was in USA at all in 2025
  const wasInUSAIn2025 = () => {
    if (!visaData || !visaData.dateEnteredUS) return false

    const yearStart = new Date('2025-01-01')
    const yearEnd = new Date('2025-12-31')
    const entryDate = new Date(visaData.dateEnteredUS)

    // If entry date is after year end, not in USA in 2025
    if (entryDate > yearEnd) return false

    // If no exits, check if entry date is before or during 2025
    if (visaData.exitedUSA === 'no' || !visaData.exitEntries || visaData.exitEntries.length === 0) {
      return entryDate <= yearEnd
    }

    // If there are exits, check if any period overlaps with 2025
    const validExits = visaData.exitEntries.filter(e => e.exitDate && e.entryDate)
    
    // Check if entry date is before 2025 and first exit is after 2025 start
    if (entryDate < yearStart) {
      const firstExit = validExits.length > 0 ? new Date(validExits[0].exitDate) : null
      if (firstExit && firstExit > yearStart) return true
    }

    // Check if any re-entry is before or during 2025
    for (const exit of validExits) {
      const reEntry = new Date(exit.entryDate)
      if (reEntry <= yearEnd) return true
    }

    // Check if entry date is during 2025
    return entryDate >= yearStart && entryDate <= yearEnd
  }

  // Save function to ensure data is saved
  const saveToCache = () => {
    if (hasIncome !== null) {
      try {
        const incomeData = {
          hasIncome,
          hasSSN: hasIncome === 'no' ? hasSSN : null,
          ssn: hasIncome === 'no' && hasSSN === 'yes' && ssn.length === 11 ? ssn : '',
          hasCPTOPT: hasIncome === 'yes' ? hasCPTOPT : null,
          // Add income document data if hasIncome is 'yes'
          ...(hasIncome === 'yes' && {
            documentCount,
            documentTypes,
            incomeDocuments,
            currentDocumentIndex
          })
        }
        localStorage.setItem('filing_income', JSON.stringify(incomeData))
      } catch (e) {
        logger.error('Error saving income data to cache:', e)
        if (e.name === 'QuotaExceededError') {
          logger.warn('localStorage quota exceeded. Consider clearing old data.')
        }
      }
    }
  }

  // Load cached data on mount and whenever location changes
  useEffect(() => {
    hasLoadedFromCache.current = false
    setValidationError(null) // Clear any validation errors when loading
    try {
      const cached = localStorage.getItem('filing_income')
      if (cached) {
        const data = JSON.parse(cached)
        setHasIncome(data.hasIncome ?? null)
        if (data.hasIncome === 'no') {
          setHasSSN(data.hasSSN ?? null)
          setSSN(data.ssn || '')
        } else if (data.hasIncome === 'yes') {
          setHasCPTOPT(data.hasCPTOPT ?? null)
          setDocumentCount(data.documentCount ?? null)
          setDocumentTypes(data.documentTypes || [])
          setIncomeDocuments(data.incomeDocuments || [])
          setCurrentDocumentIndex(data.currentDocumentIndex ?? null)
          // Initialize documentTypes array if documentCount is set
          if (data.documentCount && (!data.documentTypes || data.documentTypes.length === 0)) {
            setDocumentTypes(new Array(data.documentCount).fill(''))
          }
        }
      }
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    } catch (e) {
      logger.error('Error loading cached income data:', e)
      setTimeout(() => {
        hasLoadedFromCache.current = true
      }, 0)
    }
  }, [location.pathname])
  
  // Clear validation error when document index changes
  useEffect(() => {
    setValidationError(null)
  }, [currentDocumentIndex])
  
  // Clear validation error immediately when form becomes valid
  useEffect(() => {
    if (isCurrentFormValid && validationError) {
      setValidationError(null)
    }
  }, [isCurrentFormValid])

  // Save to cache whenever form data changes
  useEffect(() => {
    if (!hasLoadedFromCache.current) return
    saveToCache()
  }, [hasIncome, hasSSN, ssn, hasCPTOPT, documentCount, documentTypes, incomeDocuments, currentDocumentIndex])

  const handleSSNChange = (value) => {
    const sanitized = value.replace(/[^\d-]/g, '')
    const cleaned = sanitized.replace(/\D/g, '')
    if (cleaned.length <= 9) {
      let formatted = cleaned
      if (cleaned.length > 3) {
        formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3)
      }
      if (cleaned.length > 5) {
        formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 5) + '-' + cleaned.slice(5, 9)
      }
      setSSN(formatted)
    }
  }

  const handleContinue = () => {
    if (hasIncome === 'no') {
      if (hasSSN === 'yes' && ssn.length !== 11) {
        return
      }
      saveToCache()
      navigate('/filing/review')
    }
  }

  const handleDocumentCountChange = (count) => {
    const numCount = parseInt(count)
    setDocumentCount(numCount)
    setDocumentTypes(new Array(numCount).fill(''))
    setIncomeDocuments(new Array(numCount).fill(null))
  }

  const handleDocumentTypeChange = (index, type) => {
    const updated = [...documentTypes]
    updated[index] = type
    setDocumentTypes(updated)
  }

  const handleDocumentTypesContinue = () => {
    // Validate all document types are selected
    if (documentTypes.every(type => type !== '')) {
      setCurrentDocumentIndex(0)
      setIsCurrentFormValid(false) // Reset validation for first document
      // Initialize incomeDocuments array
      const initialized = new Array(documentCount).fill(null).map((_, idx) => {
        if (incomeDocuments[idx]) {
          return incomeDocuments[idx]
        }
        return { type: documentTypes[idx], data: {} }
      })
      setIncomeDocuments(initialized)
      // Load current document data if exists
      if (initialized[0] && initialized[0].data) {
        setCurrentFormData(initialized[0].data)
      } else {
        setCurrentFormData({})
      }
    }
  }

  const handleFormDataChange = (data) => {
    setCurrentFormData(data)
    // Update incomeDocuments array
    const updated = [...incomeDocuments]
    updated[currentDocumentIndex] = {
      type: documentTypes[currentDocumentIndex],
      data: data
    }
    setIncomeDocuments(updated)
  }

  const handleFormValidationChange = (isValid) => {
    setIsCurrentFormValid(isValid)
    // Clear error message when form becomes valid
    if (isValid) {
      setValidationError(null)
    }
  }

  const handleNextDocument = () => {
    // Check if current form is valid
    if (!isCurrentFormValid) {
      // If it's a W-2 form, get missing mandatory fields
      if (documentTypes[currentDocumentIndex] === 'W-2' && w2FormRef.current) {
        const missingFields = w2FormRef.current.getMissingMandatoryFields()
        if (missingFields.length > 0) {
          setValidationError(`Please fill in the following mandatory fields:\n${missingFields.map(field => `• ${field}`).join('\n')}`)
          return
        }
      } else {
        // For other forms, show generic message
        setValidationError('Please fill in all mandatory fields before continuing.')
        return
      }
    }
    
    // Clear any previous error
    setValidationError(null)
    
    if (currentDocumentIndex < documentCount - 1) {
      const nextIndex = currentDocumentIndex + 1
      setCurrentDocumentIndex(nextIndex)
      setIsCurrentFormValid(false) // Reset validation for new document
      setValidationError(null) // Clear any error messages
      // Load next document data if exists
      if (incomeDocuments[nextIndex] && incomeDocuments[nextIndex].data) {
        setCurrentFormData(incomeDocuments[nextIndex].data)
      } else {
        setCurrentFormData({})
      }
    } else {
      // All documents completed, navigate to review
      saveToCache()
      navigate('/filing/review')
    }
  }

  const handlePreviousDocument = () => {
    if (currentDocumentIndex > 0) {
      const prevIndex = currentDocumentIndex - 1
      setCurrentDocumentIndex(prevIndex)
      setIsCurrentFormValid(false) // Reset validation for previous document
      setValidationError(null) // Clear any error messages
      // Load previous document data if exists
      if (incomeDocuments[prevIndex] && incomeDocuments[prevIndex].data) {
        setCurrentFormData(incomeDocuments[prevIndex].data)
      } else {
        setCurrentFormData({})
      }
    } else {
      // Go back to document type selection
      setCurrentDocumentIndex(null)
      setCurrentFormData({})
      setIsCurrentFormValid(false)
    }
  }

  const renderFormComponent = () => {
    const currentType = documentTypes[currentDocumentIndex]
    if (!currentType) {
      return null
    }
    
    const props = {
      data: currentFormData,
      onChange: handleFormDataChange,
      onValidationChange: handleFormValidationChange
    }

    switch (currentType) {
      case 'W-2':
        return <W2Form ref={w2FormRef} {...props} />
      case '1042-S':
        return <Form1042S {...props} />
      case '1099-B':
        return <Form1099B {...props} />
      case '1099-DIV':
        return <Form1099DIV {...props} />
      case '1099-G':
        return <Form1099G {...props} />
      case '1099-INT':
        return <Form1099INT {...props} />
      case '1099-MISC':
        return <Form1099MISC {...props} />
      case '1099-R':
        return <Form1099R {...props} />
      case '1099-NEC':
        return <Form1099NEC {...props} />
      default:
        return null
    }
  }

  const allFieldsCompleted = hasIncome === 'no' 
    ? (hasSSN !== null && (hasSSN === 'no' || (hasSSN === 'yes' && ssn.length === 11)))
    : hasIncome === 'yes' && currentDocumentIndex === null && documentCount !== null && documentTypes.every(type => type !== '')
    ? true
    : hasIncome === 'yes' && currentDocumentIndex !== null
    ? isCurrentFormValid
    : false

  const completedPages = (hasIncome === 'no' && allFieldsCompleted) || (hasIncome === 'yes' && currentDocumentIndex !== null && currentDocumentIndex === documentCount - 1 && isCurrentFormValid)
    ? ['profile', 'residency', 'visa_status', 'identity_travel', 'program_presence', 'prior_visa_history', 'address', 'income']
    : hasIncome !== null
    ? ['profile', 'residency', 'visa_status', 'identity_travel', 'program_presence', 'prior_visa_history', 'address']
    : ['profile', 'residency', 'visa_status', 'identity_travel', 'program_presence', 'prior_visa_history', 'address']

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Progress Sidebar */}
          <FilingProgress currentPage="income" completedPages={completedPages} />

          {/* Main Content */}
          <main className="flex-1 max-w-2xl order-1 lg:order-2">
            <Breadcrumb />
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Income</h1>
              <p className="text-sm text-slate-700">
                {currentDocumentIndex !== null && documentTypes[currentDocumentIndex]
                  ? `Document ${currentDocumentIndex + 1} of ${documentCount} - ${documentTypes[currentDocumentIndex]}`
                  : 'Please answer questions about your U.S. income'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Check if person was in USA in 2025 */}
              {visaData && !wasInUSAIn2025() && (
                <QuestionCard>
                  <div className="bg-stone-100 border border-slate-300 p-6 text-center rounded-3xl">
                    <div className="flex justify-center mb-4">
                      <svg className="w-12 h-12 text-ink" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-ink mb-3">
                      No Tax Filing Required
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Since you were not physically present in the United States for even a single day in 2025, 
                      you are not required to file tax.
                    </p>
                  </div>
                </QuestionCard>
              )}

              {/* Income Question - Show when not filling forms */}
              {(!visaData || wasInUSAIn2025()) && currentDocumentIndex === null && (
                <QuestionCard>
                  <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                    Did you have ANY U.S. income in 2025?
                  </h2>
                  <div className="mb-4 text-xs text-slate-600 space-y-1">
                    <p className="font-medium">Examples:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>On-campus job (W-2)</li>
                      <li>CPT / OPT</li>
                      <li>Scholarship (1042-S)</li>
                      <li>Bank interest</li>
                      <li>Any U.S. paid work</li>
                    </ul>
                  </div>
                  <YesNoButtons 
                    value={hasIncome} 
                    onChange={(value) => {
                      setHasIncome(value)
                      // Reset document-related state if changing from yes to no
                      if (value === 'no') {
                        setDocumentCount(null)
                        setDocumentTypes([])
                        setIncomeDocuments([])
                      }
                      setTimeout(saveToCache, 100)
                    }} 
                  />
                </QuestionCard>
              )}

              {/* SSN Question - Show when user selects No for income */}
              {hasIncome === 'no' && (!visaData || wasInUSAIn2025()) && (
                <>
                  <QuestionCard>
                    <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                      Do you have SSN?
                    </h2>
                    <YesNoButtons 
                      value={hasSSN} 
                      onChange={(value) => {
                        setHasSSN(value)
                        setTimeout(saveToCache, 100)
                      }} 
                    />
                  </QuestionCard>

                  {/* SSN Input */}
                  {hasSSN === 'yes' && (
                    <QuestionCard>
                      <label className="block text-sm font-semibold text-ink mb-3">
                        SSN *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={ssn}
                        onChange={(e) => {
                          handleSSNChange(e.target.value)
                          setTimeout(saveToCache, 100)
                        }}
                        onBlur={saveToCache}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                        pattern="[0-9]{3}-[0-9]{2}-[0-9]{4}"
                        className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                      />
                      <p className="text-xs text-slate-600 mt-2">
                        Format: XXX-XX-XXXX
                      </p>
                    </QuestionCard>
                  )}
                </>
              )}

              {/* CPT/OPT Question - Show when user selects Yes for income */}
              {hasIncome === 'yes' && currentDocumentIndex === null && (!visaData || wasInUSAIn2025()) && (
                <QuestionCard>
                  <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                    If You Participated in CPT/OPT ( Yes only, if it was paid)
                  </h2>
                  <YesNoButtons 
                    value={hasCPTOPT} 
                    onChange={(value) => {
                      setHasCPTOPT(value)
                      setTimeout(saveToCache, 100)
                    }} 
                  />
                </QuestionCard>
              )}

              {/* Back Button - Show when user selects Yes for income but hasn't answered CPT/OPT */}
              {hasIncome === 'yes' && hasCPTOPT === null && currentDocumentIndex === null && (!visaData || wasInUSAIn2025()) && (
                <div className="flex justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      setHasIncome(null)
                      setHasCPTOPT(null)
                    }}
                    className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                  >
                    ← Back
                  </button>
                </div>
              )}

              {/* Document Count Selection - Show when user selects Yes for income and has answered CPT/OPT */}
              {hasIncome === 'yes' && hasCPTOPT !== null && currentDocumentIndex === null && (
                <QuestionCard>
                  <h2 className="text-sm font-semibold text-ink mb-3 leading-relaxed">
                    How many kinds of income documents do you have?
                  </h2>
                  <select
                    value={documentCount || ''}
                    onChange={(e) => handleDocumentCountChange(e.target.value)}
                    className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                  >
                    <option value="">Select number of documents</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} document{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </QuestionCard>
              )}

              {/* Document Type Selection - Show when documentCount is set but types not all selected */}
              {hasIncome === 'yes' && documentCount !== null && currentDocumentIndex === null && (
                <>
                  <QuestionCard>
                    <h2 className="text-sm font-semibold text-ink mb-4 leading-relaxed">
                      Select the type for each document:
                    </h2>
                    <div className="space-y-4">
                      {Array.from({ length: documentCount }, (_, index) => (
                        <div key={index}>
                          <label className="block text-xs font-semibold text-ink mb-2">
                            Document {index + 1} Type *
                          </label>
                          <select
                            value={documentTypes[index] || ''}
                            onChange={(e) => handleDocumentTypeChange(index, e.target.value)}
                            className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
                          >
                            <option value="">Select Document Type</option>
                            <option value="W-2">W-2 form (s)</option>
                            <option value="1042-S">1042-S</option>
                            <option value="1099-B">1099-B (Broker and Barter Exchange)</option>
                            <option value="1099-DIV">1099-DIV (Dividends and distributions)</option>
                            <option value="1099-G">1099-G (Government Payments)</option>
                            <option value="1099-INT">1099-INT (Interest Income)</option>
                            <option value="1099-MISC">1099-MISC (Miscellaneous Income)</option>
                            <option value="1099-R">1099-R (Pensions and Annuities)</option>
                            <option value="1099-NEC">1099-NEC (Nonemployee Compensation)</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </QuestionCard>
                  <div className="flex justify-between gap-3 pt-2">
                    <button
                      onClick={() => {
                        setHasIncome(null)
                        setHasCPTOPT(null)
                        setDocumentCount(null)
                        setDocumentTypes([])
                      }}
                      className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleDocumentTypesContinue}
                      disabled={!documentTypes.every(type => type !== '')}
                      className={`px-6 py-2 text-xs font-medium transition-all border-2 rounded-full ${
                        documentTypes.every(type => type !== '')
                          ? 'bg-ink text-white hover:bg-slate-800 border-ink cursor-pointer'
                          : 'bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed'
                      }`}
                    >
                      Continue →
                    </button>
                  </div>
                </>
              )}

              {/* Form Display - Show when currentDocumentIndex is set */}
              {hasIncome === 'yes' && currentDocumentIndex !== null && (
                <>
                  {renderFormComponent()}
                  {/* Validation Error Message */}
                  {validationError && (
                    <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-2">Please complete the following mandatory fields:</p>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap font-sans">{validationError}</pre>
                    </div>
                  )}
                  {/* Continue Button - Just below the form */}
                  <div className="flex justify-between gap-3">
                    <button
                      onClick={handlePreviousDocument}
                      className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleNextDocument}
                      className="px-6 py-2 text-xs font-medium transition-all border-2 rounded-full bg-ink text-white hover:bg-slate-800 border-ink cursor-pointer"
                    >
                      Continue →
                    </button>
                  </div>
                </>
              )}

              {/* No Income Path - Show continue button with back button */}
              {hasIncome === 'no' && (!visaData || wasInUSAIn2025()) && (
                <div className="flex justify-between gap-3 pt-2">
                  <button
                    onClick={() => navigate('/filing/address')}
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
              )}

              {/* Navigation Buttons - Show when income is null */}
              {hasIncome === null && (
                <div className="flex justify-between gap-3 pt-2">
                  <button
                    onClick={() => navigate('/filing/address')}
                    className="px-5 py-2 text-xs font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Income
