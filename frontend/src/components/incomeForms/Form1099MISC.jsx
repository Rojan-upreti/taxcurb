import React, { useState, useEffect } from 'react'
import QuestionCard from '../QuestionCard'

function Form1099MISC({ data = {}, onChange, onValidationChange }) {
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
    box1Rents: data.box1Rents || '',
    box2Royalties: data.box2Royalties || '',
    box3OtherIncome: data.box3OtherIncome || '',
    box4FederalIncomeTax: data.box4FederalIncomeTax || '',
    box5FishingBoatProceeds: data.box5FishingBoatProceeds || '',
    box6MedicalAndHealthCare: data.box6MedicalAndHealthCare || '',
    box7NonemployeeCompensation: data.box7NonemployeeCompensation || '',
    box8SubstitutePayments: data.box8SubstitutePayments || '',
    box9PayerMadeDirectSales: data.box9PayerMadeDirectSales || '',
    box10CropInsuranceProceeds: data.box10CropInsuranceProceeds || '',
    box11GrossProceeds: data.box11GrossProceeds || '',
    box12Section409ADeferrals: data.box12Section409ADeferrals || '',
    box13Section409AIncome: data.box13Section409AIncome || '',
    box14ExcessGoldenParachute: data.box14ExcessGoldenParachute || '',
    state: data.state || '',
    stateIdentificationNumber: data.stateIdentificationNumber || '',
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
      <QuestionCard>
        <h3 className="text-sm font-semibold text-ink mb-4">Payer Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Payer's Name *</label>
            <input type="text" value={formData.payerName} onChange={(e) => handleChange('payerName', e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Payer's TIN *</label>
            <input type="text" value={formData.payerTIN} onChange={(e) => handleChange('payerTIN', formatTIN(e.target.value))} placeholder="XX-XXXXXXX" maxLength={11} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
          </div>
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
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Recipient's Name *</label>
            <input type="text" value={formData.recipientName} onChange={(e) => handleChange('recipientName', e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink mb-2">Recipient's TIN *</label>
            <input type="text" value={formData.recipientTIN} onChange={(e) => handleChange('recipientTIN', formatTIN(e.target.value))} placeholder="XX-XXXXXXX" maxLength={11} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" />
          </div>
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
        <h3 className="text-sm font-semibold text-ink mb-4">Miscellaneous Income Information</h3>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 1 - Rents</label><input type="text" value={formData.box1Rents} onChange={(e) => handleChange('box1Rents', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 2 - Royalties</label><input type="text" value={formData.box2Royalties} onChange={(e) => handleChange('box2Royalties', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 3 - Other income</label><input type="text" value={formData.box3OtherIncome} onChange={(e) => handleChange('box3OtherIncome', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 4 - Federal income tax withheld</label><input type="text" value={formData.box4FederalIncomeTax} onChange={(e) => handleChange('box4FederalIncomeTax', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 5 - Fishing boat proceeds</label><input type="text" value={formData.box5FishingBoatProceeds} onChange={(e) => handleChange('box5FishingBoatProceeds', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 6 - Medical and health care payments</label><input type="text" value={formData.box6MedicalAndHealthCare} onChange={(e) => handleChange('box6MedicalAndHealthCare', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div><label className="block text-xs font-semibold text-ink mb-2">Box 7 - Nonemployee compensation</label><input type="text" value={formData.box7NonemployeeCompensation} onChange={(e) => handleChange('box7NonemployeeCompensation', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold text-ink mb-2">Box 15 - State</label><input type="text" value={formData.state} onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="State" maxLength={2} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
            <div><label className="block text-xs font-semibold text-ink mb-2">Box 16 - State identification number</label><input type="text" value={formData.stateIdentificationNumber} onChange={(e) => handleChange('stateIdentificationNumber', e.target.value)} className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
            <div><label className="block text-xs font-semibold text-ink mb-2">Box 17 - State income tax</label><input type="text" value={formData.stateIncomeTax} onChange={(e) => handleChange('stateIncomeTax', formatCurrency(e.target.value))} placeholder="0.00" className="w-full px-4 py-2 text-sm border-2 border-slate-300 bg-white text-ink font-medium focus:outline-none focus:border-ink rounded-full" /></div>
          </div>
        </div>
      </QuestionCard>
    </div>
  )
}

export default Form1099MISC

