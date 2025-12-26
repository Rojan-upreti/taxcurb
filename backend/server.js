import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin (optional - for token verification)
// Note: You'll need to download service account key from Firebase Console
// For now, we'll work with the client-side auth and just store user info
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
    console.log('Continuing without Firebase Admin - using client-side auth only');
  }
} else {
  console.log('Firebase Admin credentials not found - using client-side auth only');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'TaxCurb API is running',
    firebaseAdmin: firebaseAdminInitialized 
  });
});

// Signup endpoint - receives Firebase user info after client-side signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, uid, idToken } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ 
        error: 'Email and UID are required' 
      });
    }

    // If Firebase Admin is initialized, verify the token
    if (firebaseAdminInitialized && idToken) {
      try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        // Token is valid, proceed
      } catch (error) {
        return res.status(401).json({ 
          error: 'Invalid authentication token' 
        });
      }
    }

    // Here you would typically save user info to your database
    // For now, we'll just return success
    res.status(201).json({
      success: true,
      message: 'User account created successfully',
      user: {
        uid,
        email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create account. Please try again.' 
    });
  }
});

// Signin endpoint - receives Firebase user info after client-side signin
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, uid, idToken } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ 
        error: 'Email and UID are required' 
      });
    }

    // If Firebase Admin is initialized, verify the token
    if (firebaseAdminInitialized && idToken) {
      try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        // Token is valid, proceed
      } catch (error) {
        return res.status(401).json({ 
          error: 'Invalid authentication token' 
        });
      }
    }

    // Here you would typically fetch user info from your database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Sign in successful',
      user: {
        uid,
        email,
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      error: 'Failed to sign in. Please try again.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
