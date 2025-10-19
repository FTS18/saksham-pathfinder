# Firebase Emulator Configuration

## Setup Firebase Emulator Suite Locally

### Prerequisites
- Node.js 14+ installed
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Java 11+ installed (required for emulator)

### Installation Steps

1. **Install Firebase CLI (if not already installed)**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Emulator in your project**
```bash
firebase init emulator
```

4. **Start the emulator suite**
```bash
firebase emulators:start
```

This will start:
- Firestore Emulator on `localhost:8080`
- Auth Emulator on `localhost:9099`
- Storage Emulator on `localhost:9199`
- Emulator UI on `localhost:4000` (shows real-time data)

### Development Environment Variables

Create a `.env.local` file in the project root with:

```env
# Use Firebase Emulator for local development
VITE_USE_FIREBASE_EMULATOR=true

# Firebase Config (can be test values when using emulator)
VITE_FIREBASE_API_KEY=test-api-key
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_PROJECT_ID=saksham-ai
VITE_FIREBASE_STORAGE_BUCKET=saksham-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXX
```

### Development Workflow

1. **Terminal 1: Start Firebase Emulator**
```bash
firebase emulators:start
```

2. **Terminal 2: Start Vite Development Server**
```bash
npm run dev
```

3. **Terminal 3: View Emulator UI** (optional)
Open http://localhost:4000 in your browser

### Testing Locally

Once the emulator is running:

1. Visit http://localhost:5173 (or your Vite port)
2. The app will automatically connect to the local emulator
3. All read/write operations use the emulator instead of production database
4. No database quotas or rate limits!

### Benefits of Using Emulator

✅ **No Database Limits** - Unlimited reads/writes for testing
✅ **Instant Feedback** - See data changes immediately in Emulator UI
✅ **Offline Development** - Works without internet connection
✅ **Data Persistence** - Data saved between emulator restarts (by default)
✅ **No Production Impact** - Testing doesn't affect production data
✅ **Cost Savings** - No Firebase costs during development

### Emulator UI Features

- **Firestore**: Browse collections, view documents, edit data in real-time
- **Authentication**: Manage test users, view auth state
- **Storage**: Browse files in storage emulator
- **Logs**: See all operations in real-time

Access at: http://localhost:4000

### Production vs Development

**Production** (when `VITE_USE_FIREBASE_EMULATOR=false`)
- Connects to your real Firebase project
- Respects database quotas and limits
- Charges for read/write operations

**Development** (when `VITE_USE_FIREBASE_EMULATOR=true`)
- Connects to local emulator
- No quotas or rate limits
- No charges

### Troubleshooting

**Error: "Emulator is not running"**
- Make sure you ran `firebase emulators:start` in another terminal
- Check that ports 8080, 9099, 9199, 4000 are not in use

**Error: "Failed to connect to Firestore"**
- Verify Firebase project ID in `.env.local` matches `firebase.json`
- Check that Java is installed: `java -version`

**Data not persisting between sessions**
- By default, emulator data resets on restart
- To persist data, use: `firebase emulators:start --import ./emulator-data`
- Export data: `firebase emulators:export ./emulator-data`

**Port already in use**
- Change emulator ports in `firebase.json`:
```json
{
  "emulators": {
    "firestore": {
      "port": 8090
    },
    "auth": {
      "port": 9090
    }
  }
}
```

Then update `.env.local` accordingly.

### Sample Test Data

Create sample internships in Firestore Emulator UI:

```json
{
  "id": "test-1",
  "title": "Frontend Developer",
  "company": "Test Company",
  "location": { "city": "Mumbai" },
  "stipend": "₹10,000/month",
  "required_skills": ["React", "JavaScript", "CSS"],
  "sector_tags": ["Technology"],
  "description": "Build amazing UIs"
}
```

### Exporting and Importing Data

**Export current emulator data:**
```bash
firebase emulators:export ./backup
```

**Import data on next start:**
```bash
firebase emulators:start --import ./backup
```

This is useful for:
- Sharing test data with team members
- Creating consistent test environments
- Backing up test data

### CI/CD Integration

For automated testing:

```bash
# Start emulator in background
firebase emulators:start --only firestore,auth &

# Wait for startup
sleep 5

# Run tests
npm test

# Kill emulator
kill %1
```

### Rate Limiting & Quota Testing

While the emulator doesn't enforce actual quotas, you can manually test quota handling:

```typescript
// Add artificial delays to simulate quota limits
const simulateQuota = async () => {
  // Simulate rate limiting
  const delays = [100, 200, 300];
  await new Promise(resolve => 
    setTimeout(resolve, delays[Math.floor(Math.random() * delays.length)])
  );
};
```

### Next Steps

1. Set up `.env.local` with emulator config
2. Start Firebase Emulator Suite
3. Start Vite dev server
4. Access Emulator UI at http://localhost:4000
5. Create sample test data
6. Test your app features locally without database limits!

For official documentation, see:
- [Firebase Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite)
- [Firestore Emulator Docs](https://firebase.google.com/docs/firestore/security-rules-and-auth#emulator)
