import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'

const W2Form = forwardRef(({ data = {}, onChange, onValidationChange }, ref) => {
  const [focusedField, setFocusedField] = useState(null)
  const [formData, setFormData] = useState({
    // Box a - Employee's SSN
    employeeSSN: data.employeeSSN || '',
    // Box b - Employer's EIN
    employerEIN: data.employerEIN || '',
    // Box c - Employer's name and address
    employerName: data.employerName || '',
    employerAddress: data.employerAddress || '',
    employerCity: data.employerCity || '',
    employerState: data.employerState || '',
    employerZip: data.employerZip || '',
    // Box d - Control number
    controlNumber: data.controlNumber || '',
    // Box e - Employee's name
    employeeFirstName: data.employeeFirstName || '',
    employeeMiddleInitial: data.employeeMiddleInitial || '',
    employeeLastName: data.employeeLastName || '',
    employeeSuffix: data.employeeSuffix || '',
    // Box f - Employee's address
    employeeAddress: data.employeeAddress || '',
    employeeCity: data.employeeCity || '',
    employeeState: data.employeeState || '',
    employeeZip: data.employeeZip || '',
    // Box 1 - Wages, tips, other compensation
    wagesTipsOther: data.wagesTipsOther || '',
    // Box 2 - Federal income tax withheld
    federalIncomeTax: data.federalIncomeTax || '',
    // Box 3 - Social security wages
    socialSecurityWages: data.socialSecurityWages || '',
    // Box 4 - Social security tax withheld
    socialSecurityTax: data.socialSecurityTax || '',
    // Box 5 - Medicare wages and tips
    medicareWages: data.medicareWages || '',
    // Box 6 - Medicare tax withheld
    medicareTax: data.medicareTax || '',
    // Box 7 - Social security tips
    socialSecurityTips: data.socialSecurityTips || '',
    // Box 8 - Allocated tips
    allocatedTips: data.allocatedTips || '',
    // Box 10 - Dependent care benefits
    dependentCareBenefits: data.dependentCareBenefits || '',
    // Box 11 - Nonqualified plans
    nonqualifiedPlans: data.nonqualifiedPlans || '',
    // Box 12a-d
    box12a: data.box12a || '',
    box12aCode: data.box12aCode || '',
    box12b: data.box12b || '',
    box12bCode: data.box12bCode || '',
    box12c: data.box12c || '',
    box12cCode: data.box12cCode || '',
    box12d: data.box12d || '',
    box12dCode: data.box12dCode || '',
    // Box 13 - Checkboxes
    statutoryEmployee: data.statutoryEmployee || false,
    retirementPlan: data.retirementPlan || false,
    thirdPartySickPay: data.thirdPartySickPay || false,
    // Box 14 - Other
    box14Other: data.box14Other || '',
    // Box 15 - State and employer's state ID number
    state: data.state || '',
    employerStateID: data.employerStateID || '',
    // Box 16 - State wages, tips, etc.
    stateWages: data.stateWages || '',
    // Box 17 - State income tax
    stateIncomeTax: data.stateIncomeTax || '',
    // Box 18 - Local wages, tips, etc.
    localWages: data.localWages || '',
    // Box 19 - Local income tax
    localIncomeTax: data.localIncomeTax || '',
    // Box 20 - Locality name
    localityName: data.localityName || '',
    // Second row for boxes 15-20
    state2: data.state2 || '',
    employerStateID2: data.employerStateID2 || '',
    stateWages2: data.stateWages2 || '',
    stateIncomeTax2: data.stateIncomeTax2 || '',
    localWages2: data.localWages2 || '',
    localIncomeTax2: data.localIncomeTax2 || '',
    localityName2: data.localityName2 || ''
  })

  useEffect(() => {
    if (onChange) {
      onChange(formData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]) // Only depend on formData, onChange is stable from parent

  useEffect(() => {
    if (onValidationChange) {
      // Mandatory fields validation:
      // Box a - Employee SSN (must be properly formatted, 11 chars with dashes)
      const aValid = formData.employeeSSN.length === 11 && formData.employeeSSN.match(/^\d{3}-\d{2}-\d{4}$/)
      
      // Box b - Employer EIN (must be at least 9 characters, formatted as XX-XXXXXXX)
      const bValid = formData.employerEIN.length >= 9
      
      // Box c - Employer name and address (at least employer name must be filled)
      const cValid = formData.employerName.trim() !== ''
      
      // Box e - Employee name (accept if: full name in first name field OR both first and last name filled separately)
      const firstNameTrimmed = formData.employeeFirstName.trim()
      const lastNameTrimmed = formData.employeeLastName.trim()
      const eValid = (firstNameTrimmed.includes(' ') && firstNameTrimmed.length > 0) || (firstNameTrimmed !== '' && lastNameTrimmed !== '')
      
      // Box f - Employee address (at least address must be filled)
      const fValid = formData.employeeAddress.trim() !== ''
      
      // Box 1 - Wages, tips, other compensation
      const box1Valid = formData.wagesTipsOther.trim() !== '' && parseFloat(formData.wagesTipsOther.replace(/[^0-9.]/g, '')) > 0
      
      // Box 2 - Federal income tax withheld
      const box2Valid = formData.federalIncomeTax.trim() !== '' && parseFloat(formData.federalIncomeTax.replace(/[^0-9.]/g, '')) >= 0
      
      // Box 3 - Social security wages
      const box3Valid = formData.socialSecurityWages.trim() !== '' && parseFloat(formData.socialSecurityWages.replace(/[^0-9.]/g, '')) >= 0
      
      // Box 4 - Social security tax withheld
      const box4Valid = formData.socialSecurityTax.trim() !== '' && parseFloat(formData.socialSecurityTax.replace(/[^0-9.]/g, '')) >= 0
      
      // Box 5 - Medicare wages and tips
      const box5Valid = formData.medicareWages.trim() !== '' && parseFloat(formData.medicareWages.replace(/[^0-9.]/g, '')) >= 0
      
      // Box 6 - Medicare tax withheld
      const box6Valid = formData.medicareTax.trim() !== '' && parseFloat(formData.medicareTax.replace(/[^0-9.]/g, '')) >= 0
      
      // Box 16 - State wages, tips, etc. (from second row)
      const box16Valid = formData.stateWages2.trim() !== '' && parseFloat(formData.stateWages2.replace(/[^0-9.]/g, '')) >= 0
      
      // Box 17 - State income tax (from second row)
      const box17Valid = formData.stateIncomeTax2.trim() !== '' && parseFloat(formData.stateIncomeTax2.replace(/[^0-9.]/g, '')) >= 0
      
      const isValid = aValid && bValid && cValid && eValid && fValid && 
                      box1Valid && box2Valid && box3Valid && box4Valid && 
                      box5Valid && box6Valid && box16Valid && box17Valid
      
      onValidationChange(isValid)
    }
  }, [formData, onValidationChange])

  // Function to get missing mandatory fields
  const getMissingMandatoryFields = useCallback(() => {
    const missing = []
    
    // Box a - Employee SSN
    if (!(formData.employeeSSN.length === 11 && formData.employeeSSN.match(/^\d{3}-\d{2}-\d{4}$/))) {
      missing.push('Box a - Employee\'s social security number')
    }
    
    // Box b - Employer EIN
    if (formData.employerEIN.length < 9) {
      missing.push('Box b - Employer identification number (EIN)')
    }
    
    // Box c - Employer name
    if (formData.employerName.trim() === '') {
      missing.push('Box c - Employer\'s name')
    }
    
    // Box e - Employee name
    // Accept if: (1) first name contains a space (full name entered), OR (2) both first and last name are filled
    const firstNameTrimmed = formData.employeeFirstName.trim()
    const lastNameTrimmed = formData.employeeLastName.trim()
    const hasFullNameInFirstName = firstNameTrimmed.includes(' ') && firstNameTrimmed.length > 0
    const hasSeparateFirstAndLast = firstNameTrimmed !== '' && lastNameTrimmed !== ''
    
    if (!hasFullNameInFirstName && !hasSeparateFirstAndLast) {
      missing.push('Box e - Employee\'s first name and last name')
    }
    
    // Box f - Employee address
    if (formData.employeeAddress.trim() === '') {
      missing.push('Box f - Employee\'s address')
    }
    
    // Box 1 - Wages, tips, other compensation
    if (formData.wagesTipsOther.trim() === '' || parseFloat(formData.wagesTipsOther.replace(/[^0-9.]/g, '')) <= 0) {
      missing.push('Box 1 - Wages, tips, other compensation')
    }
    
    // Box 2 - Federal income tax withheld
    if (formData.federalIncomeTax.trim() === '' || isNaN(parseFloat(formData.federalIncomeTax.replace(/[^0-9.]/g, '')))) {
      missing.push('Box 2 - Federal income tax withheld')
    }
    
    // Box 3 - Social security wages
    if (formData.socialSecurityWages.trim() === '' || isNaN(parseFloat(formData.socialSecurityWages.replace(/[^0-9.]/g, '')))) {
      missing.push('Box 3 - Social security wages')
    }
    
    // Box 4 - Social security tax withheld
    if (formData.socialSecurityTax.trim() === '' || isNaN(parseFloat(formData.socialSecurityTax.replace(/[^0-9.]/g, '')))) {
      missing.push('Box 4 - Social security tax withheld')
    }
    
    // Box 5 - Medicare wages and tips
    if (formData.medicareWages.trim() === '' || isNaN(parseFloat(formData.medicareWages.replace(/[^0-9.]/g, '')))) {
      missing.push('Box 5 - Medicare wages and tips')
    }
    
    // Box 6 - Medicare tax withheld
    if (formData.medicareTax.trim() === '' || isNaN(parseFloat(formData.medicareTax.replace(/[^0-9.]/g, '')))) {
      missing.push('Box 6 - Medicare tax withheld')
    }
    
    // Box 16 - State wages, tips, etc.
    if (formData.stateWages2.trim() === '' || isNaN(parseFloat(formData.stateWages2.replace(/[^0-9.]/g, '')))) {
      missing.push('Box 16 - State wages, tips, etc.')
    }
    
    // Box 17 - State income tax
    if (formData.stateIncomeTax2.trim() === '' || isNaN(parseFloat(formData.stateIncomeTax2.replace(/[^0-9.]/g, '')))) {
      missing.push('Box 17 - State income tax')
    }
    
    return missing
  }, [formData])

  // Expose getMissingMandatoryFields via ref
  useImperativeHandle(ref, () => ({
    getMissingMandatoryFields
  }))

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // US States list
  const usStates = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'AL' },
    { value: 'AK', label: 'AK' },
    { value: 'AZ', label: 'AZ' },
    { value: 'AR', label: 'AR' },
    { value: 'CA', label: 'CA' },
    { value: 'CO', label: 'CO' },
    { value: 'CT', label: 'CT' },
    { value: 'DE', label: 'DE' },
    { value: 'FL', label: 'FL' },
    { value: 'GA', label: 'GA' },
    { value: 'HI', label: 'HI' },
    { value: 'ID', label: 'ID' },
    { value: 'IL', label: 'IL' },
    { value: 'IN', label: 'IN' },
    { value: 'IA', label: 'IA' },
    { value: 'KS', label: 'KS' },
    { value: 'KY', label: 'KY' },
    { value: 'LA', label: 'LA' },
    { value: 'ME', label: 'ME' },
    { value: 'MD', label: 'MD' },
    { value: 'MA', label: 'MA' },
    { value: 'MI', label: 'MI' },
    { value: 'MN', label: 'MN' },
    { value: 'MS', label: 'MS' },
    { value: 'MO', label: 'MO' },
    { value: 'MT', label: 'MT' },
    { value: 'NE', label: 'NE' },
    { value: 'NV', label: 'NV' },
    { value: 'NH', label: 'NH' },
    { value: 'NJ', label: 'NJ' },
    { value: 'NM', label: 'NM' },
    { value: 'NY', label: 'NY' },
    { value: 'NC', label: 'NC' },
    { value: 'ND', label: 'ND' },
    { value: 'OH', label: 'OH' },
    { value: 'OK', label: 'OK' },
    { value: 'OR', label: 'OR' },
    { value: 'PA', label: 'PA' },
    { value: 'RI', label: 'RI' },
    { value: 'SC', label: 'SC' },
    { value: 'SD', label: 'SD' },
    { value: 'TN', label: 'TN' },
    { value: 'TX', label: 'TX' },
    { value: 'UT', label: 'UT' },
    { value: 'VT', label: 'VT' },
    { value: 'VA', label: 'VA' },
    { value: 'WA', label: 'WA' },
    { value: 'WV', label: 'WV' },
    { value: 'WI', label: 'WI' },
    { value: 'WY', label: 'WY' },
    { value: 'DC', label: 'DC' }
  ]

  const formatSSN = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 9) {
      if (cleaned.length > 5) {
        return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 5) + '-' + cleaned.slice(5, 9)
      } else if (cleaned.length > 3) {
        return cleaned.slice(0, 3) + '-' + cleaned.slice(3)
      }
      return cleaned
    }
    return value
  }

  const formatEIN = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 9) {
      if (cleaned.length > 2) {
        return cleaned.slice(0, 2) + '-' + cleaned.slice(2)
      }
      return cleaned
    }
    return value
  }

  const formatCurrency = (value) => {
    // Allow numbers and one decimal point
    const cleaned = value.replace(/[^\d.]/g, '')
    // Ensure only one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }
    return cleaned
  }

  // Base box style - all boxes use this
  const boxStyle = {
    border: '1px solid #000000',
    position: 'relative',
    fontFamily: 'Arial, Helvetica, sans-serif',
    backgroundColor: '#FFFFFF'
  }

  // Label style (inside box, top-left)
  const labelStyle = {
    position: 'absolute',
    top: '3px',
    left: '3px',
    fontSize: '13px',
    color: '#000000',
    lineHeight: '1.3',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    maxWidth: 'calc(100% - 150px)'
  }

  // Box number style (bold)
  const boxNumberStyle = {
    fontWeight: 'bold',
    fontSize: '14px',
    marginRight: '3px'
  }

  // Input style (bottom-right, right-aligned)
  const inputStyle = {
    position: 'absolute',
    bottom: '3px',
    right: '3px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '15px',
    color: '#000000',
    textAlign: 'right',
    outline: 'none',
    padding: '3px 5px',
    fontFamily: 'Arial, Helvetica, sans-serif'
  }


  return (
    <div style={{ 
      backgroundColor: 'transparent', 
      padding: '24px 24px 0px 24px',
      fontFamily: 'Arial, Helvetica, sans-serif'
    }}>
      {/* White Paper Container - Portrait 8.5x11 ratio */}
      <div style={{
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        border: '1px solid #000000',
        display: 'grid',
        gridTemplateRows: 'auto auto auto auto',
        gap: 0
      }}>
        {/* Header - First Row with 3 Columns */}
        <div style={{
          ...boxStyle,
          borderBottom: '1px solid #000000',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          gap: 0,
          minHeight: '60px'
        }}>
          {/* Column 1: Blank */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: '1px solid #000000',
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            minHeight: '60px'
          }}>
            {/* Empty - blank space */}
          </div>

          {/* Column 2: a Employee's social security number (Input field) */}
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input, textarea, select')
              if (input) input.focus()
            }}
            style={{
              ...boxStyle,
              borderTop: focusedField === 'employeeSSN' ? '3px solid #dc2626' : '1px solid #000000',
              borderLeft: focusedField === 'employeeSSN' ? '3px solid #dc2626' : '1px solid #000000',
              borderRight: focusedField === 'employeeSSN' ? '3px solid #dc2626' : '1px solid #000000',
              borderBottom: focusedField === 'employeeSSN' ? '3px solid #dc2626' : '1px solid #000000',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflow: 'visible',
              cursor: 'text'
            }}>
            <div style={{ fontSize: '13px', color: '#000000', whiteSpace: 'nowrap', overflow: 'visible' }}>
              <span style={{ fontWeight: 'bold' }}>a</span> Employee's social security number
            </div>
            <input
              type="text"
              value={formData.employeeSSN}
              onChange={(e) => handleChange('employeeSSN', formatSSN(e.target.value))}
              onFocus={() => setFocusedField('employeeSSN')}
              onBlur={() => setFocusedField(null)}
              maxLength={11}
              placeholder="XXX-XX-XXXX"
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '15px',
                color: '#000000',
                textAlign: 'left',
                outline: 'none',
                padding: '3px 5px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                width: '100%',
                marginTop: '4px'
              }}
            />
          </div>

          {/* Column 3: OMB No. */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderLeft: 'none',
            borderBottom: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}>
            <div style={{ fontSize: '12px', color: '#000000' }}>OMB No. 1545-0029</div>
          </div>
        </div>

        {/* Main Body - 2 Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '45% 55%',
          gap: 0,
          borderTop: '1px solid #000000'
        }}>
          {/* Left Column */}
          <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(6, auto)',
            gap: 0,
            borderRight: '1px solid #000000'
          }}>
            {/* Box b - EIN */}
            <div 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input, textarea, select')
                if (input) input.focus()
              }}
              style={{
                ...boxStyle,
                borderTop: focusedField === 'employerEIN' ? '3px solid #dc2626' : '1px solid #000000',
                borderLeft: focusedField === 'employerEIN' ? '3px solid #dc2626' : '1px solid #000000',
                borderRight: focusedField === 'employerEIN' ? '3px solid #dc2626' : '1px solid #000000',
                borderBottom: focusedField === 'employerEIN' ? '3px solid #dc2626' : '1px solid #000000',
                minHeight: '42px',
                cursor: 'text'
              }}>
              <div style={labelStyle}>
                <span style={boxNumberStyle}>b</span>
                <span>Employer identification number (EIN)</span>
              </div>
              <input
                type="text"
                value={formData.employerEIN}
                onChange={(e) => handleChange('employerEIN', formatEIN(e.target.value))}
                onFocus={() => setFocusedField('employerEIN')}
                onBlur={() => setFocusedField(null)}
                maxLength={11}
                style={{
                  ...inputStyle,
                  width: '108px'
                }}
              />
            </div>

            {/* Box c - Employer name and address */}
            <div 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input, textarea, select')
                if (input) input.focus()
              }}
              style={{
                ...boxStyle,
                borderTop: ['employerName', 'employerAddress', 'employerCity', 'employerState', 'employerZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderLeft: ['employerName', 'employerAddress', 'employerCity', 'employerState', 'employerZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderRight: ['employerName', 'employerAddress', 'employerCity', 'employerState', 'employerZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderBottom: ['employerName', 'employerAddress', 'employerCity', 'employerState', 'employerZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                minHeight: '108px',
                cursor: 'text'
              }}>
              <div style={labelStyle}>
                <span style={boxNumberStyle}>c</span>
                <span>Employer's name, address, and ZIP code</span>
              </div>
              <div style={{
                position: 'absolute',
                top: '22px',
                left: '3px',
                right: '3px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <input
                  type="text"
                  value={formData.employerName}
                  onChange={(e) => handleChange('employerName', e.target.value)}
                  onFocus={() => setFocusedField('employerName')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    color: '#000000',
                    outline: 'none',
                    padding: '3px 5px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    width: '100%'
                  }}
                />
                <input
                  type="text"
                  value={formData.employerAddress}
                  onChange={(e) => handleChange('employerAddress', e.target.value)}
                  onFocus={() => setFocusedField('employerAddress')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    color: '#000000',
                    outline: 'none',
                    padding: '3px 5px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    width: '100%'
                  }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={formData.employerCity}
                    onChange={(e) => handleChange('employerCity', e.target.value)}
                    onFocus={() => setFocusedField('employerCity')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      flex: 1
                    }}
                  />
                  <input
                    type="text"
                    value={formData.employerState}
                    onChange={(e) => handleChange('employerState', e.target.value.toUpperCase().slice(0, 2))}
                    onFocus={() => setFocusedField('employerState')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={2}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '36px',
                      textAlign: 'center'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.employerZip}
                    onChange={(e) => handleChange('employerZip', e.target.value)}
                    onFocus={() => setFocusedField('employerZip')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '72px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Box d - Control number */}
            <div 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input, textarea, select')
                if (input) input.focus()
              }}
              style={{
                ...boxStyle,
                borderTop: focusedField === 'controlNumber' ? '3px solid #dc2626' : '1px solid #000000',
                borderLeft: focusedField === 'controlNumber' ? '3px solid #dc2626' : '1px solid #000000',
                borderRight: focusedField === 'controlNumber' ? '3px solid #dc2626' : '1px solid #000000',
                borderBottom: focusedField === 'controlNumber' ? '3px solid #dc2626' : '1px solid #000000',
                minHeight: '42px',
                cursor: 'text'
              }}>
              <div style={labelStyle}>
                <span style={boxNumberStyle}>d</span>
                <span>Control number</span>
              </div>
              <input
                type="text"
                value={formData.controlNumber}
                onChange={(e) => handleChange('controlNumber', e.target.value)}
                onFocus={() => setFocusedField('controlNumber')}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...inputStyle,
                  width: '144px'
                }}
              />
            </div>

            {/* Box e - Employee name */}
            <div 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input, textarea, select')
                if (input) input.focus()
              }}
              style={{
                ...boxStyle,
                borderTop: ['employeeFirstName', 'employeeMiddleInitial', 'employeeLastName', 'employeeSuffix'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderLeft: ['employeeFirstName', 'employeeMiddleInitial', 'employeeLastName', 'employeeSuffix'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderRight: ['employeeFirstName', 'employeeMiddleInitial', 'employeeLastName', 'employeeSuffix'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderBottom: ['employeeFirstName', 'employeeMiddleInitial', 'employeeLastName', 'employeeSuffix'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                minHeight: '72px',
                cursor: 'text'
              }}>
              <div style={labelStyle}>
                <span style={boxNumberStyle}>e</span>
                <span>Employee's first name and initial</span>
              </div>
              <div style={{
                position: 'absolute',
                top: '22px',
                left: '3px',
                right: '3px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={formData.employeeFirstName}
                    onChange={(e) => handleChange('employeeFirstName', e.target.value)}
                    onFocus={() => setFocusedField('employeeFirstName')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      flex: 1
                    }}
                  />
                  <input
                    type="text"
                    value={formData.employeeMiddleInitial}
                    onChange={(e) => handleChange('employeeMiddleInitial', e.target.value.toUpperCase().slice(0, 1))}
                    onFocus={() => setFocusedField('employeeMiddleInitial')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={1}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '24px',
                      textAlign: 'center'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.employeeLastName}
                    onChange={(e) => handleChange('employeeLastName', e.target.value)}
                    onFocus={() => setFocusedField('employeeLastName')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      flex: 1
                    }}
                  />
                  <span style={{ fontSize: '13px', color: '#000000' }}>Suff.</span>
                  <input
                    type="text"
                    value={formData.employeeSuffix}
                    onChange={(e) => handleChange('employeeSuffix', e.target.value)}
                    onFocus={() => setFocusedField('employeeSuffix')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={4}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '48px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Box f - Employee address */}
            <div 
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input, textarea, select')
                if (input) input.focus()
              }}
              style={{
                ...boxStyle,
                borderTop: ['employeeAddress', 'employeeCity', 'employeeState', 'employeeZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderLeft: ['employeeAddress', 'employeeCity', 'employeeState', 'employeeZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderRight: ['employeeAddress', 'employeeCity', 'employeeState', 'employeeZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                borderBottom: ['employeeAddress', 'employeeCity', 'employeeState', 'employeeZip'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                minHeight: '108px',
                cursor: 'text'
              }}>
              <div style={labelStyle}>
                <span style={boxNumberStyle}>f</span>
                <span>Employee's address and ZIP code</span>
              </div>
              <div style={{
                position: 'absolute',
                top: '22px',
                left: '3px',
                right: '3px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <input
                  type="text"
                  value={formData.employeeAddress}
                  onChange={(e) => handleChange('employeeAddress', e.target.value)}
                  onFocus={() => setFocusedField('employeeAddress')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    color: '#000000',
                    outline: 'none',
                    padding: '3px 5px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    width: '100%'
                  }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="text"
                    value={formData.employeeCity}
                    onChange={(e) => handleChange('employeeCity', e.target.value)}
                    onFocus={() => setFocusedField('employeeCity')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      flex: 1
                    }}
                  />
                  <input
                    type="text"
                    value={formData.employeeState}
                    onChange={(e) => handleChange('employeeState', e.target.value.toUpperCase().slice(0, 2))}
                    onFocus={() => setFocusedField('employeeState')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={2}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '36px',
                      textAlign: 'center'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.employeeZip}
                    onChange={(e) => handleChange('employeeZip', e.target.value)}
                    onFocus={() => setFocusedField('employeeZip')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '72px'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 2 Column Layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            borderTop: '1px solid #000000'
          }}>
            {/* Left Column: 1, 3, 5, 7, 9, 11, 13, 14 */}
            <div style={{
              display: 'grid',
              gridTemplateRows: 'auto auto auto auto auto auto auto auto',
              gap: 0,
              borderRight: '1px solid #000000'
            }}>
              {/* Box 1 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'wagesTipsOther' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'wagesTipsOther' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'wagesTipsOther' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'wagesTipsOther' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>1</span>
                  <span>Wages, tips, other compensation</span>
                </div>
                <input
                  type="text"
                  value={formData.wagesTipsOther}
                  onChange={(e) => handleChange('wagesTipsOther', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('wagesTipsOther')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 3 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'socialSecurityWages' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'socialSecurityWages' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'socialSecurityWages' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'socialSecurityWages' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>3</span>
                  <span>Social security wages</span>
                </div>
                <input
                  type="text"
                  value={formData.socialSecurityWages}
                  onChange={(e) => handleChange('socialSecurityWages', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('socialSecurityWages')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 5 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'medicareWages' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'medicareWages' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'medicareWages' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'medicareWages' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>5</span>
                  <span>Medicare wages and tips</span>
                </div>
                <input
                  type="text"
                  value={formData.medicareWages}
                  onChange={(e) => handleChange('medicareWages', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('medicareWages')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 7 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'socialSecurityTips' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'socialSecurityTips' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'socialSecurityTips' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'socialSecurityTips' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>7</span>
                  <span>Social security tips</span>
                </div>
                <input
                  type="text"
                  value={formData.socialSecurityTips}
                  onChange={(e) => handleChange('socialSecurityTips', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('socialSecurityTips')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 9 - Empty */}
              <div style={{
                ...boxStyle,
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                minHeight: '35px'
              }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>9</span>
                </div>
              </div>

              {/* Box 11 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'nonqualifiedPlans' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'nonqualifiedPlans' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'nonqualifiedPlans' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'nonqualifiedPlans' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>11</span>
                  <span>Nonqualified plans</span>
                </div>
                <input
                  type="text"
                  value={formData.nonqualifiedPlans}
                  onChange={(e) => handleChange('nonqualifiedPlans', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('nonqualifiedPlans')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 13 - Checkboxes */}
              <div style={{
                ...boxStyle,
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                minHeight: '65px'
              }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>13</span>
                </div>
                <div style={{
                  position: 'absolute',
                  top: '22px',
                  left: '2px',
                  right: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.statutoryEmployee}
                      onChange={(e) => handleChange('statutoryEmployee', e.target.checked)}
                      style={{
                        width: '12px',
                        height: '12px',
                        border: '1px solid #000000',
                        borderRadius: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#000000' }}>Statutory employee</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.retirementPlan}
                      onChange={(e) => handleChange('retirementPlan', e.target.checked)}
                      style={{
                        width: '12px',
                        height: '12px',
                        border: '1px solid #000000',
                        borderRadius: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#000000' }}>Retirement plan</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.thirdPartySickPay}
                      onChange={(e) => handleChange('thirdPartySickPay', e.target.checked)}
                      style={{
                        width: '12px',
                        height: '12px',
                        border: '1px solid #000000',
                        borderRadius: 0,
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#000000' }}>Third-party sick pay</span>
                  </label>
                </div>
              </div>

              {/* Box 14 - Other */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'box14Other' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'box14Other' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'box14Other' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'box14Other' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '50px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>14</span>
                  <span>Other</span>
                </div>
                <textarea
                  value={formData.box14Other}
                  onChange={(e) => handleChange('box14Other', e.target.value)}
                  onFocus={() => setFocusedField('box14Other')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    position: 'absolute',
                    top: '22px',
                    left: '2px',
                    right: '2px',
                    bottom: '2px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    fontSize: '14px',
                    color: '#000000',
                    outline: 'none',
                    padding: '3px 5px',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    resize: 'none'
                  }}
                  rows={2}
                />
              </div>
            </div>

            {/* Right Column: 2, 4, 6, 8, 10, 12a, 12b, 12c, 12d */}
            <div style={{
              display: 'grid',
              gridTemplateRows: 'auto auto auto auto auto auto auto auto auto',
              gap: 0
            }}>
              {/* Box 2 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'federalIncomeTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'federalIncomeTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'federalIncomeTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'federalIncomeTax' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>2</span>
                  <span>Federal income tax withheld</span>
                </div>
                <input
                  type="text"
                  value={formData.federalIncomeTax}
                  onChange={(e) => handleChange('federalIncomeTax', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('federalIncomeTax')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 4 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'socialSecurityTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'socialSecurityTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'socialSecurityTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'socialSecurityTax' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>4</span>
                  <span>Social security tax withheld</span>
                </div>
                <input
                  type="text"
                  value={formData.socialSecurityTax}
                  onChange={(e) => handleChange('socialSecurityTax', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('socialSecurityTax')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 6 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'medicareTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'medicareTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'medicareTax' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'medicareTax' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>6</span>
                  <span>Medicare tax withheld</span>
                </div>
                <input
                  type="text"
                  value={formData.medicareTax}
                  onChange={(e) => handleChange('medicareTax', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('medicareTax')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 8 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'allocatedTips' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'allocatedTips' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'allocatedTips' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'allocatedTips' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>8</span>
                  <span>Allocated tips</span>
                </div>
                <input
                  type="text"
                  value={formData.allocatedTips}
                  onChange={(e) => handleChange('allocatedTips', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('allocatedTips')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 10 */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: focusedField === 'dependentCareBenefits' ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: focusedField === 'dependentCareBenefits' ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: focusedField === 'dependentCareBenefits' ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: focusedField === 'dependentCareBenefits' ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>10</span>
                  <span>Dependent care benefits</span>
                </div>
                <input
                  type="text"
                  value={formData.dependentCareBenefits}
                  onChange={(e) => handleChange('dependentCareBenefits', formatCurrency(e.target.value))}
                  onFocus={() => setFocusedField('dependentCareBenefits')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle,
                    width: '96px'
                  }}
                />
              </div>

              {/* Box 12a */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: ['box12a', 'box12aCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: ['box12a', 'box12aCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: ['box12a', 'box12aCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: ['box12a', 'box12aCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>12a</span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <input
                    type="text"
                    value={formData.box12a}
                    onChange={(e) => handleChange('box12a', formatCurrency(e.target.value))}
                    onFocus={() => setFocusedField('box12a')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle,
                      width: '70px',
                      position: 'static'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.box12aCode}
                    onChange={(e) => handleChange('box12aCode', e.target.value.toUpperCase().slice(0, 2))}
                    onFocus={() => setFocusedField('box12aCode')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={2}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '35px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              {/* Box 12b */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: ['box12b', 'box12bCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: ['box12b', 'box12bCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: ['box12b', 'box12bCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: ['box12b', 'box12bCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>12b</span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <input
                    type="text"
                    value={formData.box12b}
                    onChange={(e) => handleChange('box12b', formatCurrency(e.target.value))}
                    onFocus={() => setFocusedField('box12b')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle,
                      width: '70px',
                      position: 'static'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.box12bCode}
                    onChange={(e) => handleChange('box12bCode', e.target.value.toUpperCase().slice(0, 2))}
                    onFocus={() => setFocusedField('box12bCode')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={2}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '35px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              {/* Box 12c */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: ['box12c', 'box12cCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: ['box12c', 'box12cCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: ['box12c', 'box12cCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: ['box12c', 'box12cCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>12c</span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <input
                    type="text"
                    value={formData.box12c}
                    onChange={(e) => handleChange('box12c', formatCurrency(e.target.value))}
                    onFocus={() => setFocusedField('box12c')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle,
                      width: '70px',
                      position: 'static'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.box12cCode}
                    onChange={(e) => handleChange('box12cCode', e.target.value.toUpperCase().slice(0, 2))}
                    onFocus={() => setFocusedField('box12cCode')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={2}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '35px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              {/* Box 12d */}
              <div 
                onClick={(e) => {
                  const input = e.currentTarget.querySelector('input, textarea, select')
                  if (input) input.focus()
                }}
                style={{
                  ...boxStyle,
                  borderTop: ['box12d', 'box12dCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderLeft: ['box12d', 'box12dCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderRight: ['box12d', 'box12dCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  borderBottom: ['box12d', 'box12dCode'].includes(focusedField) ? '3px solid #dc2626' : '1px solid #000000',
                  minHeight: '42px',
                  cursor: 'text'
                }}>
                <div style={labelStyle}>
                  <span style={boxNumberStyle}>12d</span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <input
                    type="text"
                    value={formData.box12d}
                    onChange={(e) => handleChange('box12d', formatCurrency(e.target.value))}
                    onFocus={() => setFocusedField('box12d')}
                    onBlur={() => setFocusedField(null)}
                    style={{
                      ...inputStyle,
                      width: '70px',
                      position: 'static'
                    }}
                  />
                  <input
                    type="text"
                    value={formData.box12dCode}
                    onChange={(e) => handleChange('box12dCode', e.target.value.toUpperCase().slice(0, 2))}
                    onFocus={() => setFocusedField('box12dCode')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={2}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '15px',
                      color: '#000000',
                      outline: 'none',
                      padding: '3px 5px',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      width: '35px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - State & Local (6 boxes in one row) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 0,
          borderTop: '1px solid #000000'
        }}>
          {/* Box 15 - Label only, no input */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderRight: '1px solid #000000',
                minHeight: '30px',
            height: '25px'
          }}>
            <div style={labelStyle}>
              <span style={boxNumberStyle}>15</span>
            </div>
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '2px',
              right: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              whiteSpace: 'nowrap',
              overflow: 'visible'
            }}>
              <span style={{ fontSize: '8px', color: '#000000', whiteSpace: 'nowrap' }}>State</span>
              <span style={{ fontSize: '7px', color: '#000000', whiteSpace: 'nowrap' }}>Emp. state ID</span>
            </div>
          </div>

          {/* Box 16 - Label only, no input */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: '1px solid #000000',
                minHeight: '30px',
            height: '25px'
          }}>
            <div style={labelStyle}>
              <span style={boxNumberStyle}>16</span>
              <span>State wages, tips, etc.</span>
            </div>
          </div>

          {/* Box 17 - Label only, no input */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: '1px solid #000000',
                minHeight: '30px',
            height: '25px'
          }}>
            <div style={labelStyle}>
              <span style={boxNumberStyle}>17</span>
              <span>State income tax</span>
            </div>
          </div>

          {/* Box 18 - Label only, no input */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: '1px solid #000000',
                minHeight: '30px',
            height: '25px'
          }}>
            <div style={labelStyle}>
              <span style={boxNumberStyle}>18</span>
              <span>Local wages, tips, etc.</span>
            </div>
          </div>

          {/* Box 19 - Label only, no input */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: '1px solid #000000',
                minHeight: '30px',
            height: '25px'
          }}>
            <div style={labelStyle}>
              <span style={boxNumberStyle}>19</span>
              <span>Local income tax</span>
            </div>
          </div>

          {/* Box 20 - Label only, no input */}
          <div style={{
            ...boxStyle,
            borderTop: 'none',
            borderLeft: 'none',
                minHeight: '30px',
            height: '25px'
          }}>
            <div style={labelStyle}>
              <span style={boxNumberStyle}>20</span>
              <span>Locality name</span>
            </div>
          </div>
        </div>

        {/* Second Row - State & Local (6 boxes with dotted borders) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 0,
          borderTop: '1px dashed #000000'
        }}>
          {/* Box 15 - Second Row */}
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input, textarea, select')
              if (input) input.focus()
            }}
            style={{
              ...boxStyle,
              borderTop: focusedField === 'state2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderRight: focusedField === 'state2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderBottom: focusedField === 'state2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderLeft: focusedField === 'state2' ? '3px solid #dc2626' : '1px dashed #000000',
                minHeight: '30px',
              height: '25px',
              cursor: 'text'
            }}>
            <select
              value={formData.state2}
              onChange={(e) => handleChange('state2', e.target.value)}
              onFocus={() => setFocusedField('state2')}
              onBlur={() => setFocusedField(null)}
              style={{
                position: 'absolute',
                top: '2px',
                left: '3px',
                right: '3px',
                bottom: '2px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: '#000000',
                outline: 'none',
                padding: '3px 5px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                width: 'calc(100% - 4px)',
                cursor: 'pointer'
              }}
            >
              {usStates.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>

          {/* Box 16 - Second Row */}
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input, textarea, select')
              if (input) input.focus()
            }}
            style={{
              ...boxStyle,
              borderTop: focusedField === 'stateWages2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderLeft: focusedField === 'stateWages2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderRight: focusedField === 'stateWages2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderBottom: focusedField === 'stateWages2' ? '3px solid #dc2626' : '1px dashed #000000',
                minHeight: '30px',
              height: '25px',
              cursor: 'text'
            }}>
            <input
              type="text"
              value={formData.stateWages2}
              onChange={(e) => handleChange('stateWages2', formatCurrency(e.target.value))}
              onFocus={() => setFocusedField('stateWages2')}
              onBlur={() => setFocusedField(null)}
              style={{
                position: 'absolute',
                top: '2px',
                left: '3px',
                right: '3px',
                bottom: '2px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '15px',
                color: '#000000',
                textAlign: 'right',
                outline: 'none',
                padding: '3px 5px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                width: 'calc(100% - 4px)'
              }}
            />
          </div>

          {/* Box 17 - Second Row */}
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input, textarea, select')
              if (input) input.focus()
            }}
            style={{
              ...boxStyle,
              borderTop: focusedField === 'stateIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderLeft: focusedField === 'stateIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderRight: focusedField === 'stateIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderBottom: focusedField === 'stateIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
                minHeight: '30px',
              height: '25px',
              cursor: 'text'
            }}>
            <input
              type="text"
              value={formData.stateIncomeTax2}
              onChange={(e) => handleChange('stateIncomeTax2', formatCurrency(e.target.value))}
              onFocus={() => setFocusedField('stateIncomeTax2')}
              onBlur={() => setFocusedField(null)}
              style={{
                position: 'absolute',
                top: '2px',
                left: '3px',
                right: '3px',
                bottom: '2px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '15px',
                color: '#000000',
                textAlign: 'right',
                outline: 'none',
                padding: '3px 5px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                width: 'calc(100% - 4px)'
              }}
            />
          </div>

          {/* Box 18 - Second Row */}
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input, textarea, select')
              if (input) input.focus()
            }}
            style={{
              ...boxStyle,
              borderTop: focusedField === 'localWages2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderLeft: focusedField === 'localWages2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderRight: focusedField === 'localWages2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderBottom: focusedField === 'localWages2' ? '3px solid #dc2626' : '1px dashed #000000',
                minHeight: '30px',
              height: '25px',
              cursor: 'text'
            }}>
            <input
              type="text"
              value={formData.localWages2}
              onChange={(e) => handleChange('localWages2', formatCurrency(e.target.value))}
              onFocus={() => setFocusedField('localWages2')}
              onBlur={() => setFocusedField(null)}
              style={{
                position: 'absolute',
                top: '2px',
                left: '3px',
                right: '3px',
                bottom: '2px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '15px',
                color: '#000000',
                textAlign: 'right',
                outline: 'none',
                padding: '3px 5px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                width: 'calc(100% - 4px)'
              }}
            />
          </div>

          {/* Box 19 - Second Row */}
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input, textarea, select')
              if (input) input.focus()
            }}
            style={{
              ...boxStyle,
              borderTop: focusedField === 'localIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderLeft: focusedField === 'localIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderRight: focusedField === 'localIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderBottom: focusedField === 'localIncomeTax2' ? '3px solid #dc2626' : '1px dashed #000000',
                minHeight: '30px',
              height: '25px',
              cursor: 'text'
            }}>
            <input
              type="text"
              value={formData.localIncomeTax2}
              onChange={(e) => handleChange('localIncomeTax2', formatCurrency(e.target.value))}
              onFocus={() => setFocusedField('localIncomeTax2')}
              onBlur={() => setFocusedField(null)}
              style={{
                position: 'absolute',
                top: '2px',
                left: '3px',
                right: '3px',
                bottom: '2px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '15px',
                color: '#000000',
                textAlign: 'right',
                outline: 'none',
                padding: '3px 5px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                width: 'calc(100% - 4px)'
              }}
            />
          </div>

          {/* Box 20 - Second Row */}
          <div 
            onClick={(e) => {
              const input = e.currentTarget.querySelector('input, textarea, select')
              if (input) input.focus()
            }}
            style={{
              ...boxStyle,
              borderTop: focusedField === 'localityName2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderLeft: focusedField === 'localityName2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderRight: focusedField === 'localityName2' ? '3px solid #dc2626' : '1px dashed #000000',
              borderBottom: focusedField === 'localityName2' ? '3px solid #dc2626' : '1px dashed #000000',
                minHeight: '30px',
              height: '25px',
              cursor: 'text'
            }}>
            <input
              type="text"
              value={formData.localityName2}
              onChange={(e) => handleChange('localityName2', e.target.value)}
              onFocus={() => setFocusedField('localityName2')}
              onBlur={() => setFocusedField(null)}
              style={{
                position: 'absolute',
                top: '2px',
                left: '3px',
                right: '3px',
                bottom: '2px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: '#000000',
                outline: 'none',
                padding: '3px 5px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                width: 'calc(100% - 4px)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
})

W2Form.displayName = 'W2Form'

export default W2Form
