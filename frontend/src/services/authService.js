import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Sign up with email and password
export const signUp = async (email, password) => {
  try {
    // Create user in Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token
    const idToken = await user.getIdToken();

    // Send user info to backend API
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        uid: user.uid,
        idToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account');
    }

    return {
      user: {
        uid: user.uid,
        email: user.email,
      },
      ...data,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    // Re-throw Firebase errors with their codes
    if (error.code) {
      throw error;
    }
    throw new Error(error.message || 'Failed to create account');
  }
};

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get ID token
    const idToken = await user.getIdToken();

    // Send user info to backend API
    const response = await fetch(`${API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        uid: user.uid,
        idToken,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign in');
    }

    return {
      user: {
        uid: user.uid,
        email: user.email,
      },
      ...data,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    // Re-throw Firebase errors with their codes
    if (error.code) {
      throw error;
    }
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
