import React, { useState, useEffect } from 'react'
import QuestionCard from '../QuestionCard'

function Form1099R({ data = {}, onChange, onValidationChange }) {
  const [formData, setFormData] = useState({
    payerName: data.payerName || '',
    payerAddress: data.payerAddress || '',
    payerCity: data.payerCity || '',
    payerState: data.payerState || '',
    payerZip: data.payerZip || '',
    payerTIN: data.payerTIN || '',
    recipientName: data.recipientName || '',
    recipientAddress: data.recipientAddress || '',
    recipientCity: data.recipientCity || '',
    recipientState: data.recipientState || '',
    recipientZip: data.recipientZip || '',
    recipientTIN: data.recipientTIN || '',
    box1GrossDistribution: data.box1GrossDistribution || '',
    box2aTaxableAmount: data.box2aTaxableAmount || '',
    box2bTaxableAmountNotDetermined: data.box2bTaxableAmountNotDetermined || false,
    box2cTotalDistribution: data.box2cTotalDistribution || false,
    box3CapitalGain: data.box3CapitalGain || '',
    box4FederalIncomeTax: data.box4FederalIncomeTax || '',
    box5EmployeeContributions: data.box5EmployeeContributions || '',
    box6NetUnrealizedAppreciation: data.box6NetUnrealizedAppreciation || '',
    box7DistributionCode: data.box7DistributionCode || '',
    box8Other: data.box8Other || '',
    box9aPercentageTotalDistribution: data.box9aPercentageTotalDistribution || '',
    box9bTotalEmployeeContributions: data.box9bTotalEmployeeContributions || '',
    box10AmountAllocable: data.box10AmountAllocable || '',
    box11FirstYearOfRoth: data.box11FirstYearOfRoth || '',
    state: data.state || '',
    stateIdentificationNumber: data.stateIdentificationNumber || '',
    stateIncomeTax: data.stateIncomeTax || '',
    box15LocalTaxWithheld: data.box15LocalTaxWithheld || '',
    box16NameOfLocality: data.box16NameOfLocality || '',
    box17StateDistribution: data.box17StateDistribution || ''
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
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Payer Information</h3>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-ink mb-2">Payer's Name *</label><input type="text" value={formData.payerName} onChange={(e) => handleChange('payerName', e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Payer's TIN *</label><input type="text" value={formData.payerTIN} onChange={(e) => handleChange('payerTIN', formatTIN(e.target.value))} placeholder="XX-XXXXXXX" maxLength={11} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Payer's Address</label>
            <input type="text" value={formData.payerAddress} onChange={(e) => handleChange('payerAddress', e.target.value)} placeholder="Street address" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={formData.payerCity} onChange={(e) => handleChange('payerCity', e.target.value)} placeholder="City" className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
              <input type="text" value={formData.payerState} onChange={(e) => handleChange('payerState', e.target.value.toUpperCase().slice(0, 2))} placeholder="State" maxLength={2} className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
            </div>
            <input type="text" value={formData.payerZip} onChange={(e) => handleChange('payerZip', e.target.value)} placeholder="ZIP code" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mt-2" />
          </div>
        </div>
      </QuestionCard>

      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Recipient Information</h3>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-ink mb-2">Recipient's Name *</label><input type="text" value={formData.recipientName} onChange={(e) => handleChange('recipientName', e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Recipient's TIN *</label><input type="text" value={formData.recipientTIN} onChange={(e) => handleChange('recipientTIN', formatTIN(e.target.value))} placeholder="XX-XXXXXXX" maxLength={11} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Recipient's Address</label>
            <input type="text" value={formData.recipientAddress} onChange={(e) => handleChange('recipientAddress', e.target.value)} placeholder="Street address" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mb-2" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={formData.recipientCity} onChange={(e) => handleChange('recipientCity', e.target.value)} placeholder="City" className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
              <input type="text" value={formData.recipientState} onChange={(e) => handleChange('recipientState', e.target.value.toUpperCase().slice(0, 2))} placeholder="State" maxLength={2} className="px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
            </div>
            <input type="text" value={formData.recipientZip} onChange={(e) => handleChange('recipientZip', e.target.value)} placeholder="ZIP code" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full mt-2" />
          </div>
        </div>
      </QuestionCard>

      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Pension and Annuity Information</h3>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 1 - Gross distribution</label><input type="text" value={formData.box1GrossDistribution} onChange={(e) => handleChange('box1GrossDistribution', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 2a - Taxable amount</label><input type="text" value={formData.box2aTaxableAmount} onChange={(e) => handleChange('box2aTaxableAmount', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={formData.box2bTaxableAmountNotDetermined} onChange={(e) => handleChange('box2bTaxableAmountNotDetermined', e.target.checked)} className="w-4 h-4" /><label className="text-xs text-ink">Box 2b - Taxable amount not determined</label></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={formData.box2cTotalDistribution} onChange={(e) => handleChange('box2cTotalDistribution', e.target.checked)} className="w-4 h-4" /><label className="text-xs text-ink">Box 2c - Total distribution</label></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 3 - Capital gain</label><input type="text" value={formData.box3CapitalGain} onChange={(e) => handleChange('box3CapitalGain', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 4 - Federal income tax withheld</label><input type="text" value={formData.box4FederalIncomeTax} onChange={(e) => handleChange('box4FederalIncomeTax', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 5 - Employee contributions</label><input type="text" value={formData.box5EmployeeContributions} onChange={(e) => handleChange('box5EmployeeContributions', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 7 - Distribution code</label><input type="text" value={formData.box7DistributionCode} onChange={(e) => handleChange('box7DistributionCode', e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold text-ink mb-2">Box 12 - State</label><input type="text" value={formData.state} onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="State" maxLength={2} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
            <div><label className="block text-xs font-semibold text-ink mb-2">Box 13 - State identification number</label><input type="text" value={formData.stateIdentificationNumber} onChange={(e) => handleChange('stateIdentificationNumber', e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
            <div><label className="block text-xs font-semibold text-ink mb-2">Box 14 - State income tax</label><input type="text" value={formData.stateIncomeTax} onChange={(e) => handleChange('stateIncomeTax', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          </div>
        </div>
      </QuestionCard>
    </div>
  )
}

export default Form1099R

