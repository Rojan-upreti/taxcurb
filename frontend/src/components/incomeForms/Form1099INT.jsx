import React, { useState, useEffect } from 'react'
import QuestionCard from '../QuestionCard'

function Form1099INT({ data = {}, onChange, onValidationChange }) {
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
    // Box 1 - Interest income
    interestIncome: data.interestIncome || '',
    // Box 2 - Early withdrawal penalty
    earlyWithdrawalPenalty: data.earlyWithdrawalPenalty || '',
    // Box 3 - Interest on U.S. Savings Bonds and Treasury obligations
    interestOnUSBonds: data.interestOnUSBonds || '',
    // Box 4 - Federal income tax withheld
    federalIncomeTax: data.federalIncomeTax || '',
    // Box 5 - Market discount
    marketDiscount: data.marketDiscount || '',
    // Box 6 - Bond premium on tax-exempt bond
    bondPremiumTaxExempt: data.bondPremiumTaxExempt || '',
    // Box 7 - Bond premium on taxable bond
    bondPremiumTaxable: data.bondPremiumTaxable || '',
    // Box 8 - Tax-exempt interest
    taxExemptInterest: data.taxExemptInterest || '',
    // Box 9 - Specified private activity bond interest
    specifiedPrivateActivityBondInterest: data.specifiedPrivateActivityBondInterest || '',
    // Box 10 - State
    state: data.state || '',
    // Box 11 - State identification number
    stateIdentificationNumber: data.stateIdentificationNumber || '',
    // Box 12 - State income tax withheld
    stateIncomeTax: data.stateIncomeTax || '',
    // Box 13 - Foreign tax paid
    foreignTaxPaid: data.foreignTaxPaid || '',
    // Box 14 - Foreign country or U.S. possession
    foreignCountry: data.foreignCountry || ''
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

      {/* Interest Income Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Interest Income Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 1 - Interest income
            </label>
            <input
              type="text"
              value={formData.interestIncome}
              onChange={(e) => handleChange('interestIncome', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 2 - Early withdrawal penalty
            </label>
            <input
              type="text"
              value={formData.earlyWithdrawalPenalty}
              onChange={(e) => handleChange('earlyWithdrawalPenalty', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 3 - Interest on U.S. Savings Bonds and Treasury obligations
            </label>
            <input
              type="text"
              value={formData.interestOnUSBonds}
              onChange={(e) => handleChange('interestOnUSBonds', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 5 - Market discount
              </label>
              <input
                type="text"
                value={formData.marketDiscount}
                onChange={(e) => handleChange('marketDiscount', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 6 - Bond premium on tax-exempt bond
              </label>
              <input
                type="text"
                value={formData.bondPremiumTaxExempt}
                onChange={(e) => handleChange('bondPremiumTaxExempt', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 7 - Bond premium on taxable bond
            </label>
            <input
              type="text"
              value={formData.bondPremiumTaxable}
              onChange={(e) => handleChange('bondPremiumTaxable', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 8 - Tax-exempt interest
            </label>
            <input
              type="text"
              value={formData.taxExemptInterest}
              onChange={(e) => handleChange('taxExemptInterest', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 9 - Specified private activity bond interest
            </label>
            <input
              type="text"
              value={formData.specifiedPrivateActivityBondInterest}
              onChange={(e) => handleChange('specifiedPrivateActivityBondInterest', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
        </div>
      </QuestionCard>

      {/* Tax Withholding and Foreign Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Tax Withholding and Foreign Information</h3>
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 10 - State
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
                Box 11 - State identification number
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
                Box 12 - State income tax withheld
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 13 - Foreign tax paid
              </label>
              <input
                type="text"
                value={formData.foreignTaxPaid}
                onChange={(e) => handleChange('foreignTaxPaid', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 14 - Foreign country or U.S. possession
              </label>
              <input
                type="text"
                value={formData.foreignCountry}
                onChange={(e) => handleChange('foreignCountry', e.target.value)}
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
        </div>
      </QuestionCard>
    </div>
  )
}

export default Form1099INT

