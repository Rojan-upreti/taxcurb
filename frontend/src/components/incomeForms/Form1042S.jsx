import React, { useState, useEffect } from 'react'
import QuestionCard from '../QuestionCard'

function Form1042S({ data = {}, onChange, onValidationChange }) {
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
    // Box 1 - Gross income
    grossIncome: data.grossIncome || '',
    // Box 2 - Federal tax withheld
    federalTaxWithheld: data.federalTaxWithheld || '',
    // Box 3 - Chapter 3 status code
    chapter3StatusCode: data.chapter3StatusCode || '',
    // Box 4 - Exemption code
    exemptionCode: data.exemptionCode || '',
    // Box 5 - Country code
    countryCode: data.countryCode || '',
    // Box 6 - Income code
    incomeCode: data.incomeCode || '',
    // Box 7 - Withholding allowance
    withholdingAllowance: data.withholdingAllowance || ''
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

      {/* Income and Tax Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Income and Tax Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 1 - Gross income
            </label>
            <input
              type="text"
              value={formData.grossIncome}
              onChange={(e) => handleChange('grossIncome', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 2 - Federal tax withheld
            </label>
            <input
              type="text"
              value={formData.federalTaxWithheld}
              onChange={(e) => handleChange('federalTaxWithheld', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 3 - Chapter 3 status code
              </label>
              <input
                type="text"
                value={formData.chapter3StatusCode}
                onChange={(e) => handleChange('chapter3StatusCode', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 4 - Exemption code
              </label>
              <input
                type="text"
                value={formData.exemptionCode}
                onChange={(e) => handleChange('exemptionCode', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 5 - Country code
              </label>
              <input
                type="text"
                value={formData.countryCode}
                onChange={(e) => handleChange('countryCode', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 6 - Income code
              </label>
              <input
                type="text"
                value={formData.incomeCode}
                onChange={(e) => handleChange('incomeCode', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 7 - Withholding allowance
            </label>
            <input
              type="text"
              value={formData.withholdingAllowance}
              onChange={(e) => handleChange('withholdingAllowance', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
        </div>
      </QuestionCard>
    </div>
  )
}

export default Form1042S

