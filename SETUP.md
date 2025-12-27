# TaxCurb Setup Guide

## Firebase Authentication Setup

### Frontend Setup

1. **Create `.env` file** in the `frontend` directory:
   ```bash
   cd frontend
   ```
   
   Create `.env` with:
   ```
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   VITE_API_URL=http://localhost:3001
   ```
   
   **Note:** Get these values from your Firebase Console → Project Settings → General

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
   - Select your project
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
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
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
- ✅ Backend API integration
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation

## Notes

- The frontend handles Firebase authentication
- The backend verifies tokens and stores user info (you can add database integration)
- Password must be at least 6 characters
