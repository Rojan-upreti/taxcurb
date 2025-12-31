import React, { useState, useEffect } from 'react'
import QuestionCard from '../QuestionCard'

function Form1099DIV({ data = {}, onChange, onValidationChange }) {
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
    // Box 1a - Total ordinary dividends
    totalOrdinaryDividends: data.totalOrdinaryDividends || '',
    // Box 1b - Qualified dividends
    qualifiedDividends: data.qualifiedDividends || '',
    // Box 2a - Total capital gain distributions
    totalCapitalGainDistributions: data.totalCapitalGainDistributions || '',
    // Box 2b - Unrecaptured section 1250 gain
    unrecapturedSection1250Gain: data.unrecapturedSection1250Gain || '',
    // Box 2c - Section 1202 gain
    section1202Gain: data.section1202Gain || '',
    // Box 2d - Section 897 ordinary dividends
    section897OrdinaryDividends: data.section897OrdinaryDividends || '',
    // Box 2e - Section 897 capital gain
    section897CapitalGain: data.section897CapitalGain || '',
    // Box 3 - Nondividend distributions
    nondividendDistributions: data.nondividendDistributions || '',
    // Box 4 - Federal income tax withheld
    federalIncomeTax: data.federalIncomeTax || '',
    // Box 5 - Section 199A dividends
    section199ADividends: data.section199ADividends || '',
    // Box 6 - Investment expenses
    investmentExpenses: data.investmentExpenses || '',
    // Box 7 - Foreign tax paid
    foreignTaxPaid: data.foreignTaxPaid || '',
    // Box 8 - Foreign country or U.S. possession
    foreignCountry: data.foreignCountry || '',
    // Box 9 - Cash liquidation distributions
    cashLiquidationDistributions: data.cashLiquidationDistributions || '',
    // Box 10 - Noncash liquidation distributions
    noncashLiquidationDistributions: data.noncashLiquidationDistributions || '',
    // Box 11 - Exempt-interest dividends
    exemptInterestDividends: data.exemptInterestDividends || ''
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

      {/* Dividend Information */}
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Dividend Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1a - Total ordinary dividends
              </label>
              <input
                type="text"
                value={formData.totalOrdinaryDividends}
                onChange={(e) => handleChange('totalOrdinaryDividends', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 1b - Qualified dividends
              </label>
              <input
                type="text"
                value={formData.qualifiedDividends}
                onChange={(e) => handleChange('qualifiedDividends', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 2a - Total capital gain distributions
            </label>
            <input
              type="text"
              value={formData.totalCapitalGainDistributions}
              onChange={(e) => handleChange('totalCapitalGainDistributions', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 2b - Unrecaptured section 1250 gain
              </label>
              <input
                type="text"
                value={formData.unrecapturedSection1250Gain}
                onChange={(e) => handleChange('unrecapturedSection1250Gain', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 2c - Section 1202 gain
              </label>
              <input
                type="text"
                value={formData.section1202Gain}
                onChange={(e) => handleChange('section1202Gain', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 2d - Section 897 ordinary dividends
              </label>
              <input
                type="text"
                value={formData.section897OrdinaryDividends}
                onChange={(e) => handleChange('section897OrdinaryDividends', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 2e - Section 897 capital gain
              </label>
              <input
                type="text"
                value={formData.section897CapitalGain}
                onChange={(e) => handleChange('section897CapitalGain', formatCurrency(e.target.value))}
                placeholder="0.00"
                className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 3 - Nondividend distributions
            </label>
            <input
              type="text"
              value={formData.nondividendDistributions}
              onChange={(e) => handleChange('nondividendDistributions', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 5 - Section 199A dividends
            </label>
            <input
              type="text"
              value={formData.section199ADividends}
              onChange={(e) => handleChange('section199ADividends', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 6 - Investment expenses
            </label>
            <input
              type="text"
              value={formData.investmentExpenses}
              onChange={(e) => handleChange('investmentExpenses', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 9 - Cash liquidation distributions
            </label>
            <input
              type="text"
              value={formData.cashLiquidationDistributions}
              onChange={(e) => handleChange('cashLiquidationDistributions', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 10 - Noncash liquidation distributions
            </label>
            <input
              type="text"
              value={formData.noncashLiquidationDistributions}
              onChange={(e) => handleChange('noncashLiquidationDistributions', formatCurrency(e.target.value))}
              placeholder="0.00"
              className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">
              Box 11 - Exempt-interest dividends
            </label>
            <input
              type="text"
              value={formData.exemptInterestDividends}
              onChange={(e) => handleChange('exemptInterestDividends', formatCurrency(e.target.value))}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-2">
                Box 7 - Foreign tax paid
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
                Box 8 - Foreign country or U.S. possession
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

export default Form1099DIV

