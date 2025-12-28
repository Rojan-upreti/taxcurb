import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// Security middleware - set security headers
app.use((req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Prevent MIME type sniffing
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies
}));
app.use(express.json({ limit: '10mb' })); // Limit request body size
app.use(cookieParser());

// Initialize Firebase Admin with credentials from .env
let firebaseAdminInitialized = false;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    firebaseAdminInitialized = true;
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.log('Continuing without Firebase Admin - will use REST API only');
  }
} else {
  console.log('Firebase Admin credentials not found - will use REST API only');
}

// Helper function to authenticate with Firebase REST API
async function authenticateWithFirebase(email, password) {
  if (!FIREBASE_API_KEY) {
    throw new Error('Firebase API key not configured');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Authentication failed');
  }

  return data;
}

// Helper function to create user with Firebase REST API
async function createUserWithFirebase(email, password) {
  if (!FIREBASE_API_KEY) {
    throw new Error('Firebase API key not configured');
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'User creation failed');
  }

  return data;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TaxCurb API is running',
    firebaseAdmin: firebaseAdminInitialized,
    hasApiKey: !!FIREBASE_API_KEY
  });
});

// Check authentication status endpoint
app.get('/api/auth/check', async (req, res) => {
  try {
    const token = req.cookies.taxcurb_token;

    if (!token) {
      return res.json({ authenticated: false, user: null });
    }

    // Verify token using Firebase REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: token,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error || !data.users || data.users.length === 0) {
      // Invalid token, clear cookie
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      };
      res.clearCookie('taxcurb_token', cookieOptions);
      res.clearCookie('taxcurb_user', cookieOptions);
      return res.json({ authenticated: false, user: null });
    }

    const user = {
      uid: data.users[0].localId,
      email: data.users[0].email,
    };

    res.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    };
    res.clearCookie('taxcurb_token', cookieOptions);
    res.clearCookie('taxcurb_user', cookieOptions);
    res.json({ authenticated: false, user: null });
  }
});

// Signup endpoint - backend handles all Firebase operations
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Validate and sanitize email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length and strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Prevent password from being too long (prevent DoS)
    if (password.length > 128) {
      return res.status(400).json({ 
        error: 'Password is too long' 
      });
    }

    // Create user using Firebase REST API
    const firebaseResponse = await createUserWithFirebase(sanitizedEmail, password);

    // Set HTTP-only cookies for session management
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('taxcurb_token', firebaseResponse.idToken, cookieOptions);
    res.cookie('taxcurb_user', JSON.stringify({
      uid: firebaseResponse.localId,
      email: firebaseResponse.email,
    }), cookieOptions);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        uid: firebaseResponse.localId,
        email: firebaseResponse.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle Firebase REST API errors
    if (error.message.includes('EMAIL_EXISTS')) {
      return res.status(409).json({ 
        error: 'An account with this email already exists' 
      });
    }
    
    if (error.message.includes('INVALID_EMAIL')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    if (error.message.includes('WEAK_PASSWORD')) {
      return res.status(400).json({ 
        error: 'Password is too weak' 
      });
    }

    res.status(500).json({ 
      error: error.message || 'Failed to create account. Please try again.' 
    });
  }
});

// Signin endpoint - backend handles all Firebase operations
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Prevent password from being too long (prevent DoS)
    if (password.length > 128) {
      return res.status(400).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Authenticate using Firebase REST API
    const firebaseResponse = await authenticateWithFirebase(sanitizedEmail, password);

    // Set HTTP-only cookies for session management
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('taxcurb_token', firebaseResponse.idToken, cookieOptions);
    res.cookie('taxcurb_user', JSON.stringify({
      uid: firebaseResponse.localId,
      email: firebaseResponse.email,
    }), cookieOptions);

    res.json({
      success: true,
      message: 'Sign in successful',
      user: {
        uid: firebaseResponse.localId,
        email: firebaseResponse.email,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    
    // Handle Firebase REST API errors - use generic messages to prevent information leakage
    if (error.message && (error.message.includes('EMAIL_NOT_FOUND') || error.message.includes('INVALID_PASSWORD'))) {
      // Don't reveal whether email exists or password is wrong
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    if (error.message && error.message.includes('INVALID_EMAIL')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    res.status(500).json({ 
      error: 'Failed to sign in. Please try again.' 
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
  res.clearCookie('taxcurb_token', cookieOptions);
  res.clearCookie('taxcurb_user', cookieOptions);
  res.json({ success: true, message: 'Logged out successfully' });
});

// Verify token endpoint
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        error: 'ID token is required' 
      });
    }

    // Verify token using Firebase REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }

    res.json({
      success: true,
      user: {
        uid: data.users[0].localId,
        email: data.users[0].email,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  if (!FIREBASE_API_KEY) {
    console.warn('WARNING: FIREBASE_API_KEY not found in .env file');
  }
});
