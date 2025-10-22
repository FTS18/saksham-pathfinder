# Backend Setup & Deployment Guide

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project with Blaze plan (required for Cloud Functions)
- Admin access to Firebase project

---

## 🚀 Local Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase

```bash
# Login to Firebase
firebase login

# Select your project
firebase use --add
# Select project ID from the list
```

### 3. Start Emulators

```bash
# Start all emulators (Firestore, Functions, Auth)
firebase emulators:start --import=./emulator-data

# Or start only Firestore
firebase emulators:start --only firestore

# Or start specific emulators
firebase emulators:start --only firestore,functions,auth
```

The emulator UI will be available at: `http://127.0.0.1:4000`

### 4. Deploy Functions Locally

```bash
cd functions
npm run build
firebase emulators:start --only functions
```

Functions will be accessible at: `http://localhost:5001/your-project-id/us-central1/`

---

## 🔧 Setting Up Cloud Functions

### 1. Update `functions/package.json`

Ensure the following dependencies are installed:

```json
{
  "dependencies": {
    "firebase-admin": "^11.0.0",
    "firebase-functions": "^4.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/node": "^18.0.0",
    "typescript": "^4.9.0"
  }
}
```

### 2. Update Environment Variables

Create `.env` file in functions directory:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
```

### 3. Deploy Functions to Production

```bash
firebase deploy --only functions
```

Monitor deployment:
```bash
firebase functions:log
```

---

## 🔐 Setting Up Firestore Security Rules

### 1. Review Current Rules

```bash
firebase firestore:indexes
```

### 2. Update Firestore Rules

Edit `firestore.rules` with the security rules provided in FULL_STACK_IMPLEMENTATION.md

### 3. Deploy Rules

```bash
# Deploy only rules
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

### 4. Verify Rules

```bash
firebase firestore:rules:test --file=scripts/firestore-rules.test.ts
```

---

## 📊 Creating Firestore Indexes

### 1. Manually Create Indexes (via Console)

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Indexes"
4. Create the following indexes:

**Index 1: Internships by Recruiter and Date**
- Collection: internships
- Fields: recruiterId (Ascending), createdAt (Descending)

**Index 2: Applications by Recruiter and Status**
- Collection: applications
- Fields: recruiterId (Ascending), status (Ascending)

**Index 3: Applications by Internship and Date**
- Collection: applications
- Fields: internshipId (Ascending), appliedAt (Descending)

**Index 4: Notifications by User and Date**
- Collection: notifications
- Fields: userId (Ascending), createdAt (Descending)

### 2. Deploy Indexes via CLI

```bash
firebase deploy --only firestore:indexes
```

---

## 🧪 Testing

### 1. Test Cloud Functions Locally

```bash
# Run function tests
npm run test

# Run with coverage
npm run test:coverage
```

### 2. Test Firestore Rules

```bash
npm run test:firestore:rules
```

### 3. Manual Testing with Emulator

```typescript
// Example test in browser console when using emulator
const functions = getFunctions();
const initRecruiter = httpsCallable(functions, "initializeRecruiterProfile");

try {
  const result = await initRecruiter({
    companyName: "Test Company",
    companyEmail: "test@testcompany.com",
    gstNumber: "27AAPCT1234A1Z0"
  });
  console.log(result);
} catch (error) {
  console.error(error);
}
```

---

## 📱 Frontend Integration

### 1. Update Firebase Config

Ensure `src/lib/firebase.ts` has correct credentials:

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Use emulator in development
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}
```

### 2. Environment Variables

Create `.env.local`:

```env
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

### 3. Use RecruiterService

```typescript
import { RecruiterService } from "@/services/recruiterService";

// Create internship
const result = await RecruiterService.createInternship({
  title: "Frontend Developer",
  description: "...",
  location: "Bangalore",
  stipend: "₹20,000/month",
  duration: "3 months",
  sector: "Technology",
  skills: ["React", "TypeScript"],
  workMode: "Hybrid"
});

// Get applications
const { applications } = await RecruiterService.getApplications({
  status: "pending",
  limit: 50
});

// Get analytics
const stats = await RecruiterService.getRecruiterAnalytics();
```

