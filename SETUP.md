# TaxCurb Setup Guide

## Firebase Authentication Setup

### Frontend Setup

1. **Create `.env` file** in the `frontend` directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```
   
   The `.env` file should contain:
   ```
   VITE_FIREBASE_API_KEY=AIzaSyBct1ligaDJDwzswLGAp--kmWyfkKFGkAI
   VITE_FIREBASE_AUTH_DOMAIN=taxcurb.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=taxcurb
   VITE_FIREBASE_STORAGE_BUCKET=taxcurb.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=728454502512
   VITE_FIREBASE_APP_ID=1:728454502512:web:044882b1b64ed5fbab7cb5
   VITE_FIREBASE_MEASUREMENT_ID=G-0P9EVDDPP9
   VITE_API_URL=http://localhost:3001
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Get Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (taxcurb)
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

3. **Create `.env` file** in the `backend` directory:
   ```bash
   cd backend
   ```
   
   Create `.env` with:
   ```
   PORT=3001
   FIREBASE_PROJECT_ID=taxcurb
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@taxcurb.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   
   Extract values from the downloaded JSON file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)

## Running the Application

### Start Backend:
```bash
cd backend
npm start
# or for development:
npm run dev
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

## Features

- ✅ Firebase Authentication (Email/Password)
- ✅ Password confirmation validation
- ✅ Backend API integration
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation

## Notes

- The frontend handles Firebase authentication
- The backend verifies tokens and stores user info (you can add database integration)
- Password must be at least 6 characters
- Passwords must match during signup

