import { useEffect } from 'react'

/**
 * Hook to automatically save form data to localStorage whenever dependencies change
 * and restore it on mount
 * 
 * @param {string} cacheKey - The localStorage key to use
 * @param {function} getFormData - Function that returns current form data object
 * @param {function} setFormData - Function to restore form data (called on mount)
 * @param {array} dependencies - Array of values to watch for changes (form state values)
 */
export function useFormCache(cacheKey, getFormData, setFormData, dependencies = []) {
  // Load cached data on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        setFormData(parsed)
      }
    } catch (e) {
      console.error(`Error loading cache for ${cacheKey}:`, e)
    }
  }, []) // Only run on mount

  // Save to cache whenever dependencies change
  useEffect(() => {
    try {
      const formData = getFormData()
      if (formData) {
        localStorage.setItem(cacheKey, JSON.stringify(formData))
      }
    } catch (e) {
      console.error(`Error saving cache for ${cacheKey}:`, e)
    }
  }, dependencies) // Save whenever dependencies change
}

