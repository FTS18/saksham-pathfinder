# Firestore Security Rules Testing Guide

## Overview

This guide covers multiple ways to test your Firestore security rules for the Saksham Pathfinder project. Choose the method that best fits your workflow.

---

## Method 1: Quick CLI Validation (No Dependencies) ⚡

**Best for:** Quick syntax checks and permission validation without running anything

### Usage

```bash
node scripts/test-firestore-rules.mjs
```

### What It Tests

✅ Collection coverage (all 28 collections have rules)  
✅ Permission model (read/write/create/delete)  
✅ Security best practices (default deny, auth functions)  
✅ Data access scenarios documentation  
✅ Hardcoded email warnings  

### Example Output

```
╔════════════════════════════════════════════╗
║   Firestore Security Rules Validator       ║
╚════════════════════════════════════════════╝

📋 COLLECTION COVERAGE:
  ✅ profiles              - OK
  ✅ users                 - OK
  ✅ usernames             - OK
  ...
  28/28 collections have rules

🔐 PERMISSION MODEL VALIDATION:
  ✅ profiles      - Private profiles readable only by owner
  ✅ usernames     - Public username lookup allowed
  ✅ internships   - Internships publicly readable
  ...

🛡️  SECURITY BEST PRACTICES:
  ✅ Default Deny Rule     - Default deny rule exists
  ✅ Auth Functions        - isAuthenticated(), isOwner(), isAdmin() functions defined
  ⚠️  Hardcoded Admin Email - Hardcoded admin email found

🧪 DATA ACCESS SCENARIOS:
  ✅ Owner reads own profile
  ✅ User reads private profile of another
  ✅ Anyone reads public profile
  ...

SUMMARY:
  ✅ Rules file is valid and syntactically correct
  ✅ All 28 collections have security rules
  ✅ Default deny rule configured
  ✅ Ready for deployment
```

---

## Method 2: Firebase Emulator Suite (Full Integration) 🔥

**Best for:** Complete testing with actual Firestore behavior, before deploying to production

### Prerequisites

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Initialize Firebase in your project (if not done)
firebase init emulators
```

### Setup Emulator

```bash
# Start the emulator suite
firebase emulators:start --only firestore

# The emulator will run on:
# Firestore: http://localhost:8080
# Emulator UI: http://localhost:4000
```

### Run Rule Tests Against Emulator

```bash
# In a separate terminal, run the Jest test suite
npm run test:firestore:rules

# Or with firebase-rules-unit-testing
jest scripts/firestore-rules.test.ts --runInBand
```

### What The Emulator Tests

✅ Read/write/create/delete permissions  
✅ User context switching (authenticated/unauthenticated)  
✅ Owner vs non-owner access  
✅ Admin access  
✅ Public vs private data  
✅ Subcollection permissions  
✅ Complex condition evaluation  

### Test Scenarios Covered

```typescript
// Authentication
✅ Unauthenticated users denied
✅ Authenticated users can create resources

// Profile Access
✅ Owner can read/write own profile
✅ Private profiles blocked from others
✅ Public profiles readable by anyone
✅ Public profiles readable unauthenticated

// Username Registry
✅ Public username lookup
✅ User claim username
✅ Can't claim taken username
✅ User deletes own username

// Applications
✅ Applicant reads own application
✅ Recruiter reads related applications
✅ Unrelated user denied
✅ Applicant creates their application
✅ Can't create as another user

// User Preferences
✅ User reads own preferences
✅ User updates preferences
✅ Denied from reading other's prefs

// Internships
✅ Public read access
✅ Recruiter updates internship
✅ Others blocked from updating

// Notifications
✅ User reads own notifications
✅ Can't read others' notifications
✅ Any user can create notifications

// Security
✅ Undefined collections denied (default deny)
```

---

## Method 3: Manual Testing via Firebase Console 🖥️

**Best for:** Visual verification and production validation

### Steps

1. **Login to Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project: `saksham-ai-81c3a`

2. **View Current Rules**
   - Navigate to: Firestore Database > Rules
   - Review the currently deployed rules

3. **Simulate Rule Execution**
   - Click "Simulate" button
   - Enter test parameters:
     - Collection path: `/profiles/{userId}`
     - Document ID: `testuser123`
     - Operation: `get` / `create` / `update` / `delete`
     - Request auth: Select authentication context
   - Click "Run" to see if it passes/fails

4. **Test Various Scenarios**

   **Scenario 1: Owner reads own profile**
   ```
   Path: /profiles/user123
   Operation: get
   Request auth: user123
   Result: ✅ ALLOW
   ```

   **Scenario 2: Other user reads private profile**
   ```
   Path: /profiles/user123
   Operation: get
   Request auth: user456
   Result: ❌ DENY
   ```

   **Scenario 3: Anyone reads public profile**
   ```
   Path: /profiles/user123
   Operation: get
   Request auth: (none)
   Resource data: { isPublic: true }
   Result: ✅ ALLOW
   ```

   **Scenario 4: User claims username**
   ```
   Path: /usernames/newusername
   Operation: create
   Request auth: user123
   Request data: { userId: "user123" }
   Result: ✅ ALLOW
   ```

5. **Publish When Ready**
   - Click "Publish" to deploy updated rules
   - Confirm the changes

---

## Method 4: Web App Integration Testing 🌐

**Best for:** End-to-end testing with your actual app

### Setup

1. **Ensure dev server is running**
   ```bash
   npm run dev
   # Server runs on dynamic port (usually 3001 if 3000 is taken)
   ```

2. **Test via app UI**
   - Open http://localhost:3001
   - Create account or login
   - Navigate to profile settings
   - Change theme to "dark" + "red"
   - **Expected:** Theme persists in localStorage and Firestore
   - **Verify:** Refresh page - theme should remain (confirms `userPreferences` read/write works)

3. **Test public profiles**
   - Go to a public profile URL (without logging in)
   - **Expected:** Profile loads successfully (public read allowed)

4. **Test notifications**
   - Send yourself a notification
   - Verify only you can see it
   - Open browser DevTools → Firestore (if using extension)
   - **Confirm:** Other users can't access your notifications

---

## Method 5: Production Deployment Testing 🚀

**Best for:** Final validation before going live

### Pre-Deployment Checklist

```bash
# 1. Run CLI validator
node scripts/test-firestore-rules.mjs

