# 🧪 Firestore Rules Testing - Quick Reference

## 🚀 One-Command Validation (Port-Independent)

Test your rules **anywhere, anytime**, regardless of which port your dev server uses:

```bash
npm run test:firestore:rules
```

**What it does:**
- ✅ Validates all 28 collections have security rules
- ✅ Checks permission model (read/write/create/delete)
- ✅ Validates security best practices
- ✅ Detects hardcoded emails and potential issues
- ✅ Documents expected data access scenarios
- ✅ **No external dependencies needed** (runs pure Node.js)

**Output:** Color-coded report with:
- 📋 Collection Coverage
- 🔐 Permission Model
- 🛡️ Security Practices
- 🧪 Data Access Scenarios
- ✅ Deployment readiness

---

## 📊 Rules At a Glance

| Feature | Status | Details |
|---------|--------|---------|
| Collections Covered | ✅ 28/28 | All collections have rules |
| Default Deny | ✅ Enabled | Unmatched collections blocked |
| Auth Functions | ✅ Complete | isAuthenticated, isOwner, isAdmin |
| Public Profiles | ✅ Supported | Only when `isPublic=true` |
| Username Registry | ✅ Public | Anyone can check availability |
| User Prefs | ✅ Private | Owner-only access |
| Internships | ✅ Public | Anyone can browse |
| Applications | ✅ Restricted | Applicant + recruiter + admin only |
| Notifications | ✅ Private | Recipient-only access |
| Admin Access | ✅ Enabled | Full database access for admins |

---

## 🧪 Test All Scenarios

### Quick CLI Test (Recommended)
```bash
# Test all rules without running any servers
npm run test:firestore:rules

# Expected: ✅ Validation complete! Ready for deployment
```

### Full Integration Tests (Emulator)
```bash
# Terminal 1: Start emulator
npm run test:firestore:emulator

# Terminal 2: Run tests (once emulator is ready)
jest scripts/firestore-rules.test.ts --runInBand
```

### Manual Verification
```bash
# 1. Open Firebase Console
https://console.firebase.google.com/project/saksham-ai-81c3a/firestore/rules

# 2. Click "Simulate"
# 3. Test scenarios:
#    - Path: /profiles/user123, Op: get, Auth: user123 → ✅ ALLOW
#    - Path: /profiles/user123, Op: get, Auth: none, isPublic: true → ✅ ALLOW
#    - Path: /usernames/john, Op: read, Auth: none → ✅ ALLOW
```

---

## 🚦 Permission Matrix

### Profile Access
```
Owner      → ✅ Read, Write, Delete
Other User → ❌ Private / ✅ Public (if isPublic=true)
Admin      → ✅ Read, Write, Delete (override)
Public     → ❌ Private (unless isPublic=true)
```

### Usernames
```
Anyone          → ✅ Read (lookup availability)
Authenticated   → ✅ Create new username
Owner           → ✅ Update/Delete own
Other User      → ❌ Can't modify
```

### Applications
```
Applicant       → ✅ Create, Read, Update own / ❌ Others'
Recruiter       → ✅ Read related applications
Other User      → ❌ Can't access
Admin           → ✅ Full access
```

### User Preferences
```
Owner  → ✅ Read, Write, Delete
Other  → ❌ Denied
Admin  → ✅ Full access
```

---

## ⚡ Deployment Checklist

Before deploying to production:

```bash
# 1. Run local validation (takes ~1 sec)
npm run test:firestore:rules
# Expected: ✅ All tests pass

# 2. Dry-run deployment (check for errors)
firebase deploy --dry-run

# 3. Deploy rules
firebase deploy --only firestore:rules

# 4. Verify in console
# Go to: Firebase Console > Firestore > Rules
# Confirm new rules are published
```

---

## 🛠️ Troubleshooting

### ❌ "Permission denied" errors after deployment

**Check:**
1. Does resource exist in Firestore? (Check Console > Data tab)
2. Does resource have required fields? (e.g., `userId`, `isPublic`)
3. Is user authenticated? (Check browser DevTools > Application > Auth)

**Fix:**
```firestore
// Add defensive checks
allow read: if 
  isOwner(userId) || 
  isAdmin() || 
  (resource.data.isPublic == true && resource.data.isPublic != null);
```

### ⚠️ Hardcoded admin email warning

The rules use `admin@gmail.com` for admin checks. Consider migrating to the admin document approach:

```firestore
// Current (hardcoded)
exists(/databases/$(database)/documents/admins/$(request.auth.uid))

// Better approach: use admin document (already supported)
// Just add user to /admins/{userId} in console
```

### ❌ Validation fails with "Missing collections"

**Cause:** Rules file syntax error  
**Fix:** Check for:
- Mismatched `{` and `}`
- Missing `;` at end of rules
- Typos in function names

Run validator again after fixing:
```bash
npm run test:firestore:rules
```

---

## 📚 Full Testing Guide

For comprehensive testing guide with all methods, see:
```
FIRESTORE_TESTING_GUIDE.md
```

Covers:
- CLI validation (quickest)
- Firebase Emulator (most thorough)
- Manual console testing
- Web app integration testing
- Production deployment

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| Rules File | `./firestore.rules` |
| Changes Doc | `./FIRESTORE_RULES_CHANGES.md` |
| Full Testing Guide | `./FIRESTORE_TESTING_GUIDE.md` |
| Firebase Console | https://console.firebase.google.com/ |
| Rules Simulator | Firestore > Rules > Simulate |
| Firestore Docs | https://firebase.google.com/docs/firestore/security |

---

## 📝 Common Commands

```bash
# Validate rules (1 sec, no servers needed)
npm run test:firestore:rules

# Start emulator for full testing
npm run test:firestore:emulator

# Deploy rules to production
firebase deploy --only firestore:rules

# Dry-run before deployment
firebase deploy --dry-run

# View rule history
firebase rules:log firestore --lines 20

# Rollback to previous version
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

---

**Last Updated:** October 18, 2025  
**Status:** ✅ Production Ready
