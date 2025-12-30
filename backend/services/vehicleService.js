/**
 * Vehicle Loan Interest Deduction Service
 * Handles VIN decoding, eligibility checks, and interest calculations
 */

import logger from '../utils/logger.js';

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';

/**
 * Decode VIN using NHTSA VPIC API
 * @param {string} vin - Vehicle Identification Number
 * @param {number} modelYear - Optional model year for better accuracy
 * @returns {Promise<Object>} Decoded vehicle information
 */
export async function decodeVIN(vin, modelYear = null) {
  try {
    if (!vin || vin.length < 11) {
      throw new Error('VIN must be at least 11 characters');
    }

    // Clean VIN - remove spaces and convert to uppercase
    const cleanVIN = vin.trim().toUpperCase().replace(/\s+/g, '');
    
    // Use flat format for easier parsing
    let url = `${NHTSA_API_BASE}/DecodeVinValues/${cleanVIN}?format=json`;
    if (modelYear) {
      url += `&modelyear=${modelYear}`;
    }

    logger.debug(`Decoding VIN: ${cleanVIN}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      throw new Error('No vehicle data found for this VIN');
    }

    const vehicle = data.Results[0];
    
    // Check for errors in the response
    if (vehicle.ErrorCode && vehicle.ErrorCode !== '0') {
      throw new Error(vehicle.ErrorText || 'Failed to decode VIN');
    }

    // Extract relevant information
    const vehicleData = {
      vin: cleanVIN,
      make: vehicle.Make || null,
      model: vehicle.Model || null,
      modelYear: vehicle.ModelYear || null,
      bodyClass: vehicle.BodyClass || null,
      vehicleType: vehicle.VehicleType || null,
      gvwr: vehicle.GVWR || null,
      // Assembly location - check multiple fields
      plantCountry: vehicle.PlantCountry || null,
      plantState: vehicle.PlantState || null,
      plantCity: vehicle.PlantCity || null,
      // Additional useful fields
      engineCylinders: vehicle.EngineCylinders || null,
      engineModel: vehicle.EngineModel || null,
      fuelTypePrimary: vehicle.FuelTypePrimary || null,
      driveType: vehicle.DriveType || null,
      // Check if assembled in USA
      assembledInUSA: (vehicle.PlantCountry && 
                       vehicle.PlantCountry.toUpperCase().includes('UNITED STATES')) || 
                      (vehicle.PlantState && 
                       vehicle.PlantState.length > 0) || false,
    };

    logger.debug('Decoded vehicle:', vehicleData);
    return vehicleData;
  } catch (error) {
    logger.error('VIN decode error:', error);
    throw error;
  }
}

/**
 * Check vehicle eligibility for interest deduction
 * @param {Object} vehicleData - Vehicle information
 * @param {Object} loanData - Loan information
 * @returns {Object} Eligibility result with reasons
 */
export function checkVehicleEligibility(vehicleData, loanData) {
  const eligibility = {
    eligible: true,
    reasons: [],
    warnings: [],
  };

  // STEP 3: Check tax year
  const taxYear = loanData.taxYear || new Date().getFullYear();
  if (taxYear < 2025 || taxYear > 2028) {
    eligibility.eligible = false;
    eligibility.reasons.push(`Tax year ${taxYear} is not eligible. Must be between 2025 and 2028.`);
    return eligibility;
  }

  // STEP 4: Loan eligibility checks (only if loan data is provided)
  if (loanData.loanStartDate) {
    const loanStart = new Date(loanData.loanStartDate);
    const cutoffDate = new Date('2024-12-31');
    if (loanStart <= cutoffDate) {
      eligibility.eligible = false;
      eligibility.reasons.push('Loan must start after December 31, 2024.');
    }
  }

  // Check purchase date if provided in vehicleData
  if (vehicleData.purchaseDate) {
    const purchaseDate = new Date(vehicleData.purchaseDate);
    const cutoffDate = new Date('2024-12-31');
    if (purchaseDate <= cutoffDate) {
      eligibility.eligible = false;
      eligibility.reasons.push('Vehicle must be purchased after December 31, 2024.');
    }
  }

  if (loanData.isLease === true) {
    eligibility.eligible = false;
    eligibility.reasons.push('Leases are not eligible for this deduction.');
  }

  if (loanData.personalUse === false) {
    eligibility.eligible = false;
    eligibility.reasons.push('Vehicle must be for personal use.');
  }

  if (loanData.securedByLien === false) {
    eligibility.eligible = false;
    eligibility.reasons.push('Loan must be secured by a lien on the vehicle.');
  }

  if (loanData.isUsedVehicle === true) {
    eligibility.eligible = false;
    eligibility.reasons.push('Used vehicles are not eligible. Vehicle must be new.');
  }

  // STEP 5: Vehicle eligibility checks
  // Check vehicle type (must be passenger vehicle, truck, SUV, etc.)
  const allowedVehicleTypes = ['PASSENGER CAR', 'MULTIPURPOSE PASSENGER VEHICLE (MPV)', 
                               'TRUCK', 'INCOMPLETE VEHICLE'];
  if (vehicleData.vehicleType && 
      !allowedVehicleTypes.some(type => vehicleData.vehicleType.toUpperCase().includes(type))) {
    eligibility.warnings.push(`Vehicle type "${vehicleData.vehicleType}" may not be eligible.`);
  }

  // Check GVWR (must be less than 14,000 lbs)
  if (vehicleData.gvwr) {
    const gvwrNum = parseFloat(vehicleData.gvwr.replace(/[^0-9.]/g, ''));
    if (gvwrNum >= 14000) {
      eligibility.eligible = false;
      eligibility.reasons.push('Vehicle GVWR must be less than 14,000 lbs.');
    }
  }

  // Check final assembly location (must be USA)
  // For manual entry, assembledInUSA might not be available, so we add a warning instead
  if (vehicleData.assembledInUSA === false) {
    eligibility.eligible = false;
    eligibility.reasons.push('Vehicle must be assembled or manufactured in the USA.');
  } else if (vehicleData.assembledInUSA === null || vehicleData.assembledInUSA === undefined) {
    // For manual entry, we can't verify assembly location, so add a warning
    eligibility.warnings.push('Unable to verify if vehicle is assembled in USA. Please verify this requirement separately.');
  }

  return eligibility;
}

/**
 * Calculate vehicle loan interest deduction
 * @param {Object} vehicleData - Vehicle information
 * @param {Object} loanData - Loan information (purchasePrice, downPayment, loanTermMonths, APR, monthlyPayment, loanStartDate)
 * @param {Object} taxData - Tax information (taxYear, filingStatus, MAGI)
 * @returns {Object} Calculation result
 */
export function calculateVehicleInterestDeduction(vehicleData, loanData, taxData = {}) {
  try {
    const {
      purchasePrice,
      downPayment = 0,
      loanTermMonths,
      APR,
      monthlyPayment = null,
      loanStartDate,
    } = loanData;

    const taxYear = taxData.taxYear || new Date().getFullYear();
    const filingStatus = taxData.filingStatus || 'SINGLE';
    const MAGI = taxData.MAGI || 0;

    // STEP 7: Calculate loan principal
    const principal = purchasePrice - downPayment;

    // STEP 8: Calculate monthly interest rate
    const monthlyRate = APR / 12 / 100;

    // STEP 9: Calculate monthly payment if not provided
    let calculatedMonthlyPayment = monthlyPayment;
    if (!calculatedMonthlyPayment) {
      const numerator = monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths);
      const denominator = Math.pow(1 + monthlyRate, loanTermMonths) - 1;
      calculatedMonthlyPayment = principal * (numerator / denominator);
    }

    // STEP 10: Calculate interest paid in tax year
    let remainingBalance = principal;
    let totalInterestForYear = 0;
    
    const loanStart = new Date(loanStartDate);
    const taxYearStart = new Date(`${taxYear}-01-01`);
    const taxYearEnd = new Date(`${taxYear}-12-31`);

    // Find the first payment month within the tax year
    let currentDate = new Date(loanStart);
    let paymentMonth = 0;

    // Skip to the first month of the tax year if loan started earlier
    while (currentDate < taxYearStart && paymentMonth < loanTermMonths) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalPaid = calculatedMonthlyPayment - interestForMonth;
      remainingBalance -= principalPaid;
      currentDate.setMonth(currentDate.getMonth() + 1);
      paymentMonth++;
    }

    // Calculate interest for payments within the tax year
    while (currentDate <= taxYearEnd && paymentMonth < loanTermMonths && remainingBalance > 0) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalPaid = calculatedMonthlyPayment - interestForMonth;
      remainingBalance = Math.max(0, remainingBalance - principalPaid);
      totalInterestForYear += interestForMonth;
      
      currentDate.setMonth(currentDate.getMonth() + 1);
      paymentMonth++;
    }

    // STEP 11: Apply IRS deduction cap ($10,000)
    let deductibleInterest = Math.min(totalInterestForYear, 10000);

    // STEP 12: Apply income phaseout (if applicable)
    let phaseoutReduction = 0;
    if (filingStatus === 'SINGLE' && MAGI > 100000) {
      const excess = MAGI - 100000;
      phaseoutReduction = Math.min(deductibleInterest, excess * 0.5); // 50% reduction per dollar over limit
      deductibleInterest = Math.max(0, deductibleInterest - phaseoutReduction);
    } else if (filingStatus === 'MARRIED_JOINT' && MAGI > 200000) {
      const excess = MAGI - 200000;
      phaseoutReduction = Math.min(deductibleInterest, excess * 0.5);
      deductibleInterest = Math.max(0, deductibleInterest - phaseoutReduction);
    }

    return {
      success: true,
      vehicle: {
        vin: vehicleData.vin,
        make: vehicleData.make,
        model: vehicleData.model,
        modelYear: vehicleData.modelYear,
      },
      loan: {
        principal,
        monthlyPayment: calculatedMonthlyPayment,
        totalPayments: loanTermMonths,
      },
      calculation: {
        taxYear,
        totalInterestForYear: Math.round(totalInterestForYear * 100) / 100,
        deductibleInterest: Math.round(deductibleInterest * 100) / 100,
        phaseoutReduction: Math.round(phaseoutReduction * 100) / 100,
        remainingBalance: Math.round(remainingBalance * 100) / 100,
      },
      status: 'ELIGIBLE',
    };
  } catch (error) {
    logger.error('Interest calculation error:', error);
    throw error;
  }
}

/**
 * Get all vehicle makes from NHTSA API
 * @returns {Promise<Array>} List of vehicle makes
 */
export async function getVehicleMakes() {
  try {
    const response = await fetch(`${NHTSA_API_BASE}/GetAllMakes?format=json`);
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      return [];
    }

    return data.Results.map(make => ({
      id: make.Make_ID,
      name: make.Make_Name,
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    logger.error('Error fetching makes:', error);
    throw error;
  }
}

/**
 * Get vehicle models for a specific make and year
 * @param {string} make - Vehicle make name
 * @param {number} year - Model year
 * @returns {Promise<Array>} List of vehicle models
 */
export async function getVehicleModels(make, year) {
  try {
    if (!make || !year) {
      throw new Error('Make and year are required');
    }

    const response = await fetch(
      `${NHTSA_API_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`
    );
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Results || data.Results.length === 0) {
      return [];
    }

    return data.Results.map(model => ({
      id: model.Model_ID,
      name: model.Model_Name,
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    logger.error('Error fetching models:', error);
    throw error;
  }
}

