# Firebase Auth Emulator - Troubleshooting Guide

## ❌ Why Auth Might Not Be Working

### Issue 1: Auth Emulator Port Not Running
The Firebase Emulator Suite needs the **Auth Emulator** running on port **9099**.

**Check if it's running:**
```bash
# The emulator should show this:
# ┌─────────────────────────────────────────────────────────────┐
# │ ✔  All emulators ready! It is now safe to connect your app. │
# └─────────────────────────────────────────────────────────────┘
```

### Issue 2: Auth Emulator Not Connected in App
Make sure `VITE_USE_FIREBASE_EMULATOR=true` is set in `.env.local`.

**Check by opening browser console** (F12):
```
✓ Auth Emulator connected on localhost:9099
✓ Firestore Emulator connected on localhost:8080
✓ Storage Emulator connected on localhost:9199
```

### Issue 3: Google OAuth Not Working with Emulator
Google OAuth redirects don't work with `localhost:5173`. The emulator doesn't support real Google authentication.

**Workaround:** Use **email/password login** for testing with emulator.

### Issue 4: CORS or Redirect Issues
Firebase Auth Emulator requires you to use the correct auth domain.

**For emulator mode**, use:
```typescript
connectAuthEmulator(auth, 'http://localhost:9099', { 
  disableWarnings: true  // Suppress dev-only warnings
});
```

---

## ✅ How to Fix Auth

### Step 1: Verify Emulator is Running
```bash
# Terminal 1
$env:Path += ";C:\Program Files\Java\jdk-25\bin"
firebase emulators:start
```

You should see:
```
✔ All emulators ready!
Firestore │ 127.0.0.1:8080
Auth      │ 127.0.0.1:9099
Storage   │ 127.0.0.1:9199
```

### Step 2: Check `.env.local`
```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=saksham-ai-81c3a
# ... other config
```

### Step 3: Restart Dev Server
```bash
# Terminal 2
npm run dev
```

### Step 4: Test with Email/Password (Not Google OAuth)

**Use the Emulator UI to create test users:**

1. Open: **http://localhost:4000**
2. Click **"Authentication"** in sidebar
3. Click **"Add user"**
4. Enter test credentials:
   - Email: `test@example.com`
   - Password: `test123456`
5. Click **"Add user"**

Now test login in app with those credentials.

### Step 5: For Google OAuth Testing
**Option A: Skip Google OAuth during emulator testing**
- Use email/password forms only
- Test Google OAuth in production

**Option B: Add localhost to Firebase Console**
1. Go: Firebase Console > Authentication > Settings
2. Authorized domains section, add:
   - `localhost`
   - `127.0.0.1`
   - `192.168.1.3` (your local IP)

---

## 🔍 Debug Console Errors

**Open browser console (F12)** and look for:

### ✅ Success Logs
```
🔥 Using Firebase Emulator Suite for local development
✓ Firestore Emulator connected on localhost:8080
✓ Auth Emulator connected on localhost:9099
✓ Storage Emulator connected on localhost:9199
```

### ❌ Error Logs
```
// Auth not initializing
Error: connectAuthEmulator() called twice

// Solution: Clear browser cache and hard refresh (Ctrl+Shift+R)

// Port already in use
Error: EADDRINUSE: address already in use :::9099

// Solution: Kill old process and restart emulator
```

---

## 🧪 Test Authentication Flow

### 1. Create Test User in Emulator UI
- Go to: http://localhost:4000/authentication
- Add user: `test@example.com` / `test123456`

### 2. Login in Dev App
- Go to: http://localhost:5173/login
- Select "Student"
- Enter: `test@example.com` / `test123456`
- Click "Sign In"

### 3. Expected Behavior
- ✅ Login succeeds without hitting production database
- ✅ User profile created in local Firestore
- ✅ Redirected to dashboard
- ✅ "Logged in as: test@example.com" shown

### 4. Create More Test Users
Repeat steps 1-2 with different emails

---

## 🚀 For Production Testing

**Switch to production Firebase:**

In `.env.local`:
```env
VITE_USE_FIREBASE_EMULATOR=false
```

Then:
- Google OAuth will work
- Real database quota applies
- All features available

---

## 📋 Firebase Emulator Setup Checklist

- [ ] Java 11+ installed and in PATH
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] `.env.local` has `VITE_USE_FIREBASE_EMULATOR=true`
- [ ] Emulator started with `firebase emulators:start`
- [ ] Dev server running on `http://localhost:5173`
- [ ] Browser console shows emulator connection logs
- [ ] Test user created in Emulator UI (http://localhost:4000)
- [ ] Email/password login working

---

## 🔗 Related Resources

- [Firebase Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite)
- [Firebase Auth Emulator Docs](https://firebase.google.com/docs/emulator-suite/connect_auth)
- [Testing Guide](./DEVELOPMENT_SETUP.md)

