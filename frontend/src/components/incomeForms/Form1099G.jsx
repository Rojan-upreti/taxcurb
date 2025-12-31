import React, { useState, useEffect } from 'react'
import QuestionCard from '../QuestionCard'

function Form1099G({ data = {}, onChange, onValidationChange }) {
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
    // Box 1 - Unemployment compensation
    unemploymentCompensation: data.unemploymentCompensation || '',
    // Box 2 - State or local income tax refunds
    stateLocalTaxRefunds: data.stateLocalTaxRefunds || '',
    // Box 3 - Taxable grants
    taxableGrants: data.taxableGrants || '',
    // Box 4 - Agriculture payments
    agriculturePayments: data.agriculturePayments || '',
    // Box 5 - Trade or business income
    tradeOrBusinessIncome: data.tradeOrBusinessIncome || '',
    // Box 6 - Federal income tax withheld
    federalIncomeTax: data.federalIncomeTax || '',
    // Box 7 - State
    state: data.state || '',
    // Box 8 - State identification number
    stateIdentificationNumber: data.stateIdentificationNumber || '',
    // Box 9 - State income tax withheld
    stateIncomeTax: data.stateIncomeTax || ''
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

      {/* Payment Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Payment Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 1 - Unemployment compensation
            </label>
            <input
              type="text"
              value={formData.unemploymentCompensation}
              onChange={(e) => handleChange('unemploymentCompensation', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 2 - State or local income tax refunds
            </label>
            <input
              type="text"
              value={formData.stateLocalTaxRefunds}
              onChange={(e) => handleChange('stateLocalTaxRefunds', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 3 - Taxable grants
            </label>
            <input
              type="text"
              value={formData.taxableGrants}
              onChange={(e) => handleChange('taxableGrants', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 4 - Agriculture payments
            </label>
            <input
              type="text"
              value={formData.agriculturePayments}
              onChange={(e) => handleChange('agriculturePayments', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 5 - Trade or business income
            </label>
            <input
              type="text"
              value={formData.tradeOrBusinessIncome}
              onChange={(e) => handleChange('tradeOrBusinessIncome', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 6 - Federal income tax withheld
            </label>
            <input
              type="text"
              value={formData.federalIncomeTax}
              onChange={(e) => handleChange('federalIncomeTax', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 7 - State
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
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 8 - State identification number
              </label>
              <input
                type="text"
                value={formData.stateIdentificationNumber}
                onChange={(e) => handleChange('stateIdentificationNumber', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 9 - State income tax withheld
              </label>
              <input
                type="text"
                value={formData.stateIncomeTax}
                onChange={(e) => handleChange('stateIncomeTax', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
        </div>
      </QuestionCard>
    </div>
  )
}

export default Form1099G

