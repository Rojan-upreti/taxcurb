// Service for managing onboarding data in localStorage
// This will be replaced with database calls in Phase 1

const STORAGE_KEY = 'taxcurb_onboarding_data';

/**
 * Save onboarding answers to localStorage
 * @param {string} userId - User ID
 * @param {string} taxYear - Tax year
 * @param {Object} answers - Onboarding answers
 */
export const saveOnboardingData = (userId, taxYear, answers) => {
  try {
    const key = `${STORAGE_KEY}_${userId}_${taxYear}`;
    const data = {
      userId,
      taxYear,
      answers,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get onboarding data from localStorage
 * @param {string} userId - User ID
 * @param {string} taxYear - Tax year
 */
export const getOnboardingData = (userId, taxYear) => {
  try {
    const key = `${STORAGE_KEY}_${userId}_${taxYear}`;
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error getting onboarding data:', error);
    return null;
  }
};

/**
 * Update specific onboarding answer
 * @param {string} userId - User ID
 * @param {string} taxYear - Tax year
 * @param {string} questionKey - Question key
 * @param {any} value - Answer value
 */
export const updateOnboardingAnswer = (userId, taxYear, questionKey, value) => {
  try {
    const existing = getOnboardingData(userId, taxYear);
    const answers = existing?.answers || {};
    answers[questionKey] = value;
    
    const key = `${STORAGE_KEY}_${userId}_${taxYear}`;
    const data = {
      userId,
      taxYear,
      answers,
      completedAt: existing?.completedAt,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Error updating onboarding answer:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear onboarding data
 * @param {string} userId - User ID
 * @param {string} taxYear - Tax year
 */
export const clearOnboardingData = (userId, taxYear) => {
  try {
    const key = `${STORAGE_KEY}_${userId}_${taxYear}`;
    localStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error('Error clearing onboarding data:', error);
    return { success: false, error: error.message };
  }
};

