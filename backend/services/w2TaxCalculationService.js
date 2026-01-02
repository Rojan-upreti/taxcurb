import logger from '../utils/logger.js'

/**
 * Parse a currency string to a number
 * Handles formats like "$1,234.56", "1234.56", "1,234", etc.
 */
function parseCurrency(value) {
  if (!value || value === '') return 0
  // Remove currency symbols, commas, and whitespace
  const cleaned = String(value).replace(/[$,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Calculate tax owed using progressive tax brackets (2025 rates)
 * @param {number} taxableIncome - The taxable income amount
 * @returns {Object} - Tax owed and bracket information
 */
function calculateTaxOwed(taxableIncome) {
  if (taxableIncome <= 0) {
    return {
      taxOwed: 0,
      taxBracket: '10%',
      bracketRange: '$0 - $11,600'
    }
  }

  const brackets = [
    { min: 0, max: 11600, rate: 0.10, name: '10%', range: '$0 - $11,600' },
    { min: 11601, max: 47150, rate: 0.12, name: '12%', range: '$11,601 - $47,150' },
    { min: 47151, max: 100525, rate: 0.22, name: '22%', range: '$47,151 - $100,525' },
    { min: 100526, max: 191950, rate: 0.24, name: '24%', range: '$100,526 - $191,950' },
    { min: 191951, max: 243725, rate: 0.32, name: '32%', range: '$191,951 - $243,725' },
    { min: 243726, max: 609350, rate: 0.35, name: '35%', range: '$243,726 - $609,350' },
    { min: 609351, max: Infinity, rate: 0.37, name: '37%', range: '$609,351+' }
  ]

  let taxOwed = 0
  let currentBracket = brackets[0] // Default to first bracket
  let remainingIncome = taxableIncome

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i]
    const previousMax = i > 0 ? brackets[i - 1].max : 0
    
    if (remainingIncome <= 0) {
      break
    }

    // Calculate the range of this bracket
    const bracketRange = bracket.max - previousMax
    
    if (remainingIncome > bracketRange) {
      // Full bracket applies - calculate tax on entire bracket range
      taxOwed += bracketRange * bracket.rate
      remainingIncome -= bracketRange
    } else {
      // Partial bracket applies - calculate tax only on remaining income
      taxOwed += remainingIncome * bracket.rate
      currentBracket = bracket
      break
    }
  }

  // If taxable income exceeds all brackets, use the highest bracket
  if (taxableIncome > brackets[brackets.length - 1].max) {
    currentBracket = brackets[brackets.length - 1]
    // Calculate tax on amount above the highest bracket
    const amountAboveHighest = taxableIncome - brackets[brackets.length - 1].max
    taxOwed += amountAboveHighest * currentBracket.rate
  }

  return {
    taxOwed: Math.round(taxOwed * 100) / 100, // Round to 2 decimal places
    taxBracket: currentBracket.name,
    bracketRange: currentBracket.range
  }
}

/**
 * Calculate years from I-94 entry date to tax year end (December 31, 2025)
 * @param {string} dateString - I-94 entry date string (YYYY-MM-DD format)
 * @returns {number} - Years since entry (to Dec 31, 2025)
 */
function calculateYearsSinceEntry(dateString) {
  if (!dateString) return null
  
  try {
    const entryDate = new Date(dateString)
    if (isNaN(entryDate.getTime())) return null
    
    // Tax year end: December 31, 2025
    const taxYearEnd = new Date('2025-12-31')
    
    const years = taxYearEnd.getFullYear() - entryDate.getFullYear()
    const monthDiff = taxYearEnd.getMonth() - entryDate.getMonth()
    
    // Adjust if entry date hasn't reached the same month/day in 2025
    if (monthDiff < 0 || (monthDiff === 0 && taxYearEnd.getDate() < entryDate.getDate())) {
      return years - 1
    }
    
    return years
  } catch (e) {
    logger.error('Error calculating years since entry:', e)
    return null
  }
}

/**
 * Calculate taxable income and tax owed from W-2 documents
 * @param {Object} filingData - All filing data from localStorage
 * @returns {Object} - Calculation results
 */
export function calculateW2Tax(filingData) {
  try {
    // Extract income data
    const incomeData = filingData.filing_income
    if (!incomeData || !incomeData.documents || !incomeData.documents.w2) {
      throw new Error('No W-2 documents found in filing data')
    }

    const w2Documents = incomeData.documents.w2
    const w2Keys = Object.keys(w2Documents)

    if (w2Keys.length === 0) {
      throw new Error('No W-2 documents found')
    }

    logger.info(`Calculating tax for ${w2Keys.length} W-2 document(s)`)

    // Aggregate all W-2 documents
    let totalWages = 0
    let totalStateTax = 0
    let totalFederalTax = 0
    let totalFICA = 0 // Box 4 (Social Security Tax) + Box 6 (Medicare Tax)

    for (const key of w2Keys) {
      const w2Data = w2Documents[key]
      
      // Sum wagesTipsOther (Box 1)
      const wages = parseCurrency(w2Data.wagesTipsOther || '0')
      totalWages += wages

      // Sum stateIncomeTax2 (Box 17, second row)
      const stateTax = parseCurrency(w2Data.stateIncomeTax2 || '0')
      totalStateTax += stateTax

      // Sum federalIncomeTax (Box 2)
      const federalTax = parseCurrency(w2Data.federalIncomeTax || '0')
      totalFederalTax += federalTax

      // Sum FICA: Box 4 (Social Security Tax) + Box 6 (Medicare Tax)
      const socialSecurityTax = parseCurrency(w2Data.socialSecurityTax || '0')
      const medicareTax = parseCurrency(w2Data.medicareTax || '0')
      totalFICA += socialSecurityTax + medicareTax

      logger.debug(`W-2 ${key}: Wages=${wages}, StateTax=${stateTax}, FederalTax=${federalTax}, FICA=${socialSecurityTax + medicareTax}`)
    }

    // Calculate FICA refund eligibility
    // Extract visa status data to get I-94 entry date
    const visaStatusData = filingData.filing_visa_status
    const dateEnteredUS = visaStatusData?.dateEnteredUS
    const yearsSinceEntry = dateEnteredUS ? calculateYearsSinceEntry(dateEnteredUS) : null
    
    // Eligible for FICA refund if: yearsSinceEntry <= 5 AND totalFICA > 0
    const eligibleForRefund = yearsSinceEntry !== null && yearsSinceEntry <= 5 && totalFICA > 0
    const ficaRefund = eligibleForRefund ? totalFICA : 0

    logger.info(`FICA calculation: Total FICA=${totalFICA}, Years Since Entry=${yearsSinceEntry}, Eligible=${eligibleForRefund}, Refund=${ficaRefund}`)

    // Calculate taxable income: wagesTipsOther - stateIncomeTax2
    // IRS SALT (State And Local Tax) deduction cap: maximum $10,000
    const stateTaxDeduction = Math.min(totalStateTax, 10000)
    const taxableIncome = totalWages - stateTaxDeduction

    if (taxableIncome < 0) {
      logger.warn(`Taxable income is negative: ${taxableIncome}. Setting to 0.`)
      // Don't allow negative taxable income
      const adjustedTaxableIncome = 0
      const taxResult = calculateTaxOwed(adjustedTaxableIncome)
      
      const calculatedTax = taxResult.taxOwed
      const taxOwed = calculatedTax - totalFederalTax
      const netAmount = taxOwed - ficaRefund
      
      return {
        success: true,
        taxableIncome: 0,
        taxOwed: Math.round(taxOwed * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
        taxBracket: taxResult.taxBracket,
        bracketRange: taxResult.bracketRange,
        breakdown: {
          totalWages: Math.round(totalWages * 100) / 100,
          totalStateTax: Math.round(totalStateTax * 100) / 100,
          stateTaxDeduction: Math.round(stateTaxDeduction * 100) / 100,
          totalFederalTax: Math.round(totalFederalTax * 100) / 100,
          calculatedTax: Math.round(calculatedTax * 100) / 100,
          saltCapApplied: totalStateTax > 10000,
          note: 'Taxable income was negative, set to 0. State tax deduction capped at $10,000 per IRS SALT limit.'
        },
        ficaBreakdown: {
          totalFICA: Math.round(totalFICA * 100) / 100,
          eligibleForRefund: eligibleForRefund,
          yearsSinceEntry: yearsSinceEntry,
          ficaRefund: Math.round(ficaRefund * 100) / 100,
          dateEnteredUS: dateEnteredUS || null
        }
      }
    }

    // Calculate tax owed using progressive brackets
    const taxResult = calculateTaxOwed(taxableIncome)
    
    // Tax owed = calculated tax from brackets - federal income tax withheld (Box 2)
    const calculatedTax = taxResult.taxOwed
    const taxOwed = calculatedTax - totalFederalTax
    const netAmount = taxOwed - ficaRefund

    logger.info(`Tax calculation complete: Taxable Income=${taxableIncome}, Calculated Tax=${calculatedTax}, Federal Tax Withheld=${totalFederalTax}, Tax Owed=${taxOwed}, FICA Refund=${ficaRefund}, Net Amount=${netAmount}`)

    return {
      success: true,
      taxableIncome: Math.round(taxableIncome * 100) / 100, // Round to 2 decimal places
      taxOwed: Math.round(taxOwed * 100) / 100, // Round to 2 decimal places
      netAmount: Math.round(netAmount * 100) / 100, // Round to 2 decimal places
      taxBracket: taxResult.taxBracket,
      bracketRange: taxResult.bracketRange,
      breakdown: {
        totalWages: Math.round(totalWages * 100) / 100,
        totalStateTax: Math.round(totalStateTax * 100) / 100,
        stateTaxDeduction: Math.round(stateTaxDeduction * 100) / 100,
        totalFederalTax: Math.round(totalFederalTax * 100) / 100,
        calculatedTax: Math.round(calculatedTax * 100) / 100,
        saltCapApplied: totalStateTax > 10000
      },
      ficaBreakdown: {
        totalFICA: Math.round(totalFICA * 100) / 100,
        eligibleForRefund: eligibleForRefund,
        yearsSinceEntry: yearsSinceEntry,
        ficaRefund: Math.round(ficaRefund * 100) / 100,
        dateEnteredUS: dateEnteredUS || null
      }
    }
  } catch (error) {
    logger.error('Error calculating W-2 tax:', error)
    throw error
  }
}

