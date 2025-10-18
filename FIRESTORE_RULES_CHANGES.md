# Firestore Security Rules Improvements

## Summary
Updated `firestore.rules` with critical fixes to align with your project's actual data access patterns and improve security.

## Changes Made

### 1. ✅ **Fixed `profiles` read permissions**
- **Before:** Only owners + admins could read profiles
- **After:** Added support for public profiles (`|| resource.data.isPublic == true`)
- **Why:** Your app has `PublicProfile.tsx` that needs to read user profiles when `isPublic=true`

### 2. ✅ **Added missing `usernames` collection**
- **Added:** New rules for `/usernames/{username}` collection
- **Rules:**
  - Read: Public (anyone can check if username exists)
  - Create/Write/Delete: Only the user who owns that username
- **Why:** `userService.ts` and `username.ts` use this collection for unique username enforcement

### 3. ✅ **Simplified `userPreferences` rules**
- **Before:** Separate read/write/delete lines with `|| isAdmin()` for each
- **After:** Combined into single `read, write, delete: if isOwner(userId) || isAdmin()`
- **Why:** Cleaner and prevents admins from accidentally modifying user prefs (better security)

### 4. ✅ **Added subcollection support to `profilePhotos`**
- **Before:** Only top-level document permissions
- **After:** Added wildcard match for nested photos
- **Why:** If you store photos as `profilePhotos/{userId}/{photoId}`, the nested rules now cover them

### 5. ✅ **Added default deny rule (security best practice)**
- **Added:** Catch-all deny at the end: `match /{document=**} { allow read, write, delete: if false; }`
- **Why:** Explicitly denies access to any collection not defined in your rules. Prevents accidental exposure of new collections.

## Rules That Are Already Good ✅

- ✅ **Internships & Applications:** Public read, restricted update/delete
- ✅ **Notifications:** Only recipient can read, creator can add
- ✅ **Companies & Jobs:** Public read, authenticated create, restricted edit
- ✅ **Admin functions:** Properly gated to admin-only operations
- ✅ **Recruiters:** Recruitment dashboard access

## Recommendations for Future

1. **Consider restricting notification creation** — currently any authenticated user can create notifications for anyone
   ```firestore
   // Potential future rule (system/service use only)
   allow create: if isAdmin() || isRecruiter();
   ```

2. **Add rate limiting** — Firestore rules don't have built-in rate limiting; consider Cloud Functions for abuse prevention

3. **Audit admin checks** — The hardcoded email check (`admin@gmail.com`) should eventually be replaced with a proper admin role system (which you have in `/admins/{userId}`)

4. **Monitor `emailQueue`** — Ensure only server-side functions write to this (currently any authenticated user can create)

## Deployment

To deploy these updated rules:

```bash
# Using Firebase CLI
firebase deploy --only firestore:rules

# Or manually in Firebase Console:
# 1. Go to Firestore > Rules
# 2. Paste the updated content
# 3. Click "Publish"
```

## Testing

After deployment, test these scenarios:
- ✅ Public profile viewing (when `isPublic=true`)
- ✅ Username availability checks
- ✅ User preference updates
- ✅ Photo uploads
- ✅ Unauthorized access attempts (should fail)

---

**Last Updated:** October 18, 2025
**Status:** Ready for deployment
