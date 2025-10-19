# Firebase Quota Optimization Quick Reference

## Overview

The `firebaseOptimizationService.ts` provides tools to dramatically reduce Firebase Firestore read/write operations.

## Key Metrics

- **Cache TTL:** 5 minutes (configurable)
- **Estimated Quota Reduction:** 80% for cached queries
- **Batch Limit:** 100 documents per query
- **Cache Key:** Auto-generated from query constraints

## Quick Usage

### Basic Query with Caching

```typescript
import { executeOptimizedQuery } from '@/services/firebaseOptimizationService';
import { where } from 'firebase/firestore';

// Simple query
const { data, nextPageStart, hasMore } = await executeOptimizedQuery(
  'internships',
  [where('status', '==', 'active')],
  { 
    pageSize: 20,
    orderByField: 'createdAt',
    orderByDirection: 'desc'
  }
);
```

### Pagination

```typescript
// First page
const page1 = await executeOptimizedQuery('internships', [], { pageSize: 20 });

// Next page (using cursor)
const page2 = await executeOptimizedQuery(
  'internships', 
  [],
  { 
    pageSize: 20,
    startAfter: page1.nextPageStart  // Pass previous cursor
  }
);
```

### Cache Management

```typescript
// Clear specific collection cache
clearCollectionCache('internships');

// Or create fresh query with cache bypass
const freshData = await executeOptimizedQuery(
  'internships',
  [],
  { bypassCache: true }  // If implemented
);
```

## Integration Points

### 1. Index.tsx (Homepage)

```typescript
// Replace existing:
// const allInternships = await fetchInternships();

// With:
const { data: allInternships } = await executeOptimizedQuery(
  'internships',
  [where('status', '==', 'active')],
  { pageSize: 100 }
);
```

### 2. SearchPage.tsx

```typescript
// Search with optimization
const { data: results, nextPageStart } = await executeOptimizedQuery(
  'internships',
  [
    where('status', '==', 'active'),
    where('company', '==', searchTerm)
  ],
  { pageSize: 20 }
);
```

### 3. UserProfilePage.tsx

```typescript
// Get user's applied internships
const { data: applications } = await executeOptimizedQuery(
  'applications',
  [where('userId', '==', currentUser.uid)],
  { pageSize: 50 }
);
```

## Quota Estimation

```typescript
import { getQuotaEstimate } from '@/services/firebaseOptimizationService';

// Estimate reads for a query
const estimate = getQuotaEstimate('read', 1000); // 1000 documents
console.log(`Estimated: ${estimate} reads`);

// Estimate writes
const writeEstimate = getQuotaEstimate('write', 500); // 500 documents
```

## Before & After

### Without Optimization
```typescript
// Monthly usage: 1 million reads
- Every search: 500 reads
- Every page load: 300 reads
- Refresh: 500 reads
- Total per user: ~50,000 reads/month
- For 20 users: 1,000,000 reads/month ❌
```

### With Optimization
```typescript
// Monthly usage: 200,000 reads (80% reduction)
- First search: 500 reads
- Subsequent: 0 reads (cached for 5 min)
- Page load: 300 reads (cached)
- Refresh: 0 reads (cache hit)
- Total per user: ~10,000 reads/month
- For 20 users: 200,000 reads/month ✅
```

## Configuration

### Adjust Cache Duration

Edit `firebaseOptimizationService.ts`:

```typescript
// Change from 5 minutes (300000 ms):
const CACHE_TTL = 300000; // 5 minutes

// To your preference:
const CACHE_TTL = 600000; // 10 minutes (more quota savings)
const CACHE_TTL = 120000; // 2 minutes (fresher data)
```

### Adjust Batch Size

```typescript
const { data } = await executeOptimizedQuery(
  'internships',
  [],
  { pageSize: 50 }  // Default 20, adjust as needed
);
```

## Monitoring

### Firebase Console

1. Go to Firestore → Usage
2. Check "Read operations" chart
3. Expected drop after implementation: 70-80%

### Local Testing

```typescript
// Log cache hits/misses
const stats = {
  cacheHits: 0,
  cacheMisses: 0,
  queriesRun: 0
};

// Monitor in console
console.log(`Cache hit rate: ${(stats.cacheHits / stats.queriesRun * 100).toFixed(2)}%`);
```

## Advanced: Custom Cache Strategy

```typescript
// For specific collections with higher cache TTL
const COLLECTION_CACHE_TTL = {
  'internships': 600000,      // 10 min (stable data)
  'applications': 300000,     // 5 min (changes often)
  'userProfiles': 1800000,    // 30 min (rarely changes)
};

// Implement in service:
const ttl = COLLECTION_CACHE_TTL[collectionName] || CACHE_TTL;
```

## Troubleshooting

### Cache not clearing
```typescript
// Manually clear on user action
import { clearCollectionCache } from '@/services/firebaseOptimizationService';

const handleApplyInternship = async () => {
  await submitApplication();
  clearCollectionCache('applications'); // Update on apply
};
```

### Too much stale data
- Reduce `CACHE_TTL` to 120000 (2 min)
- Or implement selective cache clear

### Build errors
- Ensure `firebaseOptimizationService.ts` is in `src/services/`
- Check all imports are correct

## Performance Timeline

| Phase | Action | Impact | Time |
|-------|--------|--------|------|
| Week 1 | Implement in Index.tsx | -40% reads | ASAP |
| Week 2 | Add to SearchPage | -70% reads | 20 min |
| Week 3 | Integrate profile queries | -80% reads | 30 min |
| Week 4 | Monitor & optimize | Target met | Ongoing |

## Comparison: With vs Without

```
Without Optimization:
GET /internships → Firebase (500 reads)
GET /internships → Firebase (500 reads)
GET /internships → Firebase (500 reads)
= 1,500 reads for same data

With Optimization:
GET /internships → Firebase (500 reads) + Cache
GET /internships → Cache (0 reads) ✅
GET /internships → Cache (0 reads) ✅
= 500 reads for same data (66% savings in 5 min)
```

## Next Steps

1. ✅ Service created: `firebaseOptimizationService.ts`
2. ⏳ Integrate into Index.tsx
3. ⏳ Integrate into SearchPage.tsx
4. ⏳ Add pagination UI
5. ⏳ Monitor quota in Firebase Console

## Support

For issues:
- Check `src/services/firebaseOptimizationService.ts` for implementation
- Verify Firestore security rules allow read operations
- Check browser console for error messages
- Monitor Firebase quota usage

---

**Status:** Ready for Integration  
**Expected Quota Savings:** 80%  
**Estimated Setup Time:** 1-2 hours  
**Live Deployment:** After integration testing  
