# Firebase Internship Data Migration Guide

This guide explains how to migrate internship data from local JSON files to Firebase Firestore.

## 🚀 Quick Start

### Option 1: Using the Admin Panel (Recommended)
1. Go to `/admin-demo` in your app
2. Login with credentials: `admin` / `123`
3. Use the "Internship Data Migration" section
4. Click "Test Firebase" to verify connection
5. Click "Start Migration" to migrate all data

### Option 2: Using the Migration Script
```bash
# Install dependencies if needed
npm install firebase dotenv

# Run the migration script
node scripts/migrate-internships.js
```

## 📋 Prerequisites

### 1. Firebase Setup
- Firebase project created
- Firestore database enabled
- Environment variables configured in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Deploy Firestore Security Rules
The project includes proper security rules. Deploy them using Firebase CLI:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

**Or manually update in Firebase Console:**
1. Go to Firestore Database → Rules
2. Copy the rules from `firestore.rules` file
3. Click "Publish"

**Quick Fix for Development:**
If you need immediate access, temporarily use these open rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // DEVELOPMENT ONLY - NOT FOR PRODUCTION
    }
  }
}
```

## 📊 Data Structure

### Before Migration (JSON)
```json
{
  "id": 1,
  "title": "Software Developer Intern",
  "company": "Infosys",
  "location": "Bengaluru",
  "stipend": "₹15,000",
  "required_skills": ["Java", "Python"]
}
```

### After Migration (Firestore)
```javascript
{
  id: "auto-generated-firestore-id",
  pmis_id: "PMIS-2025-IT-001",
  title: "Software Developer Intern",
  company: "Infosys",
  location: "Bengaluru",
  stipend: "₹15,000",
  required_skills: ["Java", "Python"],
  status: "active",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  applicationCount: 0,
  viewCount: 0,
  featured: false
}
```

## 🔧 Implementation Details

### Files Modified/Created

#### New Services
- `src/services/internshipMigrationService.ts` - Main migration service
- `src/hooks/useInternships.ts` - React hooks for Firebase data
- `scripts/migrate-internships.js` - Node.js migration script

#### Updated Services  
- `src/services/internshipService.ts` - Updated to use Firebase service

#### New Components
- `src/components/admin/InternshipMigration.tsx` - Admin migration UI
- Updated `src/pages/AdminDemo.tsx` - Added migration panel

### Key Features Added

#### 1. Migration Service (`InternshipMigrationService`)
- `migrateFromJSON()` - Migrate data from JSON to Firebase
- `getAllInternships()` - Get all active internships
- `getInternshipsPaginated()` - Paginated internship loading
- `searchInternships()` - Advanced search with filters
- `getTrendingInternships()` - Most viewed internships
- `getFeaturedInternships()` - Featured internships only
- `incrementViewCount()` - Track internship views

#### 2. React Hooks (`useInternships`)
- `useInternships()` - Get all internships with caching
- `useInternshipsPaginated()` - Infinite scroll support
- `useSearchInternships()` - Search with filters
- `useInternship()` - Single internship by ID
- `useTrendingInternships()` - Trending internships
- `useFeaturedInternships()` - Featured internships
- `useInternshipsWithFallback()` - Firebase with local fallback

#### 3. Admin Migration UI
- Test Firebase connection
- Monitor migration progress
- View migration statistics
- Clear Firebase data (for testing)

## 🔄 Migration Process

### Step 1: Data Transformation
The migration service transforms JSON data to include:
- Firestore document ID
- Status field (`active`, `inactive`, `expired`)
- Timestamps (`createdAt`, `updatedAt`)
- Counters (`applicationCount`, `viewCount`)
- Enhanced metadata

### Step 2: Batch Processing
- Processes data in batches of 500 (Firestore limit)
- Handles large datasets efficiently
- Provides progress feedback
- Error handling and recovery

### Step 3: Data Validation
- Validates required fields
- Ensures data consistency
- Handles missing or malformed data
- Maintains referential integrity

## 📱 Usage in Components

### Before (Local JSON)
```typescript
const [internships, setInternships] = useState([]);

useEffect(() => {
  fetch('/internships.json')
    .then(res => res.json())
    .then(setInternships);
}, []);
```

### After (Firebase with Hooks)
```typescript
import { useInternships } from '@/hooks/useInternships';

const { data: internships, isLoading, error } = useInternships();
```

### With Search
```typescript
import { useSearchInternships } from '@/hooks/useInternships';

const { data: results } = useSearchInternships({
  location: 'Mumbai',
  sector: 'IT',
  skills: ['React', 'Node.js']
});
```

### With Pagination
```typescript
import { useInternshipsPaginated } from '@/hooks/useInternships';

const {
  data,
  fetchNextPage,
  hasNextPage,
  isLoading
} = useInternshipsPaginated(20);
```

## 🎯 Benefits After Migration

### Performance
- ✅ Real-time data updates
- ✅ Efficient pagination
- ✅ Optimized queries with indexes
- ✅ Caching with React Query

### Features
- ✅ Advanced search and filtering
- ✅ View count tracking
- ✅ Featured internships
- ✅ Application tracking
- ✅ Real-time notifications

### Scalability
- ✅ Handles unlimited internships
- ✅ Concurrent user support
- ✅ Automatic scaling
- ✅ Global CDN distribution

### Admin Features
- ✅ Easy data management
- ✅ Migration tools
- ✅ Analytics and insights
- ✅ Bulk operations

## 🚨 Important Notes

### Data Backup
- Always backup your current `internships.json` before migration
- Test migration on a development Firebase project first
- Keep local JSON as fallback during transition

### Performance Considerations
- First load might be slower due to network requests
- Implement proper loading states
- Use pagination for large datasets
- Cache frequently accessed data

### Cost Implications
- Firestore charges for reads/writes/storage
- Monitor usage in Firebase Console
- Implement efficient querying patterns
- Consider data retention policies

## 🔍 Troubleshooting

### Common Issues

#### 1. Firebase Connection Failed
```
❌ Firebase connection failed: Missing or insufficient permissions
```
**Solution**: Check Firestore security rules and authentication

#### 2. Migration Timeout
```
❌ Migration failed: Request timeout
```
**Solution**: Reduce batch size or check network connection

#### 3. Duplicate Data
```
❌ Document already exists
```
**Solution**: Clear Firebase data before re-running migration

#### 4. Missing Environment Variables
```
❌ Firebase configuration missing
```
**Solution**: Verify all environment variables in `.env` file

### Debug Steps
1. Check browser console for detailed errors
2. Verify Firebase project configuration
3. Test with a small dataset first
4. Check Firestore security rules
5. Monitor Firebase Console for quota limits

## 📈 Next Steps

After successful migration:

1. **Update Components**: Replace local JSON usage with Firebase hooks
2. **Add Features**: Implement search, filtering, and pagination
3. **Optimize Performance**: Add proper loading states and error handling
4. **Monitor Usage**: Track Firebase usage and costs
5. **Add Analytics**: Implement view tracking and user analytics

## 🤝 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Firebase Console for errors
3. Test with the admin migration tool
4. Verify all environment variables are set correctly

The migration provides a solid foundation for scaling the internship platform with real-time data, advanced features, and better performance.