/**
 * Vehicle Tax Calculator Service
 * Handles API calls for vehicle loan interest deduction calculator
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Decode VIN using backend API
 * @param {string} vin - Vehicle Identification Number
 * @param {number} modelYear - Optional model year
 * @returns {Promise<Object>} Decoded vehicle data
 */
export async function decodeVIN(vin, modelYear = null) {
  try {
    const response = await fetch(`${API_URL}/api/vehicle/decode-vin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ vin, modelYear }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to decode VIN');
    }

    const data = await response.json();
    return data.vehicle;
  } catch (error) {
    console.error('VIN decode error:', error);
    throw error;
  }
}

/**
 * Check vehicle eligibility for interest deduction
 * @param {Object} vehicleData - Vehicle information
 * @param {Object} loanData - Loan information
 * @returns {Promise<Object>} Eligibility result
 */
export async function checkVehicleEligibility(vehicleData, loanData) {
  try {
    console.log('Checking eligibility with:', { vehicleData, loanData });
    const response = await fetch(`${API_URL}/api/vehicle/check-eligibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ vehicleData, loanData }),
    });

    console.log('Eligibility API response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
      console.error('Eligibility API error response:', error);
      throw new Error(error.error || `Failed to check eligibility: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Eligibility API response data:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to check eligibility');
    }
    
    if (!data.eligibility) {
      throw new Error('Invalid response format from server');
    }
    
    return data.eligibility;
  } catch (error) {
    console.error('Eligibility check error:', error);
    throw error;
  }
}

/**
 * Calculate vehicle interest deduction
 * @param {Object} vehicleData - Vehicle information
 * @param {Object} loanData - Loan information
 * @param {Object} taxData - Tax information
 * @returns {Promise<Object>} Calculation result
 */
export async function calculateVehicleInterest(vehicleData, loanData, taxData = {}) {
  try {
    const response = await fetch(`${API_URL}/api/vehicle/calculate-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ vehicleData, loanData, taxData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to calculate interest');
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Interest calculation error:', error);
    throw error;
  }
}

/**
 * Get all vehicle makes
 * @returns {Promise<Array>} List of vehicle makes
 */
export async function getVehicleMakes() {
  try {
    console.log('Fetching makes from:', `${API_URL}/api/vehicle/makes`);
    const response = await fetch(`${API_URL}/api/vehicle/makes`, {
      method: 'GET',
      credentials: 'include',
    });

    console.log('Makes API response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
      console.error('Makes API error response:', error);
      throw new Error(error.error || `Failed to fetch makes: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Makes API response data:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch makes');
    }
    
    if (!data.makes || !Array.isArray(data.makes)) {
      console.warn('Invalid makes data format:', data);
      throw new Error('Invalid response format from server');
    }
    
    return data.makes;
  } catch (error) {
    console.error('Error fetching makes:', error);
    throw error;
  }
}

/**
 * Get vehicle models for a make and year
 * @param {string} make - Vehicle make
 * @param {number} year - Model year
 * @returns {Promise<Array>} List of vehicle models
 */
export async function getVehicleModels(make, year) {
  try {
    const url = `${API_URL}/api/vehicle/models?make=${encodeURIComponent(make)}&year=${year}`;
    console.log('Fetching models from:', url);
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    console.log('Models API response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
      console.error('Models API error response:', error);
      throw new Error(error.error || `Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Models API response data:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch models');
    }
    
    if (!data.models || !Array.isArray(data.models)) {
      console.warn('Invalid models data format:', data);
      throw new Error('Invalid response format from server');
    }
    
    return data.models;
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

