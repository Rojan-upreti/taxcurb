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

    // Also store in sessionStorage for quick access (backup)
    if (data.user) {
      sessionStorage.setItem('taxcurb_user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Sign up error:', error);
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

    // Also store in sessionStorage for quick access (backup)
    if (data.user) {
      sessionStorage.setItem('taxcurb_user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Sign in error:', error);
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

    // Clear session storage
    sessionStorage.removeItem('taxcurb_user');
    sessionStorage.removeItem('taxcurb_token');
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    // Clear local storage even if API call fails
    sessionStorage.removeItem('taxcurb_user');
    sessionStorage.removeItem('taxcurb_token');
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
      // Sync with sessionStorage
      sessionStorage.setItem('taxcurb_user', JSON.stringify(data.user));
      return data.user;
    }

    // Not authenticated, clear storage
    sessionStorage.removeItem('taxcurb_user');
    sessionStorage.removeItem('taxcurb_token');
    return null;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
};

// Get current user from sessionStorage or cookies
export const getCurrentUser = () => {
  // First try sessionStorage (faster)
  const userStr = sessionStorage.getItem('taxcurb_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }

  // Fallback to cookie (if available)
  const userCookie = getCookie('taxcurb_user');
  if (userCookie) {
    try {
      return JSON.parse(decodeURIComponent(userCookie));
    } catch (error) {
      return null;
    }
  }

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
    console.error('Token verification error:', error);
    throw error;
  }
};
