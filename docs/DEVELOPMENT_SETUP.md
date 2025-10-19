# Development Setup Guide - Saksham AI

This guide covers setting up the project locally for development, including Firebase configuration and emulator setup.

## Quick Start

### 1. Prerequisites
- Node.js 16+ 
- npm or yarn
- Java 11+ (for Firebase Emulator)
- Firebase CLI: `npm install -g firebase-tools`

### 2. Clone and Install

```bash
git clone https://github.com/FTS18/saksham-pathfinder.git
cd saksham-pathfinder
npm install
```

### 3. Environment Setup

Create `.env.local` in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Use Local Emulator (recommended for development)
VITE_USE_FIREBASE_EMULATOR=true
```

### 4. Start Firebase Emulator

In Terminal 1:
```bash
firebase emulators:start
```

This starts:
- Firestore on `localhost:8080`
- Auth on `localhost:9099`
- Storage on `localhost:9199`
- Emulator UI on `localhost:4000`

### 5. Start Development Server

In Terminal 2:
```bash
npm run dev
```

Access at `http://localhost:5173`

### 6. View Emulator Data (Optional)

In Browser:
```
http://localhost:4000
```

## Environment Variables

### Firebase Production
Use this to connect to your live Firebase project:

```env
VITE_USE_FIREBASE_EMULATOR=false
# ... rest of Firebase config from Firebase Console
```

### Firebase Emulator (Local Development)
Use this to test locally without production database costs:

```env
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_PROJECT_ID=saksham-ai
# Other Firebase config can be dummy values when using emulator
```

## Development Workflow

### Typical Development Session

**Terminal 1: Firebase Emulator**
```bash
firebase emulators:start
```

**Terminal 2: Dev Server**
```bash
npm run dev
```

**Terminal 3: Optional - View logs**
```bash
# If using TypeScript
npm run type-check
```

### Creating Test Data

In Emulator UI (`http://localhost:4000`):

1. Go to Firestore tab
2. Click "Start collection"
3. Create collection: `internships`
4. Add sample documents:

```json
{
  "id": "test-1",
  "title": "Frontend Developer",
  "company": "Test Company",
  "location": { "city": "Mumbai" },
  "stipend": "₹10,000/month",
  "required_skills": ["React", "JavaScript"],
  "sector_tags": ["Technology"],
  "status": "active",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "applicationCount": 0,
  "viewCount": 0
}
```

### Building for Production

```bash
npm run build
```

Output: `dist/` folder ready for Firebase Hosting

### Deploying

```bash
npm run build
firebase deploy
```

## Database Limits & Emulator Benefits

### Production Database Limits
- Read operations: 50,000/day free tier
- Write operations: 20,000/day free tier
- Each operation counts against quota

### Emulator Benefits
✅ **Unlimited** reads/writes
✅ No costs
✅ Instant feedback in Emulator UI
✅ Offline development
✅ Reset data easily

## Common Issues

### "Emulator is not running"
- Ensure `firebase emulators:start` is running in another terminal
- Check ports 8080, 9099, 9199, 4000 are free

### "Failed to connect to Firestore"
```
Solution: Check VITE_USE_FIREBASE_EMULATOR=true in .env.local
```

### "Collection() expects first argument to be CollectionReference..."
```
Solution: Firebase is not initialized. Ensure:
1. .env.local has Firebase config
2. Firebase emulator is running
3. VITE_USE_FIREBASE_EMULATOR matches your setup
```

### Port Already In Use

If ports are taken, update `firebase.json`:

```json
{
  "emulators": {
    "firestore": { "port": 8090 },
    "auth": { "port": 9090 },
    "storage": { "port": 9190 }
  }
}
```

## Useful Commands

```bash
# Start dev server with emulator
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run type checking
npm run type-check

# Firebase Emulator commands
firebase emulators:start              # Start all emulators
firebase emulators:start --only auth  # Start only Auth emulator
firebase emulators:export ./backup    # Export emulator data
firebase emulators:import ./backup    # Import emulator data
```

## Accessing Internship Detail Pages

### With Emulator (Recommended)
1. Create test internship in Emulator UI
2. Note the document ID (e.g., "abc123")
3. Visit: `http://localhost:5173/internship/abc123`
4. **No login required** - can view as guest

### Without Emulator (Production DB)
1. Set `VITE_USE_FIREBASE_EMULATOR=false`
2. Use real Firebase config
3. App fetches from production database

## Testing Accessibility

The app includes comprehensive accessibility features. Test them:

- **Keyboard Navigation**: Use Tab to navigate
- **Screen Readers**: Test with NVDA (Windows), VoiceOver (Mac)
- **Read-Only Access**: View pages without login

See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for full details.

## Read-Only Access

No login required for:
- Browsing internships
- Viewing internship details
- Searching by skill, sector, company, city, title
- Viewing shared comparisons
- Public profiles

Login required for:
- Saving to wishlist
- Applying to internships
- Dashboard access
- Profile settings

## Firebase Emulator Data Persistence

**By default**: Data resets when emulator stops

**To persist data**:
```bash
# Export data before stopping
firebase emulators:export ./emulator-backup

# Start with saved data
firebase emulators:start --import ./emulator-backup
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env.local`
3. ✅ Start Firebase Emulator: `firebase emulators:start`
4. ✅ Start dev server: `npm run dev`
5. ✅ Visit http://localhost:5173
6. ✅ Create test data in Emulator UI
7. ✅ Test internship detail page

Happy coding! 🚀
