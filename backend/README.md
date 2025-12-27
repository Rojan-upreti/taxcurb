# TaxCurb Backend

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file** in the backend directory with the following variables:
   ```env
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

   # Firebase Admin SDK credentials (OPTIONAL - for advanced user management)
   # Get these from Firebase Console → Project Settings → Service Accounts
   # FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
   # FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   **Note:** 
   - `FIREBASE_API_KEY` is **REQUIRED** for authentication (used for Firebase REST API)
   - Other Firebase config values are stored for reference but only API_KEY is currently used
   - Firebase Admin credentials are optional but recommended for production

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /health` - Health check
- `GET /api/auth/check` - Check authentication status (from cookies)
- `POST /api/auth/signup` - Create user account (email, password)
- `POST /api/auth/signin` - Sign in user (email, password)
- `POST /api/auth/logout` - Logout user (clears cookies)
- `POST /api/auth/verify` - Verify authentication token

## Architecture

**All API keys and Firebase operations are handled in the backend:**
- Frontend makes HTTP requests to backend
- Backend uses Firebase REST API for authentication
- Backend uses Firebase Admin SDK for user management (optional)
- No Firebase client SDK needed in frontend for authentication
- All Firebase config values are stored in `backend/.env` only

## Security

- All Firebase API keys are stored in `backend/.env` (never commit to git)
- Backend uses HTTP-only cookies for secure session management
- Frontend has no access to Firebase API keys
