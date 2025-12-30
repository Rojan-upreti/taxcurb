import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { 
  checkVehicleEligibility, 
  calculateVehicleInterest
} from '../services/vehicleService'

function TaxCalculator() {
  const navigate = useNavigate()
  
  // Step management
  const [currentStep, setCurrentStep] = useState(0)
  const [inputMethod, setInputMethod] = useState(null) // 'manual', 'vin', 'plate'
  const [isLeased, setIsLeased] = useState(null) // null, true, false
  
  // Vehicle data
  const [vehicleData, setVehicleData] = useState({
    vin: '',
    make: '',
    model: '',
    modelYear: '',
    purchaseDate: '',
    assembledInUSA: null,
    plantCountry: null,
  })
  
  // Loan data
  const [loanData, setLoanData] = useState({
    purchasePrice: '',
    downPayment: '',
    loanTermMonths: '',
    customLoanTermMonths: '',
    APR: '',
    monthlyPayment: '',
    manualMonthlyPayment: false, // Track if user manually entered monthly payment
    loanStartDate: '',
    isLease: false,
    personalUse: true,
    securedByLien: true,
    isUsedVehicle: false,
  })
  
  // Tax data
  const [taxData, setTaxData] = useState({
    taxYear: new Date().getFullYear().toString(),
    filingStatus: 'SINGLE',
    MAGI: '',
  })
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [eligibility, setEligibility] = useState(null)
  const [calculation, setCalculation] = useState(null)

  // Auto-calculate monthly payment when loan details change
  useEffect(() => {
    // Skip auto-calculation if user has manually entered monthly payment
    if (loanData.manualMonthlyPayment) {
      return
    }
    
    const calculateMonthlyPayment = () => {
      const purchasePrice = parseFloat(loanData.purchasePrice)
      const downPayment = parseFloat(loanData.downPayment) || 0
      const apr = parseFloat(loanData.APR)
      
      // Get loan term - use custom if "other" is selected
      let loanTermMonths = null
      if (loanData.loanTermMonths === 'other') {
        loanTermMonths = parseInt(loanData.customLoanTermMonths)
      } else if (loanData.loanTermMonths) {
        loanTermMonths = parseInt(loanData.loanTermMonths)
    }
      
      // Only calculate if all required fields are present and valid
      if (purchasePrice && !isNaN(purchasePrice) && purchasePrice > 0 &&
          !isNaN(downPayment) && downPayment >= 0 &&
          apr && !isNaN(apr) && apr > 0 &&
          loanTermMonths && !isNaN(loanTermMonths) && loanTermMonths > 0) {
        
        const principal = purchasePrice - downPayment
        
        if (principal > 0) {
          // Monthly interest rate (APR / 12 / 100)
          const monthlyRate = apr / 12 / 100
          
          // Calculate monthly payment using standard loan formula
          // M = P * [r(1+r)^n] / [(1+r)^n - 1]
          const numerator = monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)
          const denominator = Math.pow(1 + monthlyRate, loanTermMonths) - 1
          const monthlyPayment = principal * (numerator / denominator)
          
          // Round to 2 decimal places
          const roundedPayment = Math.round(monthlyPayment * 100) / 100
          
          // Update monthly payment
          setLoanData(prev => ({ ...prev, monthlyPayment: roundedPayment.toFixed(2) }))
      } else {
          // Principal is 0 or negative, clear monthly payment
          setLoanData(prev => ({ ...prev, monthlyPayment: '' }))
        }
      } else {
        // Not all fields are valid, clear monthly payment
        setLoanData(prev => ({ ...prev, monthlyPayment: '' }))
      }
    }
    
    calculateMonthlyPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanData.purchasePrice, loanData.downPayment, loanData.APR, loanData.loanTermMonths, loanData.customLoanTermMonths])

  const handleVINDecode = async () => {
    if (!vehicleData.vin || vehicleData.vin.length < 11) {
      setError('VIN must be at least 11 characters')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      // Clean VIN - remove spaces and convert to uppercase
      const cleanVIN = vehicleData.vin.trim().toUpperCase().replace(/\s+/g, '')
      
      // Call NHTSA API directly
      const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${cleanVIN}?format=json`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`NHTSA API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (!data.Results || data.Results.length === 0) {
        throw new Error('No vehicle data found for this VIN')
      }
      
      // Parse response by VariableId
      const results = data.Results
      const makeItem = results.find(item => item.VariableId === 26)
      const modelItem = results.find(item => item.VariableId === 28)
      const modelYearItem = results.find(item => item.VariableId === 29)
      const plantCountryItem = results.find(item => item.VariableId === 75)
      
      // Check for errors in the response
      const errorItem = results.find(item => item.VariableId === 143) // Error Code
      if (errorItem && errorItem.Value && errorItem.Value !== '0') {
        const errorTextItem = results.find(item => item.VariableId === 191) // Error Text
        throw new Error(errorTextItem?.Value || 'Failed to decode VIN')
      }
      
      const updatedVehicleData = {
        ...vehicleData,
        vin: cleanVIN,
        make: makeItem?.Value || '',
        model: modelItem?.Value || '',
        modelYear: modelYearItem?.Value || '',
        plantCountry: plantCountryItem?.Value || null,
        assembledInUSA: plantCountryItem?.Value === 'UNITED STATES (USA)',
        }
      
      setVehicleData(updatedVehicleData)
      setCurrentStep(2) // Move to confirmation step
    } catch (err) {
      setError(err.message || 'Failed to decode VIN')
    } finally {
      setLoading(false)
    }
  }

  // Auto-check eligibility when entering step 4
  useEffect(() => {
    const checkEligibility = async () => {
      if (currentStep === 4 && vehicleData.purchaseDate && vehicleData.make && vehicleData.model && !eligibility && !loading) {
    try {
      setLoading(true)
      setError('')
      
      const loanStartDate = loanData.loanStartDate || vehicleData.purchaseDate

      const eligibilityResult = await checkVehicleEligibility(
        {
          ...vehicleData,
          purchaseDate: vehicleData.purchaseDate,
        },
        {
          ...loanData,
          loanStartDate,
          taxYear: parseInt(taxData.taxYear),
        }
      )

      setEligibility(eligibilityResult)
    } catch (err) {
      console.error('Eligibility check error:', err)
      setError(err.message || 'Failed to check eligibility')
    } finally {
      setLoading(false)
    }
  }
    }
    
    checkEligibility()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  const renderStep0 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink mb-6">Is Vehicle Leased?</h2>
      
      {isLeased === true && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Leased vehicles are not subject for interest deductible</h3>
          <p className="text-sm text-red-700">
            Only vehicles purchased with a loan are eligible for the interest deduction. 
            Leased vehicles do not qualify for this tax benefit.
          </p>
        </div>
      )}
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => {
            setIsLeased(true)
          }}
          className={`px-8 py-4 text-lg font-medium rounded-lg border-2 transition-all ${
            isLeased === true
              ? 'bg-red-100 border-red-500 text-red-800'
              : 'bg-white border-slate-300 text-slate-700 hover:border-ink hover:bg-stone-50'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => {
            setIsLeased(false)
            setCurrentStep(1)
          }}
          className={`px-8 py-4 text-lg font-medium rounded-lg border-2 transition-all ${
            isLeased === false
              ? 'bg-green-100 border-green-500 text-green-800'
              : 'bg-white border-slate-300 text-slate-700 hover:border-ink hover:bg-stone-50'
          }`}
        >
          No
        </button>
      </div>
    </div>
  )

  const handleCalculate = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validate loan data
      if (!loanData.purchasePrice || !loanData.APR) {
        setError('Please fill in all required loan information')
        return
      }

      if (!loanData.loanTermMonths || (loanData.loanTermMonths === 'other' && !loanData.customLoanTermMonths)) {
        setError('Please select or enter a loan term')
        return
      }

      // Use custom loan term if "other" is selected, otherwise use the selected value
      const loanTermMonths = loanData.loanTermMonths === 'other' 
        ? parseInt(loanData.customLoanTermMonths) 
        : parseInt(loanData.loanTermMonths)

      if (isNaN(loanTermMonths) || loanTermMonths <= 0) {
        setError('Please enter a valid loan term')
        return
      }

      const result = await calculateVehicleInterest(
        vehicleData,
        {
          ...loanData,
          purchasePrice: parseFloat(loanData.purchasePrice),
          downPayment: parseFloat(loanData.downPayment) || 0,
          loanTermMonths: loanTermMonths,
          APR: parseFloat(loanData.APR),
          monthlyPayment: loanData.monthlyPayment ? parseFloat(loanData.monthlyPayment) : null,
          loanStartDate: loanData.loanStartDate || vehicleData.purchaseDate,
        },
        {
          taxYear: parseInt(taxData.taxYear),
          filingStatus: taxData.filingStatus,
          MAGI: taxData.MAGI ? parseFloat(taxData.MAGI) : 0,
        }
      )

      setCalculation(result)
      setCurrentStep(6) // Step 6 is results
    } catch (err) {
      setError(err.message || 'Failed to calculate interest deduction')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink mb-6">Enter Your Vehicle Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">VIN *</label>
          <input
            type="text"
            value={vehicleData.vin}
            onChange={(e) => setVehicleData({ ...vehicleData, vin: e.target.value.toUpperCase() })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink font-mono"
            placeholder="1HGBH41JXMN109186"
            maxLength={17}
          />
          <p className="text-xs text-slate-500 mt-1">17-character Vehicle Identification Number</p>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setCurrentStep(0)}
          className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
        >
          ← Back
        </button>
        <button
          onClick={handleVINDecode}
          disabled={!vehicleData.vin || vehicleData.vin.length < 11 || loading}
          className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Decoding...' : 'Decode VIN →'}
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => {
    const handleContinue = () => {
      // Check Model Year - must be 2025 or later
      const modelYearNum = parseInt(vehicleData.modelYear)
      if (!vehicleData.modelYear || isNaN(modelYearNum) || modelYearNum < 2025) {
        setError('Your vehicle is not eligible. The vehicle model year must be 2025 or later for interest deduction.')
        return
      }
      
      // Check Plant Country
      if (vehicleData.plantCountry !== 'UNITED STATES (USA)') {
        setError('Your vehicle is not eligible. The vehicle must be assembled in the United States.')
        return
      }
      
      // All checks passed, proceed to purchase date step
      setError('')
      setCurrentStep(3)
    }
    
      return (
        <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-ink mb-6">Confirm Vehicle Information</h2>
          
        <div className="bg-stone-50 border border-slate-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-slate-700 mb-4">Decoded Vehicle Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Make:</span>
              <span className="font-semibold text-slate-800">{vehicleData.make || 'N/A'}</span>
              </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Model:</span>
              <span className="font-semibold text-slate-800">{vehicleData.model || 'N/A'}</span>
                </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-slate-600">Model Year:</span>
              <span className="font-semibold text-slate-800">{vehicleData.modelYear || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">VIN:</span>
              <span className="font-mono font-semibold text-slate-800">{vehicleData.vin}</span>
            </div>
          </div>
            </div>
            
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Please verify that the vehicle information above is correct. If it's incorrect, you can go back and re-enter your VIN.
          </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
            >
              ← Back
            </button>
            <button
            onClick={handleContinue}
            className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
            >
            Continue →
            </button>
          </div>
        </div>
      )
    }
    
  const renderStep3 = () => {
    const handlePurchaseDateSubmit = () => {
      if (!vehicleData.purchaseDate) {
        setError('Please enter the purchase date')
        return
      }
      
      const purchaseDate = new Date(vehicleData.purchaseDate)
      const minDate = new Date('2025-01-01')
      const maxDate = new Date('2025-12-31')
      
      if (purchaseDate < minDate || purchaseDate > maxDate) {
        setError('Purchase date must be between January 1, 2025 and December 31, 2025')
        return
      }
      
      setError('')
      setCurrentStep(4) // Move to eligibility check
    }
    
      return (
        <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-ink mb-6">Enter Purchase Date</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date *</label>
              <input
                type="date"
                value={vehicleData.purchaseDate}
              onChange={(e) => {
                setVehicleData({ ...vehicleData, purchaseDate: e.target.value })
                setError('')
              }}
                min="2025-01-01"
              max="2025-12-31"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
              />
            <p className="text-xs text-slate-500 mt-1">Must be between January 1, 2025 and December 31, 2025</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
            onClick={() => setCurrentStep(2)}
              className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
            >
              ← Back
            </button>
            <button
            onClick={handlePurchaseDateSubmit}
            disabled={!vehicleData.purchaseDate || loading}
              className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Continue →
            </button>
          </div>
        </div>
      )
    }
    
  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink mb-6">Eligibility Check</h2>
      
      {eligibility && !eligibility.eligible && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-red-800 mb-3">Not Eligible</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            {eligibility.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
          {eligibility.warnings.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-red-800 mb-2">Warnings:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {eligibility.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {eligibility && eligibility.eligible && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">✓ Eligible for Interest Deduction</h3>
          <p className="text-sm text-green-700 mb-3">
            Your vehicle meets the eligibility requirements. Continue to enter loan information.
          </p>
          {eligibility.warnings && eligibility.warnings.length > 0 && (
            <div className="mt-4 pt-4 border-t border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Important Notes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {eligibility.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {eligibility && !eligibility.eligible && eligibility.warnings && eligibility.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-yellow-800 mb-2">Additional Warnings:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {eligibility.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {!eligibility && loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <p className="text-sm text-slate-600">Checking eligibility...</p>
        </div>
      )}
      
      {!eligibility && !loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <p className="text-sm text-slate-600">Checking eligibility...</p>
        </div>
      )}
      
      {eligibility && eligibility.eligible && (
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(5)}
            className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
          >
            Continue to Loan Info →
          </button>
        </div>
      )}
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink mb-6">Loan Information</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Price ($) *</label>
          <input
            type="number"
            value={loanData.purchasePrice}
            onChange={(e) => setLoanData({ ...loanData, purchasePrice: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            placeholder="50000"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Down Payment ($)</label>
          <input
            type="number"
            value={loanData.downPayment}
            onChange={(e) => setLoanData({ ...loanData, downPayment: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            placeholder="5000"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Loan Term (Months) *</label>
          <select
            value={loanData.loanTermMonths === 'other' ? 'other' : loanData.loanTermMonths}
            onChange={(e) => {
              if (e.target.value === 'other') {
                setLoanData({ ...loanData, loanTermMonths: 'other' })
              } else {
                setLoanData({ ...loanData, loanTermMonths: e.target.value })
              }
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
          >
            <option value="">Select Loan Term</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
            <option value="48">48 months</option>
            <option value="60">60 months</option>
            <option value="72">72 months</option>
            <option value="84">84 months</option>
            <option value="other">Other</option>
          </select>
          {loanData.loanTermMonths === 'other' && (
            <div className="mt-2">
          <input
            type="number"
                value={loanData.customLoanTermMonths || ''}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || (parseInt(value) > 0 && parseInt(value) < 100)) {
                    setLoanData({ ...loanData, customLoanTermMonths: value })
                  }
                }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="Enter months (less than 100)"
                min="1"
                max="99"
          />
              <p className="text-xs text-slate-500 mt-1">Must be less than 100 months</p>
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">APR (%) *</label>
          <input
            type="number"
            value={loanData.APR}
            onChange={(e) => setLoanData({ ...loanData, APR: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            placeholder="5.5"
            min="0"
            max="30"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Payment ($)</label>
          <input
            type="number"
            value={loanData.monthlyPayment}
            onChange={(e) => {
              setLoanData({ 
                ...loanData, 
                monthlyPayment: e.target.value,
                manualMonthlyPayment: true // Mark as manually entered
              })
            }}
            onBlur={(e) => {
              // If user clears the field, allow auto-calculation again
              if (!e.target.value) {
                setLoanData(prev => ({ ...prev, manualMonthlyPayment: false }))
              }
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            placeholder="Auto-calculated"
            min="0"
            step="0.01"
          />
          <p className="text-xs text-slate-500 mt-1">
            {loanData.manualMonthlyPayment 
              ? 'Manually entered - clear to recalculate automatically' 
              : 'Auto-calculated from loan details'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Loan Start Date *</label>
          <input
            type="date"
            value={loanData.loanStartDate}
            onChange={(e) => setLoanData({ ...loanData, loanStartDate: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            min="2025-01-01"
          />
        </div>
      </div>
      
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="personalUse"
            checked={loanData.personalUse}
            onChange={(e) => setLoanData({ ...loanData, personalUse: e.target.checked })}
            className="w-4 h-4 text-ink border-slate-300 rounded focus:ring-ink"
          />
          <label htmlFor="personalUse" className="text-sm text-slate-700">
            Vehicle is for personal use *
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="securedByLien"
            checked={loanData.securedByLien}
            onChange={(e) => setLoanData({ ...loanData, securedByLien: e.target.checked })}
            className="w-4 h-4 text-ink border-slate-300 rounded focus:ring-ink"
          />
          <label htmlFor="securedByLien" className="text-sm text-slate-700">
            Loan is secured by a lien on the vehicle *
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isNewVehicle"
            checked={!loanData.isUsedVehicle}
            onChange={(e) => setLoanData({ ...loanData, isUsedVehicle: !e.target.checked })}
            className="w-4 h-4 text-ink border-slate-300 rounded focus:ring-ink"
          />
          <label htmlFor="isNewVehicle" className="text-sm text-slate-700">
            Vehicle is new (not used) *
          </label>
        </div>
      </div>
      
      <div className="bg-stone-50 border border-slate-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-sm text-slate-700 mb-2">Tax Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tax Year</label>
            <input
              type="number"
              value={taxData.taxYear}
              onChange={(e) => setTaxData({ ...taxData, taxYear: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
              min="2025"
              max="2028"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filing Status</label>
            <select
              value={taxData.filingStatus}
              onChange={(e) => setTaxData({ ...taxData, filingStatus: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            >
              <option value="SINGLE">Single</option>
              <option value="MARRIED_JOINT">Married Filing Jointly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">MAGI ($)</label>
            <input
              type="number"
              value={taxData.MAGI}
              onChange={(e) => setTaxData({ ...taxData, MAGI: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
              placeholder="For phaseout calculation"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setCurrentStep(4)}
          className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
        >
          ← Back
        </button>
        <button
          onClick={handleCalculate}
          disabled={
            !loanData.purchasePrice || 
            !loanData.APR || 
            !loanData.loanTermMonths || 
            (loanData.loanTermMonths === 'other' && !loanData.customLoanTermMonths) ||
            loading
          }
          className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculating...' : 'Calculate Deduction →'}
        </button>
      </div>
    </div>
  )

  const renderStep6 = () => {
    if (!calculation) return null

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-ink mb-6">Interest Deduction Results</h2>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-lg text-green-800 mb-4">Your Vehicle Loan Interest Deduction</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-slate-700">Vehicle:</span>
              <span className="font-semibold">{calculation.vehicle.make} {calculation.vehicle.model} ({calculation.vehicle.modelYear})</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-slate-700">Tax Year:</span>
              <span className="font-semibold">{calculation.calculation.taxYear}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-slate-700">Total Interest Paid in {calculation.calculation.taxYear}:</span>
              <span className="font-semibold">${calculation.calculation.totalInterestForYear.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            {calculation.calculation.phaseoutReduction > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-green-200">
                <span className="text-slate-700">Phaseout Reduction:</span>
                <span className="font-semibold text-red-600">-${calculation.calculation.phaseoutReduction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 mt-4">
              <span className="text-lg font-semibold text-ink">Deductible Interest:</span>
              <span className="text-2xl font-bold text-green-600">${calculation.calculation.deductibleInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-stone-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-slate-700 mb-2">Loan Details</h4>
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-600">Principal:</span>
              <span className="font-semibold ml-2">${calculation.loan.principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-slate-600">Monthly Payment:</span>
              <span className="font-semibold ml-2">${calculation.loan.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-slate-600">Remaining Balance:</span>
              <span className="font-semibold ml-2">${calculation.calculation.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This is an estimate based on the information provided. 
            Please consult with a tax professional for accurate tax filing. The maximum deduction is $10,000 per year.
          </p>
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              setCurrentStep(0)
              setIsLeased(null)
              setInputMethod(null)
              setVehicleData({ vin: '', make: '', model: '', modelYear: '', purchaseDate: '', assembledInUSA: null, plantCountry: null })
              setLoanData({ purchasePrice: '', downPayment: '', loanTermMonths: '', customLoanTermMonths: '', APR: '', monthlyPayment: '', manualMonthlyPayment: false, loanStartDate: '', isLease: false, personalUse: true, securedByLien: true, isUsedVehicle: false })
              setTaxData({ taxYear: new Date().getFullYear().toString(), filingStatus: 'SINGLE', MAGI: '' })
              setEligibility(null)
              setCalculation(null)
              setError('')
            }}
            className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
          >
            Start Over
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-ink mb-3">Vehicle Loan Interest Calculator</h1>
          <p className="text-xl text-slate-700">
            Calculate your tax deduction for vehicle loan interest
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
        </div>
      </main>
    </div>
  )
}

export default TaxCalculator

