import logger from '../utils/logger';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Sign up with email and password - all handled by backend
export const signUp = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    // Note: User data is stored in HTTP-only cookies by backend for security
    // sessionStorage is not used to prevent XSS attacks

    return data;
  } catch (error) {
    logger.error('Sign up error:', error);
    throw new Error(error.message || 'Failed to create account');
  }
};

// Sign in with email and password - all handled by backend
export const signIn = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    // Note: User data is stored in HTTP-only cookies by backend for security
    // sessionStorage is not used to prevent XSS attacks

    return data;
  } catch (error) {
    logger.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out - clears cookies and session storage
export const signOut = async () => {
  try {
    // Call backend to clear cookies
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    // Note: Cookies are cleared by backend
    return { success: true };
  } catch (error) {
    logger.error('Sign out error:', error);
    return { success: true };
  }
};

// Check authentication status from backend
export const checkAuth = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/check`, {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (data.authenticated && data.user) {
      // User data is in HTTP-only cookies, no need for sessionStorage
      return data.user;
    }

    // Not authenticated
    return null;
  } catch (error) {
    logger.error('Auth check error:', error);
    return null;
  }
};

// Get current user - should use checkAuth() instead for security
// This is kept for backward compatibility but should not be used
export const getCurrentUser = () => {
  // Note: HTTP-only cookies cannot be accessed via JavaScript
  // Use checkAuth() instead which calls the backend
  // This function is kept for compatibility but returns null
  return null;
};

// Verify token with backend
export const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        idToken: token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Token verification failed');
    }

    return data;
  } catch (error) {
    logger.error('Token verification error:', error);
    throw error;
  }
};

// Forgot password - sends reset email
export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send reset email');
    }

    return data;
  } catch (error) {
    logger.error('Forgot password error:', error);
    throw new Error(error.message || 'Failed to send reset email');
  }
};

// Reset password - verifies code and sets new password
export const resetPassword = async (oobCode, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oobCode,
        newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    logger.error('Reset password error:', error);
    throw new Error(error.message || 'Failed to reset password');
  }
};
