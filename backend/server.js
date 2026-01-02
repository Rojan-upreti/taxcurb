import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import logger from './utils/logger.js';

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

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests too
  skipFailedRequests: false, // Count failed requests
});

// Stricter rate limiter for password reset (fewer attempts allowed)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    error: 'Too many password reset attempts from this IP, please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

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
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Error initializing Firebase Admin:', error);
    logger.info('Continuing without Firebase Admin - will use REST API only');
  }
} else {
  logger.info('Firebase Admin credentials not found - will use REST API only');
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
    logger.error('Auth check error:', error);
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
app.post('/api/auth/signup', authLimiter, async (req, res) => {
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
    logger.error('Signup error:', error);
    
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
app.post('/api/auth/signin', authLimiter, async (req, res) => {
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
    logger.error('Signin error:', error);
    
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
    logger.error('Token verification error:', error);
    res.status(401).json({ 
      error: 'Invalid or expired token' 
    });
  }
});

// PDF Generation Endpoint
app.post('/api/forms/8843/generate', async (req, res) => {
  try {
    const formData = req.body;
    
    logger.debug('\n=== Form 8843 Generation Request ===');
    logger.debug('Received form data for:', formData.firstName, formData.lastName);
    
    const { fillForm8843 } = await import('./services/pdfService.js');
    const pdfBytes = await fillForm8843(formData);
    
    const base64PDF = Buffer.from(pdfBytes).toString('base64');
    
    logger.info('✓ PDF generated successfully\n');
    
    res.json({
      success: true,
      pdf: base64PDF,
      message: 'Form 8843 generated successfully'
    });
  } catch (error) {
    logger.error('PDF generation error:', error);
    
    let errorMessage = 'Failed to generate PDF';
    if (error.message.includes('XFA') || error.message.includes('removing')) {
      errorMessage = 'PDF uses XFA format. The form will still work, but XFA data is removed.';
    } else {
      errorMessage = error.message || 'Failed to generate PDF';
    }
    
    res.status(500).json({ 
      success: false,
      error: errorMessage 
    });
  }
});

// Forgot password endpoint - sends reset email
app.post('/api/auth/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }

    // Validate and sanitize email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!FIREBASE_API_KEY) {
      return res.status(500).json({ 
        error: 'Password reset service is not configured' 
      });
    }

    // Use Firebase REST API to send password reset email
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: sanitizedEmail,
          continueUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Don't reveal if email exists or not (security best practice)
      if (data.error?.message?.includes('EMAIL_NOT_FOUND')) {
        // Still return success to prevent email enumeration
        return res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        });
      }
      
      throw new Error(data.error?.message || 'Failed to send reset email');
    }

    // Always return success message (don't reveal if email exists)
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    // Still return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  }
});

// PDF Field Inspection Endpoint (for debugging)
app.get('/api/forms/8843/fields', async (req, res) => {
  try {
    const { getPDFFieldNames } = await import('./services/pdfService.js');
    const fields = await getPDFFieldNames();
    
    res.json({
      success: true,
      fields: fields,
      count: fields.length
    });
  } catch (error) {
    logger.error('Field inspection error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Vehicle Tax Calculator Endpoints

// Decode VIN endpoint
app.post('/api/vehicle/decode-vin', async (req, res) => {
  try {
    const { vin, modelYear } = req.body;

    if (!vin) {
      return res.status(400).json({ 
        error: 'VIN is required' 
      });
    }

    const { decodeVIN } = await import('./services/vehicleService.js');
    const vehicleData = await decodeVIN(vin, modelYear);

    res.json({
      success: true,
      vehicle: vehicleData,
    });
  } catch (error) {
    logger.error('VIN decode error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to decode VIN' 
    });
  }
});

// Check vehicle eligibility endpoint
app.post('/api/vehicle/check-eligibility', async (req, res) => {
  try {
    const { vehicleData, loanData } = req.body;

    logger.debug('\n=== Eligibility Check Request ===');
    logger.debug('Vehicle Data:', JSON.stringify(vehicleData, null, 2));
    logger.debug('Loan Data:', JSON.stringify(loanData, null, 2));

    if (!vehicleData || !loanData) {
      return res.status(400).json({ 
        success: false,
        error: 'Vehicle data and loan data are required' 
      });
    }

    const { checkVehicleEligibility } = await import('./services/vehicleService.js');
    const eligibility = checkVehicleEligibility(vehicleData, loanData);

    logger.debug('Eligibility Result:', JSON.stringify(eligibility, null, 2));
    logger.debug('=================================\n');

    res.json({
      success: true,
      eligibility,
    });
  } catch (error) {
    logger.error('Eligibility check error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to check eligibility' 
    });
  }
});

// Calculate vehicle interest deduction endpoint
app.post('/api/vehicle/calculate-interest', async (req, res) => {
  try {
    const { vehicleData, loanData, taxData } = req.body;

    if (!vehicleData || !loanData) {
      return res.status(400).json({ 
        error: 'Vehicle data and loan data are required' 
      });
    }

    const { calculateVehicleInterestDeduction } = await import('./services/vehicleService.js');
    const result = calculateVehicleInterestDeduction(vehicleData, loanData, taxData);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error('Interest calculation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to calculate interest deduction' 
    });
  }
});

// Get vehicle makes endpoint
app.get('/api/vehicle/makes', async (req, res) => {
  try {
    logger.debug('Fetching vehicle makes from NHTSA API...');
    const { getVehicleMakes } = await import('./services/vehicleService.js');
    const makes = await getVehicleMakes();

    logger.debug(`Successfully fetched ${makes.length} vehicle makes`);

    res.json({
      success: true,
      makes,
    });
  } catch (error) {
    logger.error('Error fetching makes:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch vehicle makes' 
    });
  }
});