---

## 🚀 Full Deployment Pipeline

### 1. Build Frontend

```bash
npm run build
```

### 2. Build Functions

```bash
cd functions
npm run build
cd ..
```

### 3. Run Tests

```bash
npm run test:ci
```

### 4. Deploy to Production

```bash
# Deploy everything
firebase deploy

# Or specific components
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only hosting
```

### 5. Monitor

```bash
# View function logs
firebase functions:log

# View real-time logs
firebase functions:log --follow
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
          channelId: live
```

---

## 📊 Monitoring & Debugging

### 1. Firebase Console

- Go to https://console.firebase.google.com
- Monitor function execution times
- View error rates
- Check quota usage

### 2. Cloud Logs

```bash
# View recent logs
firebase functions:log

# Follow logs in real-time
firebase functions:log --follow

# View logs for specific function
firebase functions:log --function=createInternship
```

### 3. Performance Monitoring

Set up in functions:

```typescript
import { performance } from "perf_hooks";

const start = performance.now();
// ... function execution
const end = performance.now();
console.log(`Execution time: ${end - start}ms`);
```

### 4. Debugging Functions

```bash
# Enable debug logging
firebase functions:config:set logs.level=debug
firebase deploy --only functions

# View debug logs
firebase functions:log
```

---

## 🔒 Security Checklist

- [ ] API keys restricted in Firebase Console
- [ ] CORS configured correctly
- [ ] Firestore rules reviewed and tested
- [ ] Functions have rate limiting
- [ ] Sensitive data not logged
- [ ] HTTPS enforced
- [ ] Admin SDK only on backend
- [ ] User inputs validated
- [ ] Error messages don't expose internals
- [ ] Backups configured

---

## 🚨 Troubleshooting

### Issue: "Permission denied" errors

**Solution:**
1. Check Firestore rules
2. Verify user authentication
3. Confirm user role in recruiters collection
4. Check collection permissions

### Issue: Functions timeout

**Solution:**
1. Increase timeout in firebase.json
2. Optimize database queries
3. Use indexes for queries
4. Consider async/await patterns

### Issue: "Function not found"

**Solution:**
1. Verify function is deployed: `firebase functions:list`
2. Check function name matches
3. Rebuild and redeploy
4. Clear browser cache

### Issue: Emulator not connecting

**Solution:**
1. Ensure emulator is running: `firebase emulators:start`
2. Check emulator ports (8080 for Firestore, 5001 for Functions)
3. Verify firebase.ts configuration
4. Check Firebase connection string

---

## 📈 Performance Optimization

### 1. Database Optimization

```typescript
// ✅ Good: Use indexes for queries
db.collection("internships")
  .where("recruiterId", "==", userId)
  .where("status", "==", "published")
  .orderBy("createdAt", "desc")

// ❌ Bad: Inefficient queries without indexes
db.collection("internships")
  .where("description", "contains", "search")
```

### 2. Function Optimization

```typescript
// ✅ Good: Batch operations
const batch = db.batch();
batch.update(ref1, data1);
batch.update(ref2, data2);
await batch.commit();

// ❌ Bad: Sequential writes
await ref1.update(data1);
await ref2.update(data2);
```

### 3. Frontend Optimization

```typescript
// ✅ Good: Pagination
const result = await RecruiterService.getApplications({
  limit: 50,
  offset: 0
});

// ❌ Bad: Load all data at once
const allApplications = await db.collection("applications").get();
```

---

## 📝 Maintenance

### Daily
- Monitor error rates
- Check function logs
- Review new signups

### Weekly
- Backup Firestore data
- Review security rules
- Update dependencies

### Monthly
- Analyze usage patterns
- Optimize indexes
- Review performance metrics

---

## 🆘 Getting Help

1. **Firebase Documentation**: https://firebase.google.com/docs
2. **Cloud Functions**: https://firebase.google.com/docs/functions
3. **Firestore**: https://firebase.google.com/docs/firestore
4. **Community**: Stack Overflow with tag `firebase`

---

Last Updated: October 21, 2025
