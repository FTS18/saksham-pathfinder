# Firebase Authentication Setup Guide

## Step 1: Install Dependencies

Run this command in your project root:

```bash
npm install firebase react-icons
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `saksham-ai-hexacoders`
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 3: Enable Authentication

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable these providers:
   - **Email/Password**: Click and toggle "Enable"
   - **Google**: Click, toggle "Enable", add your email as support email

## Step 4: Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add web app
4. Register app name: `saksham-ai-web`
5. Copy the config object that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijk"
};
```

## Step 5: Update Firebase Config

Replace the placeholder values in `src/lib/firebase.ts` with your actual config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

## Step 6: Configure Google Sign-In (Optional)

1. In Firebase Console → Authentication → Sign-in method
2. Click on Google provider
3. Add your domain to "Authorized domains" if needed
4. For production, add your actual domain

## Step 7: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/register` to create an account
3. Navigate to `/login` to sign in
4. Test Google Sign-In button

## Security Rules (Optional)

If you plan to use Firestore later, set up basic security rules:

1. Go to Firestore Database → Rules
2. Use these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Environment Variables (Recommended)

For production, use environment variables:

1. Create `.env.local` file:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. Update `firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Features Implemented

✅ Email/Password Authentication
✅ Google Sign-In
✅ User Registration
✅ Login/Logout
✅ Protected Routes (Dashboard)
✅ User Profile Display
✅ Responsive Design
✅ Error Handling
✅ Loading States

## Next Steps

1. Add protected routes for Dashboard
2. Store user profiles in Firestore
3. Add password reset functionality
4. Add email verification
5. Add user profile editing

Team HexaCoders - Firebase Auth Setup Complete! 🚀