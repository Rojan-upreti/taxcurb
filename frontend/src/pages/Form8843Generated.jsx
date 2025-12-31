import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import { collectFormData, generateForm8843, base64ToBlobURL, downloadPDF } from '../services/form8843Service'
import logger from '../utils/logger'
import Breadcrumb from '../components/Breadcrumb'

function Form8843Generated() {
  const { userEmail: encodedEmail, uniqueId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfBase64, setPdfBase64] = useState(null)
  const [formData, setFormData] = useState(null)

  // Decode email from URL
  const userEmail = encodedEmail ? decodeURIComponent(encodedEmail) : null

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [pdfUrl])

  // Verify user and generate form on mount
  useEffect(() => {
    const generateForm = async () => {
      // Verify user is authenticated
      if (!currentUser) {
        setError('Please log in to view your form')
        setLoading(false)
        return
      }

      // Verify email matches
      if (userEmail && currentUser.email !== userEmail) {
        setError('Unauthorized access. Email does not match.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        // Collect all form data
        const taxYear = '2025'
        const collectedData = collectFormData(currentUser.uid, taxYear)
        setFormData(collectedData)

        // Basic validation
        if (!collectedData.firstName || !collectedData.lastName) {
          throw new Error('Please complete your profile information first.')
        }
        if (!collectedData.taxYear) {
          throw new Error('Tax year is required.')
        }

        // Generate PDF
        const response = await generateForm8843(collectedData)

        if (response.success && response.pdf) {
          setPdfBase64(response.pdf)
          const blobUrl = base64ToBlobURL(response.pdf)
          setPdfUrl(blobUrl)
        } else {
          throw new Error(response.message || 'Failed to generate PDF.')
        }
      } catch (err) {
        logger.error('Error generating form:', err)
        setError(err.message || 'Failed to generate Form 8843. Please ensure all required filing information is complete and try again.')
      } finally {
        setLoading(false)
      }
    }

    generateForm()
  }, [currentUser, userEmail])

  const handleDownload = () => {
    if (!pdfBase64) {
      setError('No PDF available to download')
      return
    }

    try {
      // Generate filename: Form8843_2025_FirstName_LastName.pdf
      const taxYear = formData?.taxYear || '2025'
      const firstName = formData?.firstName || ''
      const lastName = formData?.lastName || ''
      
      // Sanitize names: remove special characters, replace spaces with underscores
      const sanitizeName = (name) => {
        if (!name) return ''
        return name
          .trim()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .replace(/\s+/g, '_')
      }
      
      const sanitizedFirstName = sanitizeName(firstName)
      const sanitizedLastName = sanitizeName(lastName)
      
      // Build filename: Form8843_2025_FirstName_LastName.pdf
      let filename = 'Form8843'
      if (taxYear) filename += `_${taxYear}`
      if (sanitizedFirstName) filename += `_${sanitizedFirstName}`
      if (sanitizedLastName) filename += `_${sanitizedLastName}`
      filename += '.pdf'
      
      // Fallback if no names provided
      if (!sanitizedFirstName && !sanitizedLastName) {
        filename = `Form8843_${taxYear}.pdf`
      }
      
      downloadPDF(pdfBase64, filename)
    } catch (err) {
      logger.error('Error downloading PDF:', err)
      setError('Failed to download PDF')
    }
  }

  const handleView = () => {
    if (!pdfUrl) {
      setError('No PDF available to view')
      return
    }
    window.open(pdfUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1 max-w-4xl order-1 lg:order-2">
            <Breadcrumb />
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-ink mb-1">Yay! Your Tax Document is Ready</h1>
              <p className="text-sm text-slate-700">
                Your form has been generated successfully
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white border border-slate-300 p-12 text-center rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ink mx-auto mb-4"></div>
                <p className="text-slate-600">Generating your Form 8843...</p>
                <p className="text-sm text-slate-500 mt-2">Please wait while we generate your form</p>
              </div>
            ) : pdfUrl ? (
              <div className="space-y-6">
                {/* Instructions Section */}
                <div className="bg-white border border-slate-300 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-ink mb-4">Instructions</h2>
                  <div className="space-y-3 text-sm text-slate-700">
                    <p>
                      <strong>Form 8843 has been generated successfully.</strong>
                    </p>
                    <p>
                      Please review your form and <strong>sign at the end of page 2</strong> before mailing.
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <p className="font-semibold text-ink mb-2">Mail your completed form to:</p>
                      <div className="bg-stone-50 p-4 rounded border border-slate-200 font-mono text-sm">
                        <p>Department of the Treasury</p>
                        <p>Internal Revenue Service Center</p>
                        <p>Austin, TX 73301-0215</p>
                      </div>
                    </div>
                  </div>

                  {/* Form Ready Section */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex flex-col items-center justify-center gap-6 py-4">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-ink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-ink mb-2">Form 8843 Ready</h3>
                        <p className="text-sm text-slate-600">Your form has been generated and is ready to view or download</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row gap-4 w-full max-w-md">
                        <button
                          onClick={handleView}
                          className="flex-1 px-6 py-3 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink rounded-lg flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={handleDownload}
                          className="flex-1 px-6 py-3 bg-white text-ink text-sm font-medium hover:bg-stone-100 transition-colors border-2 border-ink rounded-lg flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Form8843Generated