# 2. Run Jest tests locally
npm run test:firestore:rules

# 3. Check for breaking changes
firebase deploy --dry-run

# 4. Review rule changes
git diff firestore.rules
```

### Deploy to Production

```bash
# Deploy only Firestore rules (safe)
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

### Post-Deployment Validation

1. **Verify in Console**
   - Firebase Console > Firestore > Rules
   - Confirm new rules are published

2. **Test Live App**
   - Open production URL
   - Create new user account
   - Update preferences (triggers write to `userPreferences`)
   - Verify no permission errors in console

3. **Monitor Errors**
   - Watch Firebase Console > Firestore > Metrics
   - Look for "Permission denied" errors
   - If spike occurs, check logs and revert if needed

4. **Rollback if Needed**
   ```bash
   # Revert to previous rules version
   git checkout HEAD~1 firestore.rules
   firebase deploy --only firestore:rules
   ```

---

## Test Coverage Matrix

| Collection | Owner Read | Owner Write | Public Read | Admin Access | Notes |
|---|---|---|---|---|---|
| profiles | ✅ | ✅ | ✅* | ✅ | *if `isPublic=true` |
| users | ✅ | ✅ | ❌ | ✅ | Private |
| usernames | ✅ | ✅ | ✅ | ✅ | Public lookup |
| gamification | ✅ | ✅ | ❌ | ✅ | Owner only |
| recruiters | ✅ | ✅ | ❌ | ✅ | Owner only |
| internships | ✅ | ✅* | ✅ | ✅ | *recruiter only |
| applications | ✅ | ✅* | ❌ | ✅ | *applicant/recruiter |
| notifications | ✅ | ✅* | ❌ | ✅ | *recipient only |
| userPreferences | ✅ | ✅ | ❌ | ✅ | Owner only |
| chats | ✅ | ✅* | ❌ | ✅ | *participants only |
| feedback | ✅ | ✅ | ❌ | ✅ | Owner + admin |
| profilePhotos | ✅ | ✅ | ✅ | ✅ | Public read |
| cache | ✅ | ✅ | ❌ | ✅ | Owner only |

---

## Common Issues & Troubleshooting

### ❌ "Permission denied" errors in prod

**Cause:** Rules are too restrictive  
**Solution:** Check resource.data structure matches expected fields

```firestore
// Example fix: applications need userId field
allow read: if request.auth.uid == resource.data.userId
```

### ❌ Rule simulator shows ALLOW but app gets DENY

**Cause:** Resource doesn't exist or has different data  
**Solution:** Check actual Firestore data structure in Console

### ❌ Deployment fails with syntax error

**Cause:** Invalid Firestore rule syntax  
**Solution:** Run validator: `node scripts/test-firestore-rules.mjs`

### ✅ All tests pass but need to add new collection

**Steps:**
1. Add rules for new collection (follow existing patterns)
2. Run validator: `node scripts/test-firestore-rules.mjs`
3. Test with emulator or simulator
4. Deploy: `firebase deploy --only firestore:rules`

---

## References

- **Firestore Security Rules Docs:** https://firebase.google.com/docs/firestore/security/start
- **Firebase Rules Testing:** https://firebase.google.com/docs/rules/unit-tests
- **Firebase Emulator:** https://firebase.google.com/docs/emulator-suite
- **Rules Language Guide:** https://firebase.google.com/docs/rules/rules-language

---

## Quick Command Reference

```bash
# Validate rules locally
node scripts/test-firestore-rules.mjs

# Start emulator
firebase emulators:start --only firestore

# Run tests with emulator
npm run test:firestore:rules

# Dry-run deployment
firebase deploy --dry-run

# Deploy rules
firebase deploy --only firestore:rules

# View rules in console
firebase rules:list firestore

# Show specific rule version
firebase rules:log firestore --lines 50
```

---

**Last Updated:** October 18, 2025  
**Status:** Production Ready ✅
