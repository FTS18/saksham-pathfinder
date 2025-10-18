# Admin & Recruiter Account Setup Guide

## Quick Summary of Changes

### ✅ Updated Configuration
- **Admin Email**: `spacify1807@gmail.com`
- **Firestore Rules**: Updated to recognize this email as admin
- **Authentication**: Both login tabs now properly route users

---

## Setup Instructions

### 1. **Verify Your Email in Firebase**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication → Users**
4. If `spacify1807@gmail.com` is not listed, create it:
   - Click **"Add user"** (or **"Create user"**)
   - Email: `spacify1807@gmail.com`
   - Password: any password you want (e.g., `Test123!`)
   - Click **"Create"**

**Important**: After creating the account, Firebase will send a verification email to `spacify1807@gmail.com`. **Click the verification link in that email** to verify the account.

### 2. **Login as Admin (Recruiter Portal)**

Once verified, you can test admin access:

1. Open the app at `http://localhost:8080`
2. Click on **"Recruiter Login"** tab
3. Enter credentials:
   - Email: `spacify1807@gmail.com`
   - Password: (the password you created above)
4. Click **"Login as Recruiter"**

**Expected Behavior**:
- You'll be logged in with `userType: 'recruiter'`
- Firestore will recognize you as admin (via email check)
- You can access `/recruiter/manage-internships`
- You can CREATE, READ, UPDATE, DELETE any internship

### 3. **Test Regular Recruiter Account**

To test a recruiter account (non-admin):

1. Create a new Firebase user for testing (different email)
2. Go to Firestore → Collections → `recruiters`
3. Create a document with:
   - Document ID: (the UID of the recruiter account)
   - Fields: (can be empty or add metadata)
4. Login with this account via "Recruiter Login" tab
5. You should only see/edit your own internships

### 4. **Firestore Rules Explanation**

The rules in `firestore.rules` now:

```javascript
function isAdmin() {
  return isAuthenticated() && 
    (request.auth.token.email == 'spacify1807@gmail.com' || 
     exists(/databases/{database}/documents/admins/{request.auth.uid}));
}
```

This means a user is admin if:
- ✅ Their email is `spacify1807@gmail.com` (you!), OR
- ✅ Their UID exists in the `/admins` collection in Firestore

### 5. **Internship Permissions**

For `/internships/{internshipId}`:
- ✅ **Read**: Anyone (public)
- ✅ **Create**: Any authenticated user
- ✅ **Update**: Creator, recruiter who owns it, or admin
- ✅ **Delete**: Creator, recruiter who owns it, or admin

---

## Testing Checklist

After setup, verify these scenarios work:

### ✅ Admin Testing (spacify1807@gmail.com)
- [ ] Login via "Recruiter Login" tab
- [ ] Navigate to `/recruiter/manage-internships`
- [ ] Create a new internship
- [ ] Update an existing internship
- [ ] Delete an internship
- [ ] See ALL internships (not filtered by recruiter)

### ✅ Recruiter Testing (other account)
- [ ] Login via "Recruiter Login" tab
- [ ] Navigate to `/recruiter/manage-internships`
- [ ] See only your own internships
- [ ] Create a new internship
- [ ] Update your own internship
- [ ] Try to update another recruiter's internship (should FAIL)

### ✅ Student Testing
- [ ] Login via "Student Login" tab
- [ ] View internships on homepage
- [ ] Cannot access `/recruiter/*` routes

---

## Troubleshooting

### "Missing or insufficient permissions" error

**Solution**: 
1. Check that your account is verified in Firebase (check your email)
2. Hard refresh the page: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
3. Clear browser cache
4. Try logging out and back in

### "404 on /recruiter/manage-internships"

**Solution**:
1. Make sure you're logged in as a recruiter (`userType === 'recruiter'`)
2. Check browser console for errors
3. Make sure you used "Recruiter Login" tab, not "Student Login"

### Email verification not received

**Solution**:
1. Check spam folder
2. Resend verification email:
   - Go to Firebase Console → Authentication → Users
   - Click on the user
   - Click **"Send verification email"**

---

## File Changes Summary

### Modified Files:
1. **`firestore.rules`**
   - Updated `isAdmin()` function to use `spacify1807@gmail.com`

2. **`src/contexts/AuthContext.tsx`**
   - Updated `loginAsRecruiter()` to allow admin account
   - Removed duplicate admin check logic

### How It Works:

1. **Frontend**: When you login with `spacify1807@gmail.com` via recruiter tab, `userType` is set to `'recruiter'`
2. **Backend**: Firestore rules check the email token and grant admin permissions
3. **Result**: You can manage all internships as admin

---

## Next Steps

Once verified, you can:
1. ✅ Test creating/updating/deleting internships
2. ✅ Create multiple recruiter accounts for testing
3. ✅ Deploy rules to production when ready
4. ✅ Add more admin accounts by updating Firestore rules or adding to `/admins` collection

---

## Questions?

Check the browser console (F12 → Console tab) for any errors.
Look at the Network tab to see Firestore error details.
