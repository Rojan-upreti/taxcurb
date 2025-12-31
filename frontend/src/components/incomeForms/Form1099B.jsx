import React, { useState, useEffect } from 'react'
import QuestionCard from '../QuestionCard'

function Form1099B({ data = {}, onChange, onValidationChange }) {
  const [formData, setFormData] = useState({
    // Payer information
    payerName: data.payerName || '',
    payerAddress: data.payerAddress || '',
    payerCity: data.payerCity || '',
    payerState: data.payerState || '',
    payerZip: data.payerZip || '',
    payerTIN: data.payerTIN || '',
    // Recipient information
    recipientName: data.recipientName || '',
    recipientAddress: data.recipientAddress || '',
    recipientCity: data.recipientCity || '',
    recipientState: data.recipientState || '',
    recipientZip: data.recipientZip || '',
    recipientTIN: data.recipientTIN || '',
    // Box 1a - Description of property
    descriptionOfProperty: data.descriptionOfProperty || '',
    // Box 1b - Date acquired
    dateAcquired: data.dateAcquired || '',
    // Box 1c - Date sold or disposed
    dateSold: data.dateSold || '',
    // Box 1d - Proceeds
    proceeds: data.proceeds || '',
    // Box 1e - Cost or other basis
    costOrBasis: data.costOrBasis || '',
    // Box 1f - Accrued market discount
    accruedMarketDiscount: data.accruedMarketDiscount || '',
    // Box 1g - Wash sale loss disallowed
    washSaleLoss: data.washSaleLoss || '',
    // Box 2 - Short-term transactions
    shortTermTransactions: data.shortTermTransactions || '',
    // Box 3 - Long-term transactions
    longTermTransactions: data.longTermTransactions || '',
    // Box 4 - Federal income tax withheld
    federalIncomeTax: data.federalIncomeTax || '',
    // Box 5 - State tax withheld
    stateTaxWithheld: data.stateTaxWithheld || '',
    // Box 6 - State/Payer's state number
    state: data.state || '',
    payerStateNumber: data.payerStateNumber || ''
  })

  useEffect(() => {
    if (onChange) {
      onChange(formData)
    }
  }, [formData, onChange])

  useEffect(() => {
    if (onValidationChange) {
      const isValid = formData.payerName !== '' &&
        formData.payerTIN !== '' &&
        formData.recipientName !== '' &&
        formData.recipientTIN !== ''
      onValidationChange(isValid)
    }
  }, [formData, onValidationChange])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (value) => {
    const cleaned = value.replace(/[^\d.]/g, '')
    return cleaned
  }

  const formatTIN = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 9) {
      if (cleaned.length > 2) {
        return cleaned.slice(0, 2) + '-' + cleaned.slice(2)
      }
      return cleaned
    }
    return value
  }

  return (
    <div className="space-y-4">
      {/* Payer Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Payer Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Payer's Name *
            </label>
            <input
              type="text"
              value={formData.payerName}
              onChange={(e) => handleChange('payerName', e.target.value)}
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Payer's TIN (Tax Identification Number) *
            </label>
            <input
              type="text"
              value={formData.payerTIN}
              onChange={(e) => handleChange('payerTIN', formatTIN(e.target.value))}
              placeholder="XX-XXXXXXX"
              maxLength={11}
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Payer's Address
            </label>
            <input
              type="text"
              value={formData.payerAddress}
              onChange={(e) => handleChange('payerAddress', e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.payerCity}
                onChange={(e) => handleChange('payerCity', e.target.value)}
                placeholder="City"
                className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
              <input
                type="text"
                value={formData.payerState}
                onChange={(e) => handleChange('payerState', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="State"
                maxLength={2}
                className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <input
              type="text"
              value={formData.payerZip}
              onChange={(e) => handleChange('payerZip', e.target.value)}
              placeholder="ZIP code"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mt-2"
            />
          </div>
        </div>
      </QuestionCard>

      {/* Recipient Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Recipient Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Recipient's Name *
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => handleChange('recipientName', e.target.value)}
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Recipient's TIN (Tax Identification Number) *
            </label>
            <input
              type="text"
              value={formData.recipientTIN}
              onChange={(e) => handleChange('recipientTIN', formatTIN(e.target.value))}
              placeholder="XX-XXXXXXX"
              maxLength={11}
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Recipient's Address
            </label>
            <input
              type="text"
              value={formData.recipientAddress}
              onChange={(e) => handleChange('recipientAddress', e.target.value)}
              placeholder="Street address"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={formData.recipientCity}
                onChange={(e) => handleChange('recipientCity', e.target.value)}
                placeholder="City"
                className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
              <input
                type="text"
                value={formData.recipientState}
                onChange={(e) => handleChange('recipientState', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="State"
                maxLength={2}
                className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <input
              type="text"
              value={formData.recipientZip}
              onChange={(e) => handleChange('recipientZip', e.target.value)}
              placeholder="ZIP code"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mt-2"
            />
          </div>
        </div>
      </QuestionCard>

      {/* Transaction Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Transaction Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 1a - Description of property
            </label>
            <input
              type="text"
              value={formData.descriptionOfProperty}
              onChange={(e) => handleChange('descriptionOfProperty', e.target.value)}
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1b - Date acquired
              </label>
              <input
                type="date"
                value={formData.dateAcquired}
                onChange={(e) => handleChange('dateAcquired', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1c - Date sold or disposed
              </label>
              <input
                type="date"
                value={formData.dateSold}
                onChange={(e) => handleChange('dateSold', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1d - Proceeds
              </label>
              <input
                type="text"
                value={formData.proceeds}
                onChange={(e) => handleChange('proceeds', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1e - Cost or other basis
              </label>
              <input
                type="text"
                value={formData.costOrBasis}
                onChange={(e) => handleChange('costOrBasis', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1f - Accrued market discount
              </label>
              <input
                type="text"
                value={formData.accruedMarketDiscount}
                onChange={(e) => handleChange('accruedMarketDiscount', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1g - Wash sale loss disallowed
              </label>
              <input
                type="text"
                value={formData.washSaleLoss}
                onChange={(e) => handleChange('washSaleLoss', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 2 - Short-term transactions
              </label>
              <input
                type="text"
                value={formData.shortTermTransactions}
                onChange={(e) => handleChange('shortTermTransactions', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 3 - Long-term transactions
              </label>
              <input
                type="text"
                value={formData.longTermTransactions}
                onChange={(e) => handleChange('longTermTransactions', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* Tax Withholding Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Tax Withholding Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 4 - Federal income tax withheld
            </label>
            <input
              type="text"
              value={formData.federalIncomeTax}
              onChange={(e) => handleChange('federalIncomeTax', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 5 - State tax withheld
              </label>
              <input
                type="text"
                value={formData.stateTaxWithheld}
                onChange={(e) => handleChange('stateTaxWithheld', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 6 - State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))}
                placeholder="State"
                maxLength={2}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 6 - Payer's state number
            </label>
            <input
              type="text"
              value={formData.payerStateNumber}
              onChange={(e) => handleChange('payerStateNumber', e.target.value)}
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
        </div>
      </QuestionCard>
    </div>
  )
}

export default Form1099B