// Get vehicle models endpoint
app.get('/api/vehicle/models', async (req, res) => {
  try {
    const { make, year } = req.query;

    if (!make || !year) {
      return res.status(400).json({ 
        success: false,
        error: 'Make and year are required' 
      });
    }

    logger.debug(`Fetching models for make: ${make}, year: ${year}`);
    const { getVehicleModels } = await import('./services/vehicleService.js');
    const models = await getVehicleModels(make, parseInt(year));

    logger.debug(`Found ${models.length} models for ${make} ${year}`);

    res.json({
      success: true,
      models,
    });
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to fetch vehicle models' 
    });
  }
});

// Reset password endpoint - verifies code and updates password
app.post('/api/auth/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { oobCode, newPassword } = req.body;

    if (!oobCode || !newPassword) {
      return res.status(400).json({ 
        error: 'Reset code and new password are required' 
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ 
        error: 'Password is too long' 
      });
    }

    if (!FIREBASE_API_KEY) {
      return res.status(500).json({ 
        error: 'Password reset service is not configured' 
      });
    }

    // Verify the reset code and reset password using Firebase REST API
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oobCode,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.message?.includes('EXPIRED_OOB_CODE')) {
        return res.status(400).json({ 
          error: 'This reset link has expired. Please request a new one.' 
        });
      }
      
      if (data.error?.message?.includes('INVALID_OOB_CODE')) {
        return res.status(400).json({ 
          error: 'Invalid or expired reset link. Please request a new one.' 
        });
      }

      throw new Error(data.error?.message || 'Failed to reset password');
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to reset password. Please try again.' 
    });
  }
});

// W-2 Tax Calculation Endpoint
app.post('/api/tax/calculate-w2', async (req, res) => {
  try {
    const filingData = req.body;

    if (!filingData || !filingData.filing_income) {
      return res.status(400).json({
        success: false,
        error: 'Filing data is required. Missing filing_income data.'
      });
    }

    logger.debug('\n=== W-2 Tax Calculation Request ===');
    logger.debug('Received filing data for tax calculation');

    const { calculateW2Tax } = await import('./services/w2TaxCalculationService.js');
    const result = calculateW2Tax(filingData);

    logger.info('✓ Tax calculation completed successfully\n');

    res.json(result);
  } catch (error) {
    logger.error('W-2 tax calculation error:', error);

    let errorMessage = 'Failed to calculate tax';
    if (error.message.includes('No W-2 documents')) {
      errorMessage = error.message;
    } else {
      errorMessage = error.message || 'Failed to calculate tax';
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`PDF fields: http://localhost:${PORT}/api/forms/8843/fields`);
  if (!FIREBASE_API_KEY) {
    logger.warn('WARNING: FIREBASE_API_KEY not found in .env file');
  }
});
