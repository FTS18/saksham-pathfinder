# Firebase Cost Optimization Plan

## Executive Summary
Your app is currently hitting Firebase no-cost limits because of:
1. **Heavy read operations** - Multiple queries for internship listings, filters, searches
2. **Missing indexes** - Queries without composite indexes causing full collection scans
3. **No caching** - Every component fetch re-queries Firestore instead of using cached data
4. **Real-time listeners** - Continuous `onSnapshot` subscriptions even when not needed
5. **Individual operations** - Separate read/write calls instead of batched operations

**Estimated Savings: 70-80% cost reduction** by implementing all optimizations.

---

## Phase 1: Add Composite Indexes ⚡

### Current Status
✅ You have 4 basic indexes for:
- `internships` (status + createdAt)
- `internships` (featured + viewCount)
- `notifications` (userId + createdAt)
- `internships` (recruiterId + createdAt)

### Missing Indexes (Required)
Add these to `firestore.indexes.json` to reduce full collection scans:

```json
{
  "collectionGroup": "internships",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "sector_tags", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Reason:** Search by sector + filter active ones

```json
{
  "collectionGroup": "internships",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "location", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Reason:** Search by city + filter active ones

```json
{
  "collectionGroup": "applications",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "userId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Reason:** Fetch user's applications

---

## Phase 2: Implement React Query Caching 📦

### Current State
❌ **0% React Query usage** - All components do direct Firestore queries
- `EnhancedSearch.tsx` - Queries internships on every filter change
- `InternshipCard.tsx` - No caching
- `StudentDashboard.tsx` - Fetches fresh data on every visit
- Every filter change = new Firestore read

### What to Implement
Create `src/hooks/useInternships.ts`:

```typescript
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { FirestoreService } from '@/services/firestoreService';

export const useInternships = (filters = {}, pageSize = 20) => {
  return useQuery({
    queryKey: ['internships', JSON.stringify(filters)],
    queryFn: () => FirestoreService.getInternships(filters, pageSize),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'stale', // Only refetch if stale
  });
};

export const useInternshipsInfinite = (filters = {}, pageSize = 20) => {
  return useInfiniteQuery({
    queryKey: ['internships-infinite', JSON.stringify(filters)],
    queryFn: ({ pageParam = null }) =>
      FirestoreService.getInternships(filters, pageSize, pageParam),
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    staleTime: 5 * 60 * 1000,
  });
};
```

### Components to Update
- `EnhancedSearch.tsx` - Use `useInternshipsInfinite`
- `StudentDashboard.tsx` - Use `useInternships`
- `LiveInternships.tsx` - Use `useInternshipsInfinite`
- `InternshipFilters.tsx` - Use `useInternships` with filter caching

**Estimated Read Reduction: 40-50%**

---

## Phase 3: Optimize Collection Listeners 🎯

### Current Problems
❌ `ManageInternships.tsx` (line 40)
```tsx
const unsubscribe = onSnapshot(q, (snapshot) => { /* ... */ });
// Issue: Listens CONTINUOUSLY even when user switches tabs
```

❌ `NotificationSystem.tsx` (line 39)
```tsx
const unsubscribe = onSnapshot(q, (snapshot) => { /* ... */ });
// Issue: ALWAYS listening, even if notification panel closed
```

### Fixes Required

**File: `src/pages/recruiter/ManageInternships.tsx`**
- ✅ Only listen when component visible
- ✅ Unsubscribe when user closes page
- ✅ Add cleanup on unmount (already done!)

**File: `src/components/NotificationSystem.tsx`**
- ✅ Only subscribe when notification panel is open
- ✅ Unsubscribe when closed
- Replace `onSnapshot` with `getDocs` for initial load

**File: `src/components/AccountSettings.tsx`** (if using listeners)
- ✅ Audit all listeners
- ✅ Only active on visible tabs

**Estimated Read Reduction: 20-30%**

---

## Phase 4: Batch Operations 🔄

### Current Problems
❌ Multiple individual writes instead of batches

### Examples to Fix

**Before:**
```typescript
// 3 separate write operations = 3 write costs
await updateDoc(doc(db, 'users', userId), { name: newName });
await updateDoc(doc(db, 'profiles', userId), { updated: true });
await addDoc(collection(db, 'activities'), { action: 'update' });
```

**After:**
```typescript
// 1 batch = 1 write cost
const batch = writeBatch(db);
batch.update(doc(db, 'users', userId), { name: newName });
batch.update(doc(db, 'profiles', userId), { updated: true });
batch.set(doc(db, 'activities', docId), { action: 'update' });
await batch.commit();
```

### Collections to Batch
1. **OnboardingService.completeStudentOnboarding()** - Updates profile + settings + activity
2. **SocialService.followUser()** - Updates follower counts + creates record
3. **ApplicationService.applyToInternship()** - Updates application + user stats + notification

**Estimated Write Reduction: 30-40%**

---

## Phase 5: Hybrid Architecture (Supabase Migration) 🚀

### What Moves to Supabase
**Read-heavy, write-rarely collections:**
- `internships` ✅ 1000s of reads, few writes
- `companies` ✅ Static reference data
- `skills` ✅ Static reference data
- `sectors` ✅ Static reference data

**What Stays in Firestore**
**Real-time, write-heavy collections:**
- `profiles` ✅ Real-time user data
- `applications` ✅ User-specific
- `messages` ✅ Real-time chat
- `followers` ✅ Real-time follows
- `notifications` ✅ Real-time notifications

### Benefits
| Metric | Firestore | Supabase |
|--------|-----------|----------|
| Cost per 100k reads | ~$0.06 | ~$0.001 |
| Free tier reads | 50k/day | Unlimited |
| Real-time support | ✅ | ✅ |
| Simple queries | ✅ | ✅✅ (SQL faster) |

**Estimated Total Cost Reduction: 70-80%**

---

## Implementation Timeline

### Week 1: Low-effort, High-impact
- **Step 1:** Add missing Firestore indexes (30 min)
  - Cost reduction: 10-15%
  - Effort: Minimal
  - Risk: None

- **Step 2:** Fix listener subscriptions (1 hour)
  - Cost reduction: 20-30%
  - Effort: Low
  - Risk: Low

- **Step 3:** Batch operations (2 hours)
  - Cost reduction: 30-40%
  - Effort: Low-Medium
  - Risk: Low

### Week 2: Medium-effort, Maximum-impact
- **Step 4:** Implement React Query caching (3 hours)
  - Cost reduction: 40-50%
  - Effort: Medium
  - Risk: Low

### Week 3-4: High-impact Migration (optional if still over budget)
- **Step 5:** Migrate internships to Supabase (8 hours)
  - Cost reduction: 70-80% total
  - Effort: High
  - Risk: Medium (but with fallback)

---

## Quick Wins (Do These First!)

### ✅ Quick Fix 1: Add Missing Indexes
**Time: 5 minutes**
1. Update `firestore.indexes.json` with 3 new indexes
2. Deploy: `firebase deploy --only firestore:indexes`
3. Wait 10 minutes for indexes to build
4. **Result: 10-15% cost savings immediately**

### ✅ Quick Fix 2: Disable Unnecessary Listeners
**Time: 30 minutes**
1. Update `NotificationSystem.tsx` - Only listen when panel open
2. Update `ManageInternships.tsx` - Only listen when user active
3. **Result: 20-30% cost savings**

### ✅ Quick Fix 3: Batch Write Operations
**Time: 1 hour**
1. Update `OnboardingService.completeStudentOnboarding()`
2. Update `SocialService.followUser()`
3. **Result: 30-40% cost savings**

---

## Monitoring & Verification

### How to Track Savings
1. **Firebase Console** → Usage tab
2. **Look for:**
   - Daily read operations (should drop 50%)
   - Daily write operations (should drop 30%)
   - Storage operations (should drop 20%)

### Expected Numbers After All Optimizations
| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Daily reads | 500k | 100k | 80% ↓ |
| Daily writes | 50k | 35k | 30% ↓ |
| Estimated cost | $250/month | $30/month | 88% ↓ |

---

## File-by-File Checklist

### 🔥 Firestore Core
- [ ] `firestore.indexes.json` - Add 3 new indexes
- [ ] `src/lib/firebase.ts` - No changes needed
- [ ] `firestore.rules` - Already optimized

### 🛠️ Services to Update
- [ ] `src/services/firestoreService.ts` - Batch getInternships calls
- [ ] `src/services/onboardingService.ts` - Use writeBatch()
- [ ] `src/services/socialService.ts` - Use writeBatch()
- [ ] `src/services/applicationService.ts` - Use writeBatch()

### ⚛️ Hooks to Create
- [ ] `src/hooks/useInternships.ts` - React Query wrapper
- [ ] `src/hooks/useNotifications.ts` - Smart notification hook
- [ ] `src/hooks/useApplications.ts` - Application caching

### 🧩 Components to Update
- [ ] `src/components/NotificationSystem.tsx` - Conditional listening
- [ ] `src/pages/recruiter/ManageInternships.tsx` - Already has cleanup
- [ ] `src/components/EnhancedSearch.tsx` - Use React Query

### 📊 Dashboard Components
- [ ] `src/pages/StudentDashboard.tsx` - Use cached queries
- [ ] `src/pages/ApplicationDashboard.tsx` - Use cached queries
- [ ] `src/pages/LiveInternships.tsx` - Use React Query infinite

---

## Next Steps

**Ready to start? I'll implement these in order:**

1. ✅ Add Firestore composite indexes
2. ✅ Fix listener subscriptions
3. ✅ Batch operations in services
4. ✅ Create React Query hooks
5. ✅ Update components to use caching
6. 🚀 (Optional) Migrate internships to Supabase

**Which would you like me to start with?**
