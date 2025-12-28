# TaxCurb Setup Guide

## Overview

TaxCurb uses a **backend-centric architecture** where all Firebase operations and API keys are handled in the backend. The frontend only makes API calls to the backend.

## Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file** in the `backend` directory:
   ```bash
   cd backend
   ```
   
   Create `.env` with your Firebase configuration:
   ```envle
   # Server Configuration
   PORT=3001
   FRONTEND_URL=http://localhost:5173

   # Firebase Configuration (REQUIRED)
   # Get these from Firebase Console → Project Settings → General → Your apps
   FIREBASE_API_KEY=your-firebase-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id

   # Firebase Admin SDK (OPTIONAL - for advanced user management)
   # Get these from Firebase Console → Project Settings → Service Accounts
   # FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
   # FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

3. **Important Notes:**
   - `FIREBASE_API_KEY` is **REQUIRED** for authentication (used for Firebase REST API)
   - Other Firebase config values are stored for reference but only API_KEY is currently used
   - Firebase Admin SDK credentials are optional (only needed for advanced features)

## Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file** in the `frontend` directory:
   ```bash
   cd frontend
   ```
   
   Create `.env` with:
   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:3001
   ```
   
   **Note:** The frontend does NOT need any Firebase configuration. All Firebase operations are handled by the backend.

## Running the Application

### Start Backend:
```bash
cd backend
npm start
```

The backend will run on `http://localhost:3001`

### Start Frontend:
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Architecture

**All API keys and Firebase operations are handled in the backend:**
- Backend uses Firebase REST API for authentication
- Backend uses Firebase Admin SDK for user management (optional)
- Frontend only makes HTTP requests to backend API endpoints
- No Firebase client SDK needed in frontend for authentication
- All Firebase config values are stored in `backend/.env` only

## Features

- ✅ Firebase Authentication (Email/Password) - handled by backend
- ✅ Cookie-based session management
- ✅ Protected routes
- ✅ Backend API integration
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation

## Security Notes

- **Never commit `.env` files to git** (they're in `.gitignore`)
- All Firebase API keys are stored only in `backend/.env`
- Frontend has no access to Firebase API keys
- Backend uses HTTP-only cookies for secure session management
