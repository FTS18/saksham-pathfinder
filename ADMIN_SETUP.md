# Admin & Recruiter Permissions Setup

## Firebase Rules Configured

### Admin Access (`admin@gmail.com`)
- **Full permissions** to:
  - View ALL internships (including existing 150+)
  - Create, Update, Delete any internship
  - Manage all companies and jobs
  - View and manage all user accounts

### Recruiter Access
- **Can only:**
  - Create new internships (auto-assigned to their recruiterId)
  - View their own internships
  - Edit their own internships
  - Delete their own internships
  - Cannot see other recruiters' internships

### Student Access
- **Can:**
  - View all published internships
  - Create applications
  - View their own applications

---

## How to Set Up Admin Account

### Option 1: Firebase Console (Recommended)
1. Go to **Firestore Database** → Collections
2. Create new collection: `admins`
3. Add a document with user ID:
   ```json
   {
     "userId": "your-auth-uid",
     "email": "admin@gmail.com",
     "role": "admin",
     "createdAt": "2024-10-18"
   }
   ```

### Option 2: Programmatically
```typescript
import AdminService from '@/services/adminService';

// In console or component
await AdminService.addAdmin('user-uid', 'admin@gmail.com');
```

---

## Testing Permissions

### Test Admin Access
1. Sign in with `admin@gmail.com` (password: `123456`)
2. Go to `/recruiter/manage-internships`
3. **Should see:** ALL internships from ALL recruiters
4. **Can:** Edit, delete, create any internship

### Test Recruiter Access
1. Sign in with recruiter account
2. Go to `/recruiter/manage-internships`
3. **Should see:** ONLY internships with their recruiterId
4. **Cannot:** See other recruiters' internships

### Test Student Access
1. Sign in as student
2. Go to home page
3. **Can view** all published internships
4. **Cannot access** recruiter portal

---

## Firestore Rules Applied

### Key Security Rules

**Internships Collection:**
```firestore
match /internships/{internshipId} {
  allow read: if true;  // Anyone can view
  allow create: if isAuthenticated();
  allow update: if admin OR creator OR recruiterId;
  allow delete: if admin OR creator OR recruiterId;
  allow read, write, delete: if isAdmin();  // Admin override
}
```

**User Preferences Collections (profiles, timeTracking, etc):**
```firestore
allow read, write: if owner OR admin;
```

---

## What Changed in App

### ManageInternships.tsx
- **Before:** Showed dummy data + ALL internships
- **After:** 
  - Checks if user is admin
  - Admins see: ALL internships from all recruiters
  - Recruiters see: ONLY their internships
  - Real-time filtering based on `recruiterId`

### AdminService.ts (New)
- Checks if user is admin by:
  1. Email (`admin@gmail.com`)
  2. Checking `admins` collection
- Methods:
  - `isAdmin(userId)` - Check admin status
  - `addAdmin(userId, email)` - Make user admin
  - `removeAdmin(userId)` - Remove admin role

---

## Firestore Rules Structure

Updated security rules at `/firestore.rules`:

```firestore
// Admin override for full control
match /internships/{internshipId} {
  allow read, write, delete: if isAdmin();
}

match /companies/{companyId} {
  allow read, write, delete: if isAdmin();
}

match /jobs/{jobId} {
  allow read, write, delete: if isAdmin();
}
```

---

## Deployment Steps

1. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Set up Admin Account:**
   - Create user with email: `admin@gmail.com`
   - Password: `123456`
   - Add to `admins` collection (see above)

3. **Test All Roles:**
   - Admin login → verify all internships visible
   - Recruiter login → verify only own internships
   - Student login → verify read-only access

---

## Troubleshooting

### "Missing or insufficient permissions"
- **Cause:** User not properly authenticated or Firestore rules not deployed
- **Fix:** 
  1. Run `firebase deploy --only firestore:rules`
  2. Wait 30 seconds for rules to propagate
  3. Hard refresh browser (Ctrl+Shift+R)
  4. Re-authenticate

### Admin can't edit internships
- **Cause:** `admin@gmail.com` not in `admins` collection or not email-matched
- **Fix:**
  1. Verify email is exactly `admin@gmail.com`
  2. Check `admins` collection has this user's UID
  3. Rules check both email AND collection

### Recruiters see all internships
- **Cause:** App still loading old query without recruiter filter
- **Fix:**
  1. Hard refresh (Ctrl+Shift+R)
  2. Clear browser cache
  3. Check ManageInternships.tsx has the updated query filter

---

## Summary

✅ **Admin:** Can manage ALL internships (150+ existing + new)
✅ **Recruiter:** Can only manage their own internships  
✅ **Student:** Can view all published internships
✅ **Rules:** Firestore configured for proper access control
✅ **App:** Real-time filtering based on user role
