import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { 
  decodeVIN, 
  checkVehicleEligibility, 
  calculateVehicleInterest,
  getVehicleMakes,
  getVehicleModels 
} from '../services/vehicleService'

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]

function TaxCalculator() {
  const navigate = useNavigate()
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const [inputMethod, setInputMethod] = useState(null) // 'manual', 'vin', 'plate'
  
  // Vehicle data
  const [vehicleData, setVehicleData] = useState({
    vin: '',
    make: '',
    model: '',
    modelYear: '',
    purchaseDate: '',
    assembledInUSA: null,
  })
  
  // Loan data
  const [loanData, setLoanData] = useState({
    purchasePrice: '',
    downPayment: '',
    loanTermMonths: '',
    APR: '',
    monthlyPayment: '',
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
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])
  const [loadingMakes, setLoadingMakes] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)

  // Load makes on mount
  useEffect(() => {
    loadMakes()
  }, [])

  // Load models when make and year change
  useEffect(() => {
    if (vehicleData.make && vehicleData.modelYear && inputMethod === 'manual') {
      loadModels(vehicleData.make, vehicleData.modelYear)
    }
  }, [vehicleData.make, vehicleData.modelYear, inputMethod])

  const loadMakes = async () => {
    try {
      setLoadingMakes(true)
      setError('')
      const makesList = await getVehicleMakes()
      console.log('Loaded makes:', makesList.length)
      if (makesList && makesList.length > 0) {
        setMakes(makesList)
      } else {
        setError('No vehicle makes found. Please try again or use VIN entry.')
      }
    } catch (err) {
      console.error('Error loading makes:', err)
      setError(`Failed to load vehicle makes: ${err.message}. Please try again or use VIN entry.`)
      setMakes([])
    } finally {
      setLoadingMakes(false)
    }
  }

  const loadModels = async (make, year) => {
    try {
      setLoadingModels(true)
      setError('')
      const modelsList = await getVehicleModels(make, parseInt(year))
      console.log(`Loaded models for ${make} ${year}:`, modelsList.length)
      setModels(modelsList || [])
      if (!modelsList || modelsList.length === 0) {
        setError(`No models found for ${make} ${year}. Please verify the make and year.`)
      }
    } catch (err) {
      console.error('Error loading models:', err)
      setError(`Failed to load models: ${err.message}`)
      setModels([])
    } finally {
      setLoadingModels(false)
    }
  }

  const handleInputMethodSelect = (method) => {
    setInputMethod(method)
    setCurrentStep(2)
    setError('')
    // Reload makes if manual entry is selected and makes list is empty
    if (method === 'manual' && makes.length === 0 && !loadingMakes) {
      loadMakes()
    }
  }

  const handleVINDecode = async () => {
    if (!vehicleData.vin || vehicleData.vin.length < 11) {
      setError('VIN must be at least 11 characters')
      return
    }

    if (!vehicleData.purchaseDate) {
      setError('Please enter the purchase date')
      return
    }

    try {
      setLoading(true)
      setError('')
      const decoded = await decodeVIN(vehicleData.vin, vehicleData.modelYear || null)
      
      const updatedVehicleData = {
        ...vehicleData,
        make: decoded.make || '',
        model: decoded.model || '',
        modelYear: decoded.modelYear || '',
        assembledInUSA: decoded.assembledInUSA,
      }
      
      setVehicleData(updatedVehicleData)
      
      // Check basic eligibility after VIN decode (vehicle-level checks only)
      const eligibilityResult = await checkVehicleEligibility(
        updatedVehicleData,
        {
          taxYear: parseInt(taxData.taxYear),
        }
      )
      
      setEligibility(eligibilityResult)
      setCurrentStep(3)
    } catch (err) {
      setError(err.message || 'Failed to decode VIN')
    } finally {
      setLoading(false)
    }
  }

  const handlePlateLookup = async () => {
    // Note: Plate lookup would require a third-party API
    // For now, we'll show an error message
    setError('License plate lookup is not yet available. Please use VIN or manual entry.')
  }

  const handleCheckEligibility = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validate required fields
      if (!vehicleData.purchaseDate) {
        setError('Please enter the purchase date')
        setLoading(false)
        return
      }

      if (!vehicleData.make || !vehicleData.model || !vehicleData.modelYear) {
        setError('Please fill in all vehicle information (make, model, and year)')
        setLoading(false)
        return
      }

      const purchaseDate = new Date(vehicleData.purchaseDate)
      const loanStartDate = loanData.loanStartDate || vehicleData.purchaseDate

      console.log('Checking eligibility with:', {
        vehicleData,
        loanData: { ...loanData, loanStartDate, taxYear: parseInt(taxData.taxYear) }
      })

      const eligibilityResult = await checkVehicleEligibility(
        {
          ...vehicleData,
          purchaseDate: vehicleData.purchaseDate,
          // For manual entry, we don't have assembledInUSA, so we'll need to check it differently
          // or assume it needs to be verified separately
        },
        {
          ...loanData,
          loanStartDate,
          taxYear: parseInt(taxData.taxYear),
        }
      )

      console.log('Eligibility result:', eligibilityResult)

      setEligibility(eligibilityResult)
      
      // Always move to step 3 to show results, even if not eligible
      setCurrentStep(3)
    } catch (err) {
      console.error('Eligibility check error:', err)
      setError(err.message || 'Failed to check eligibility')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculate = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Validate loan data
      if (!loanData.purchasePrice || !loanData.loanTermMonths || !loanData.APR) {
        setError('Please fill in all required loan information')
        return
      }

      const result = await calculateVehicleInterest(
        vehicleData,
        {
          ...loanData,
          purchasePrice: parseFloat(loanData.purchasePrice),
          downPayment: parseFloat(loanData.downPayment) || 0,
          loanTermMonths: parseInt(loanData.loanTermMonths),
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
      setCurrentStep(5)
    } catch (err) {
      setError(err.message || 'Failed to calculate interest deduction')
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-ink mb-6">How would you like to enter your vehicle?</h2>
      
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => handleInputMethodSelect('manual')}
          className="p-6 border-2 border-slate-300 rounded-lg hover:border-ink hover:bg-stone-50 transition-all text-left"
        >
          <h3 className="font-semibold text-lg mb-2">Manual Entry</h3>
          <p className="text-sm text-slate-600">Select make, model, and year manually</p>
        </button>
        
        <button
          onClick={() => handleInputMethodSelect('vin')}
          className="p-6 border-2 border-slate-300 rounded-lg hover:border-ink hover:bg-stone-50 transition-all text-left"
        >
          <h3 className="font-semibold text-lg mb-2">VIN Number</h3>
          <p className="text-sm text-slate-600">Enter your Vehicle Identification Number</p>
        </button>
        
        <button
          onClick={() => handleInputMethodSelect('plate')}
          className="p-6 border-2 border-slate-300 rounded-lg hover:border-ink hover:bg-stone-50 transition-all text-left"
        >
          <h3 className="font-semibold text-lg mb-2">License Plate</h3>
          <p className="text-sm text-slate-600">Enter plate number and state</p>
        </button>
      </div>
    </div>
  )

  const renderStep2 = () => {
    if (inputMethod === 'manual') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink mb-6">Enter Vehicle Information</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Make *</label>
                {!loadingMakes && makes.length === 0 && (
                  <button
                    onClick={loadMakes}
                    className="text-xs text-ink hover:underline"
                    type="button"
                  >
                    Retry
                  </button>
                )}
              </div>
              <select
                value={vehicleData.make}
                onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value, model: '' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                disabled={loadingMakes}
              >
                <option value="">
                  {loadingMakes ? 'Loading makes...' : makes.length === 0 ? 'No makes available - Click Retry' : 'Select Make'}
                </option>
                {makes.map(make => (
                  <option key={make.id} value={make.name}>{make.name}</option>
                ))}
              </select>
              {loadingMakes && (
                <p className="text-xs text-slate-500 mt-1">Loading vehicle makes from NHTSA API...</p>
              )}
              {!loadingMakes && makes.length === 0 && (
                <div className="mt-2">
                  <p className="text-xs text-red-600 mb-2">Unable to load makes. This might be due to:</p>
                  <ul className="text-xs text-red-600 list-disc list-inside space-y-1 mb-2">
                    <li>Backend server not running</li>
                    <li>Network connectivity issues</li>
                    <li>NHTSA API temporarily unavailable</li>
                  </ul>
                  <p className="text-xs text-slate-600">You can try clicking "Retry" above or use the VIN entry method instead.</p>
                </div>
              )}
              {!loadingMakes && makes.length > 0 && (
                <p className="text-xs text-green-600 mt-1">✓ {makes.length} makes loaded</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Model Year *</label>
              <input
                type="number"
                value={vehicleData.modelYear}
                onChange={(e) => setVehicleData({ ...vehicleData, modelYear: e.target.value, model: '' })}
                min="2025"
                max="2030"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="2025"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Model *</label>
              <select
                value={vehicleData.model}
                onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                disabled={loadingModels || !vehicleData.make || !vehicleData.modelYear}
              >
                <option value="">{loadingModels ? 'Loading...' : 'Select Model'}</option>
                {models.map(model => (
                  <option key={model.id} value={model.name}>{model.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date *</label>
              <input
                type="date"
                value={vehicleData.purchaseDate}
                onChange={(e) => setVehicleData({ ...vehicleData, purchaseDate: e.target.value })}
                min="2025-01-01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
              />
              <p className="text-xs text-slate-500 mt-1">Must be purchased in 2025 or later</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
            >
              ← Back
            </button>
            <button
              onClick={handleCheckEligibility}
              disabled={!vehicleData.make || !vehicleData.model || !vehicleData.modelYear || !vehicleData.purchaseDate || loading}
              className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check Eligibility →'}
            </button>
          </div>
        </div>
      )
    }
    
    if (inputMethod === 'vin') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink mb-6">Enter VIN Number</h2>
          
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
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Model Year (Optional)</label>
              <input
                type="number"
                value={vehicleData.modelYear}
                onChange={(e) => setVehicleData({ ...vehicleData, modelYear: e.target.value })}
                min="2025"
                max="2030"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="2025"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purchase Date *</label>
              <input
                type="date"
                value={vehicleData.purchaseDate}
                onChange={(e) => setVehicleData({ ...vehicleData, purchaseDate: e.target.value })}
                min="2025-01-01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
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
    }
    
    if (inputMethod === 'plate') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-ink mb-6">Enter License Plate</h2>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> License plate lookup requires a third-party API. 
              Please use VIN or manual entry for now.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">License Plate</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                placeholder="ABC1234"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
                disabled
              >
                <option value="">Select State</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
            >
              ← Back
            </button>
          </div>
        </div>
      )
    }
    
    return null
  }

  const renderStep3 = () => (
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
      
      {!eligibility && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6">
          <p className="text-sm text-slate-600">Click "Check Eligibility" to verify your vehicle's eligibility.</p>
        </div>
      )}
      
      {eligibility && eligibility.eligible && (
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full"
          >
            Continue to Loan Info →
          </button>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
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
          <input
            type="number"
            value={loanData.loanTermMonths}
            onChange={(e) => setLoanData({ ...loanData, loanTermMonths: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            placeholder="60"
            min="12"
            max="84"
          />
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
            onChange={(e) => setLoanData({ ...loanData, monthlyPayment: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ink focus:border-ink"
            placeholder="Auto-calculated if left blank"
            min="0"
            step="0.01"
          />
          <p className="text-xs text-slate-500 mt-1">Optional - will be calculated if not provided</p>
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
          onClick={() => setCurrentStep(3)}
          className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-ink border-2 border-slate-300 hover:border-ink transition-all rounded-full"
        >
          ← Back
        </button>
        <button
          onClick={handleCalculate}
          disabled={!loanData.purchasePrice || !loanData.loanTermMonths || !loanData.APR || loading}
          className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border-2 border-ink rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Calculating...' : 'Calculate Deduction →'}
        </button>
      </div>
    </div>
  )

  const renderStep5 = () => {
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
              setCurrentStep(1)
              setInputMethod(null)
              setVehicleData({ vin: '', make: '', model: '', modelYear: '', purchaseDate: '', assembledInUSA: null })
              setLoanData({ purchasePrice: '', downPayment: '', loanTermMonths: '', APR: '', monthlyPayment: '', loanStartDate: '', isLease: false, personalUse: true, securedByLien: true, isUsedVehicle: false })
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
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>
      </main>
    </div>
  )
}

export default TaxCalculator

