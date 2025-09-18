# Firestore Database Setup

## Quick Setup Steps:

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Select your project: `saksham-ai-81c3a`

### 2. Create Firestore Database
- Click **"Firestore Database"** in the left sidebar
- Click **"Create database"**
- Choose **"Start in test mode"** (for development)
- Select a location (choose closest to your users)
- Click **"Done"**

### 3. Set Security Rules (Optional for now)
The app will work with test mode rules. For production, update rules later.

### 4. Add Authorized Domains
- Go to **Authentication** → **Settings** → **Authorized domains**
- Add these domains:
  - `localhost`
  - `127.0.0.1`
  - `172.31.69.90` (your current IP)
  - `172.31.69.90:8080`

## That's it! 

Your profile page will now:
- ✅ Load instantly with user data from Firebase Auth
- ✅ Save to Firestore when database is available
- ✅ Work offline until you set up the database
- ✅ No more loading delays or errors

The app is designed to work gracefully whether Firestore is available or not.