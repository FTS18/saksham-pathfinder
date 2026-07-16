// FIX #21: Replace synchronous localStorage cache with IndexedDB.
// localStorage is synchronous (blocks main thread) and limited to ~5MB.
// IndexedDB is async, can hold 50-500MB, and doesn't block rendering.
// L1 = in-memory Map (fast, session-only)
// L2 = IndexedDB (async, persists across sessions)

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const DB_NAME = "saksham_cache";
const DB_VERSION = 1;
const STORE_NAME = "cache";

function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openCacheDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function idbSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await openCacheDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IndexedDB unavailable (private browsing, etc.) — silent fail, L1 still works
  }
}

async function idbDelete(key: string): Promise<void> {
  try {
    const db = await openCacheDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silent fail
  }
}

class CacheManager {
  private l1 = new Map<string, CacheItem<any>>(); // L1: in-memory
  private readonly DEFAULT_TTL = 5 * 60 * 1000;  // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
    };
    this.l1.set(key, item);
    idbSet(`cache_${key}`, item); // async, fire-and-forget
  }

  get<T>(key: string): T | null {
    // L1: synchronous in-memory hit
    const item = this.l1.get(key);
    if (item) {
      if (Date.now() > item.expiry) {
        this.delete(key);
        return null;
      }
      return item.data as T;
    }
    return null; // Async hydration happens via getAsync()
  }

  async getAsync<T>(key: string): Promise<T | null> {
    // Check L1 first
    const l1 = this.get<T>(key);
    if (l1 !== null) return l1;

    // Check L2 (IndexedDB)
    const item = await idbGet<CacheItem<T>>(`cache_${key}`);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      await idbDelete(`cache_${key}`);
      return null;
    }

    // Warm up L1 from L2
    this.l1.set(key, item);
    return item.data;
  }

  delete(key: string): void {
    this.l1.delete(key);
    idbDelete(`cache_${key}`);
  }

  async fetchWithCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.getAsync<T>(key);
    if (cached !== null) return cached;

    if (!navigator.onLine) {
      const item = this.l1.get(key);
      if (item) return item.data;
      throw new Error("No cached data available offline");
    }

    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      const item = this.l1.get(key);
      if (item) return item.data;
      throw error;
    }
  }
}

export const cache = new CacheManager();

export const CACHE_KEYS = {
  INTERNSHIPS: "internships",
  USER_PROFILE: "user_profile",
  FILTERS: "filters",
};