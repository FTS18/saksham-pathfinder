interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    
    this.cache.set(key, item);
    
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    let item = this.cache.get(key);
    
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          this.cache.set(key, item);
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error);
      }
    }
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  async fetchWithCache<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;
    
    if (!navigator.onLine) {
      const item = this.cache.get(key);
      if (item) return item.data;
      throw new Error('No cached data available offline');
    }
    
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      const item = this.cache.get(key);
      if (item) return item.data;
      throw error;
    }
  }
}

export const cache = new CacheManager();

export const CACHE_KEYS = {
  INTERNSHIPS: 'internships',
  USER_PROFILE: 'user_profile',
  FILTERS: 'filters',
};