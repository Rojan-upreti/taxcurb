# TaxCurb Backend

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file** in the backend directory with the following variables:
   ```
   PORT=3001
   FIREBASE_PROJECT_ID=taxcurb
   FIREBASE_CLIENT_EMAIL=your-service-account-email@taxcurb.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=your-private-key-here
   ```

   **Note:** To get Firebase Admin credentials:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Extract `project_id`, `client_email`, and `private_key` from the JSON

3. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/signup` - Create user account (receives Firebase user info)
- `POST /api/auth/signin` - Sign in user (receives Firebase user info)

