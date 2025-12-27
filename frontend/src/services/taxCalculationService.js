// Tax calculation service for 1040-NR (Non-Resident Alien) tax returns
// Based on 2024 tax brackets (will need to be updated for different years)

/**
 * Get tax brackets for a given tax year
 * @param {string} taxYear - Tax year (e.g., '2024')
 * @returns {Array} Tax brackets
 */
const getTaxBrackets = (taxYear) => {
  // 2024 tax brackets for Single filers (1040-NR uses same brackets)
  // Format: [min, max, rate]
  const brackets2024 = [
    [0, 11000, 0.10],
    [11000, 44725, 0.12],
    [44725, 95375, 0.22],
    [95375, 201050, 0.24],
    [201050, 502600, 0.32],
    [502600, 577150, 0.35],
    [577150, Infinity, 0.37],
  ];

  // 2023 tax brackets
  const brackets2023 = [
    [0, 11000, 0.10],
    [11000, 44725, 0.12],
    [44725, 95350, 0.22],
    [95350, 200525, 0.24],
    [200525, 492300, 0.32],
    [492300, 578125, 0.35],
    [578125, Infinity, 0.37],
  ];

  // 2025 tax brackets (estimated, may need adjustment)
  const brackets2025 = [
    [0, 11600, 0.10],
    [11600, 47150, 0.12],
    [47150, 100525, 0.22],
    [100525, 191950, 0.24],
    [191950, 243725, 0.32],
    [243725, 609350, 0.35],
    [609350, Infinity, 0.37],
  ];

  const bracketMap = {
    '2025': brackets2025,
    '2024': brackets2024,
    '2023': brackets2023,
  };

  return bracketMap[taxYear] || brackets2024;
};

/**
 * Calculate federal income tax for non-resident aliens
 * @param {number} taxableIncome - Taxable income amount
 * @param {string} taxYear - Tax year
 * @returns {number} Federal tax owed
 */
export const calculateFederalTax = (taxableIncome, taxYear = '2024') => {
  if (taxableIncome <= 0) return 0;

  const brackets = getTaxBrackets(taxYear);
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (let i = 0; i < brackets.length; i++) {
    const [min, max, rate] = brackets[i];
    
    if (remainingIncome <= 0) break;
    
    if (taxableIncome > min) {
      const taxableInBracket = Math.min(remainingIncome, max - min);
      tax += taxableInBracket * rate;
      remainingIncome -= taxableInBracket;
    }
  }

  return Math.round(tax * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate standard deduction for non-resident aliens
 * Note: Non-resident aliens generally cannot claim standard deduction
 * but may claim itemized deductions
 * @param {string} filingStatus - Filing status
 * @param {string} taxYear - Tax year
 * @returns {number} Standard deduction (usually 0 for NRAs)
 */
export const getStandardDeduction = (filingStatus = 'Single', taxYear = '2024') => {
  // Non-resident aliens typically cannot claim standard deduction
  // They can only claim itemized deductions
  return 0;
};

/**
 * Calculate total income from various sources
 * @param {Object} incomeData - Income data object
 * @returns {Object} Calculated income breakdown
 */
export const calculateTotalIncome = (incomeData) => {
  const {
    w2Income = 0,
    income1042S = 0,
    otherIncome = 0,
  } = incomeData;

  const totalIncome = w2Income + income1042S + otherIncome;

  return {
    w2Income,
    income1042S,
    otherIncome,
    totalIncome,
  };
};

/**
 * Calculate taxable income
 * @param {number} totalIncome - Total income
 * @param {number} deductions - Total deductions (itemized)
 * @param {number} exemptions - Personal exemptions (if applicable)
 * @returns {number} Taxable income
 */
export const calculateTaxableIncome = (totalIncome, deductions = 0, exemptions = 0) => {
  // For non-resident aliens, taxable income = total income - deductions
  // Personal exemptions are generally not available for NRAs
  const taxableIncome = Math.max(0, totalIncome - deductions - exemptions);
  return taxableIncome;
};

/**
 * Calculate state tax (simplified - actual calculation varies by state)
 * @param {number} taxableIncome - Taxable income
 * @param {string} state - State code (e.g., 'CA', 'NY')
 * @param {string} taxYear - Tax year
 * @returns {number} State tax owed (simplified calculation)
 */
export const calculateStateTax = (taxableIncome, state = null, taxYear = '2024') => {
  if (!state || taxableIncome <= 0) return 0;

  // Simplified state tax calculation
  // Actual state tax rates vary significantly by state
  // This is a placeholder - should be replaced with actual state tax tables
  
  // Example: California has progressive rates, but simplified here
  // Most states have flat or progressive rates
  const stateTaxRates = {
    'CA': 0.01, // Simplified - CA actually has progressive brackets
    'NY': 0.04, // Simplified - NY has progressive brackets
    'TX': 0,    // No state income tax
    'FL': 0,    // No state income tax
    'WA': 0,    // No state income tax
  };

  const rate = stateTaxRates[state] || 0.03; // Default 3% if state not found
  return Math.round(taxableIncome * rate * 100) / 100;
};

/**
 * Main tax calculation function
 * @param {Object} taxData - Complete tax data object
 * @returns {Object} Complete tax calculation results
 */
export const calculateTax = (taxData) => {
  const {
    taxYear = '2024',
    filingStatus = 'Single',
    income = {},
    deductions = 0,
    state = null,
    w2Withholdings = 0,
    otherWithholdings = 0,
  } = taxData;

  // Calculate total income
  const incomeBreakdown = calculateTotalIncome(income);
  const { totalIncome } = incomeBreakdown;

  // Calculate taxable income
  const taxableIncome = calculateTaxableIncome(totalIncome, deductions, 0);

  // Calculate federal tax
  const federalTax = calculateFederalTax(taxableIncome, taxYear);

  // Calculate state tax
  const stateTax = calculateStateTax(taxableIncome, state, taxYear);

  // Total tax owed
  const totalTaxOwed = federalTax + stateTax;

  // Total withholdings
  const totalWithholdings = w2Withholdings + otherWithholdings;

  // Refund or amount owed
  const refund = Math.max(0, totalWithholdings - totalTaxOwed);
  const amountOwed = Math.max(0, totalTaxOwed - totalWithholdings);

  return {
    taxYear,
    filingStatus,
    income: incomeBreakdown,
    deductions,
    taxableIncome,
    federalTax,
    stateTax,
    totalTaxOwed,
    withholdings: {
      w2: w2Withholdings,
      other: otherWithholdings,
      total: totalWithholdings,
    },
    refund,
    amountOwed,
    calculatedAt: new Date().toISOString(),
  };
};

/**
 * Get mock income data for testing
 * This simulates having W-2 and 1042-S documents
 */
export const getMockIncomeData = () => {
  return {
    w2Income: 18500,
    income1042S: 10000,
    otherIncome: 0,
    w2Withholdings: 2000,
    otherWithholdings: 0,
  };
};

