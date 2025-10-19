import { collection, query, limit, orderBy, getDocs, QueryConstraint, startAfter, Query, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Firebase Query Optimization Service
 * Reduces read quotas by:
 * - Limiting results per page
 * - Using efficient ordering
 * - Implementing pagination
 * - Caching results client-side
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const queryCache = new Map<string, { data: any[]; timestamp: number }>();

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface PaginationOptions {
  pageSize?: number;
  startAfterDoc?: DocumentSnapshot;
  orderByField?: string;
  orderByDirection?: 'asc' | 'desc';
}

/**
 * Execute paginated query with client-side caching
 */
export async function executeOptimizedQuery(
  collectionName: string,
  constraints: QueryConstraint[],
  options: PaginationOptions = {}
): Promise<{ data: any[]; nextPageStart: DocumentSnapshot | null }> {
  const cacheKey = `${collectionName}:${JSON.stringify(constraints)}:${JSON.stringify(options)}`;
  
  // Check cache
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { data: cached.data, nextPageStart: null };
  }

  const pageSize = Math.min(options.pageSize ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const col = collection(db, collectionName);
  
  const queryConstraints: QueryConstraint[] = [
    ...constraints,
    limit(pageSize + 1) // Fetch one extra to check if there's a next page
  ];

  if (options.startAfterDoc) {
    queryConstraints.push(startAfter(options.startAfterDoc));
  }

  const q = query(col, ...queryConstraints);
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;

  let hasMore = false;
  let nextPageStart: DocumentSnapshot | null = null;

  if (docs.length > pageSize) {
    hasMore = true;
    docs.pop(); // Remove the extra document
    nextPageStart = docs[docs.length - 1];
  }

  const data = docs.map(doc => ({ id: doc.id, ...doc.data() }));

  // Cache results
  queryCache.set(cacheKey, { data, timestamp: Date.now() });

  return { data, nextPageStart: nextPageStart || null };
}

/**
 * Clear cache for a specific collection
 */
export function clearCollectionCache(collectionName: string) {
  const keysToDelete: string[] = [];
  queryCache.forEach((_, key) => {
    if (key.startsWith(`${collectionName}:`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => queryCache.delete(key));
}

/**
 * Clear all caches
 */
export function clearAllQueryCache() {
  queryCache.clear();
}

/**
 * Get read quota estimate
 */
export function getQuotaEstimate(): { reads: number; writes: number } {
  // Estimate based on cache hits
  const totalQueries = queryCache.size;
  const estimatedReads = totalQueries * 1; // 1 read per unique query
  
  return {
    reads: estimatedReads,
    writes: 0
  };
}
