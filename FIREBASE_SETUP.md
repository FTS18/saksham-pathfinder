# Firebase Setup Guide

## 🔥 Firebase Integration Steps

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Set up authentication (if not already done)

### 2. Update Firebase Config
Update your `.env` file with Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Rules
Set up these Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to internships for all users
    match /internships/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // User profiles - only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run Migration Script
1. Update Firebase config in `scripts/migrate-to-firestore.js`
2. Install dependencies: `npm install firebase`
3. Run migration: `node scripts/migrate-to-firestore.js`

### 5. Firestore Indexes
Create these composite indexes in Firebase Console:

**Collection: internships**
- Fields: `location` (Ascending), `posted_date` (Descending)
- Fields: `company` (Ascending), `posted_date` (Descending)  
- Fields: `required_skills` (Arrays), `posted_date` (Descending)
- Fields: `sector_tags` (Arrays), `posted_date` (Descending)

### 6. Enable Offline Support
Firestore automatically handles offline caching, but you can configure it:
```typescript
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Enable offline persistence
enableNetwork(db);
```

## 🚀 Benefits After Migration

### Performance
- ✅ Real-time data updates
- ✅ Offline support with automatic sync
- ✅ Efficient querying with indexes
- ✅ Pagination support for large datasets

### Scalability  
- ✅ Auto-scaling database
- ✅ Global CDN distribution
- ✅ Built-in security rules
- ✅ Real-time listeners for live updates

### Features Enabled
- ✅ Real-time internship updates
- ✅ Advanced filtering and search
- ✅ User-specific recommendations
- ✅ Analytics and usage tracking

## 📊 Next Steps After Setup

1. **Real-time Updates**: Implement live listeners for new internships
2. **Advanced Search**: Add full-text search with Algolia integration
3. **User Analytics**: Track user interactions and preferences
4. **Push Notifications**: Notify users of new matching internships
5. **Admin Dashboard**: Create admin interface for managing internships

## 🔧 Troubleshooting

**Migration Issues:**
- Ensure Firebase config is correct
- Check Firestore rules allow writes
- Verify network connectivity

**Query Performance:**
- Create required indexes in Firebase Console
- Use pagination for large result sets
- Implement proper error handling

**Offline Support:**
- Enable persistence in Firebase config
- Handle network state changes
- Implement retry logic for failed operations