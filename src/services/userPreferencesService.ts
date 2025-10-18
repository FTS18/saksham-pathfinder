import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SearchHistoryItem {
  query: string;
  timestamp: Timestamp;
}

export interface RecentlyViewedItem {
  id: string;
  title: string;
  company: string;
  timestamp: Timestamp;
}

export interface UserPreferences {
  searchHistory: SearchHistoryItem[];
  recentlyViewed: RecentlyViewedItem[];
  theme: string;
  colorTheme: string;
  language: string;
  fontSize: number;
  wishlist: string[];
  lastLoginTheme?: string;
  lastLoginColorTheme?: string;
  lastUpdated: Timestamp;
}

class UserPreferencesService {
  private static getPreferencesRef(userId: string) {
    // Validate Firebase is initialized
    if (!db) {
      throw new Error('Firebase database not initialized');
    }
    // Now reading from profiles collection instead of userPreferences
    return doc(db, 'profiles', userId);
  }

  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    try {
      const docRef = this.getPreferencesRef(userId);
      const docSnap = await getDoc(docRef);
      
      let preferences: UserPreferences;
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        preferences = {
          searchHistory: profileData?.searchHistory || [],
          recentlyViewed: profileData?.recentlyViewed || [],
          theme: String(profileData?.theme || 'dark').replace(/[\s\n\r\t]/g, ''),
          colorTheme: String(profileData?.colorTheme || 'blue').replace(/[\s\n\r\t]/g, ''),
          language: profileData?.language || 'en',
          fontSize: profileData?.fontSize || 16,
          wishlist: profileData?.wishlist || [],
          lastUpdated: profileData?.updatedAt || Timestamp.now()
        };
      } else {
        // Sync localStorage data to Firebase on first login
        const localData = this.getLocalStorageData();
        const defaultPreferences: UserPreferences = {
          searchHistory: localData.searchHistory,
          recentlyViewed: localData.recentlyViewed,
          theme: localData.theme,
          colorTheme: localData.colorTheme,
          language: localData.language,
          fontSize: localData.fontSize,
          wishlist: localData.wishlist,
          lastUpdated: Timestamp.now()
        };
        
        // Save to profiles collection instead
        await setDoc(docRef, {
          ...defaultPreferences,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        preferences = defaultPreferences;
      }
      
      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  private static getLocalStorageData() {
    const searchHistory = JSON.parse(localStorage.getItem('saksham_search_history') || '[]')
      .map((query: string) => ({ query, timestamp: Timestamp.now() }));
    
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      .map((item: any) => ({ 
        id: item.id, 
        title: item.title, 
        company: item.company, 
        timestamp: Timestamp.now() 
      }));
    
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const theme = localStorage.getItem('theme') || 'light';
    const colorTheme = localStorage.getItem('colorTheme') || 'blue';
    const language = localStorage.getItem('language') || 'en';
    const fontSize = parseInt(localStorage.getItem('fontSize') || '16');
    
    return { searchHistory, recentlyViewed, wishlist, theme, colorTheme, language, fontSize };
  }

  static async addToSearchHistory(userId: string, query: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      const preferences = await this.getUserPreferences(userId);
      
      // Remove existing entry if it exists
      const filteredHistory = preferences.searchHistory.filter(item => item.query !== query);
      
      // Add new entry at the beginning
      const newHistory = [
        { query, timestamp: Timestamp.now() },
        ...filteredHistory
      ].slice(0, 10); // Keep only 10 items
      
      await updateDoc(docRef, {
        searchHistory: newHistory,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding to search history:', error);
      throw error;
    }
  }

  static async removeFromSearchHistory(userId: string, query: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      const preferences = await this.getUserPreferences(userId);
      
      const filteredHistory = preferences.searchHistory.filter(item => item.query !== query);
      
      await updateDoc(docRef, {
        searchHistory: filteredHistory,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing from search history:', error);
      throw error;
    }
  }

  static async clearSearchHistory(userId: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      
      await updateDoc(docRef, {
        searchHistory: [],
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error clearing search history:', error);
      throw error;
    }
  }

  static async addToRecentlyViewed(userId: string, internship: { id: string; title: string; company: string }): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      const preferences = await this.getUserPreferences(userId);
      
      // Remove existing entry if it exists
      const filteredViewed = preferences.recentlyViewed.filter(item => item.id !== internship.id);
      
      // Add new entry at the beginning
      const newViewed = [
        { ...internship, timestamp: Timestamp.now() },
        ...filteredViewed
      ].slice(0, 10); // Keep only 10 items
      
      await updateDoc(docRef, {
        recentlyViewed: newViewed,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
      throw error;
    }
  }

  static async updateTheme(userId: string, theme: string, colorTheme: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      
      // Save to profiles collection (single source of truth)
      await updateDoc(docRef, {
        theme,
        colorTheme,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  }

  static async updateLanguage(userId: string, language: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      
      await updateDoc(docRef, {
        language,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  }

  static async updateFontSize(userId: string, fontSize: number): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      
      await updateDoc(docRef, {
        fontSize,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating font size:', error);
      throw error;
    }
  }

  static async syncLocalToFirebase(userId: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      const docSnap = await getDoc(docRef);
      const localData = this.getLocalStorageData();
      
      if (docSnap.exists()) {
        const firebaseData = docSnap.data();
        
        // Merge data with profiles collection (reading from profiles only now)
        const mergedWishlist = [...new Set([...(firebaseData.wishlist || []), ...localData.wishlist])];
        const mergedSearchHistory = [...(firebaseData.searchHistory || []), ...localData.searchHistory].slice(0, 10);
        const mergedRecentlyViewed = [...(firebaseData.recentlyViewed || []), ...localData.recentlyViewed].slice(0, 10);
        
        // Build update object - only include fields that have values (avoid undefined)
        const updateData: any = {
          wishlist: mergedWishlist,
          searchHistory: mergedSearchHistory,
          recentlyViewed: mergedRecentlyViewed,
          updatedAt: new Date().toISOString()
        };
        
        // Only add theme/language/fontSize if they exist in Firebase data
        if (firebaseData.theme) updateData.theme = firebaseData.theme;
        if (firebaseData.colorTheme) updateData.colorTheme = firebaseData.colorTheme;
        if (firebaseData.language) updateData.language = firebaseData.language;
        if (firebaseData.fontSize) updateData.fontSize = firebaseData.fontSize;
        
        await updateDoc(docRef, updateData);
      } else {
        // First time user - save local data to profiles collection
        const defaultPreferences = {
          searchHistory: localData.searchHistory,
          recentlyViewed: localData.recentlyViewed,
          theme: localData.theme,
          colorTheme: localData.colorTheme,
          language: localData.language,
          fontSize: localData.fontSize,
          wishlist: localData.wishlist,
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(docRef, defaultPreferences, { merge: true });
      }
    } catch (error) {
      console.error('Error syncing local to Firebase:', error);
    }
  }

  private static clearLocalStorage() {
    localStorage.removeItem('saksham_search_history');
    localStorage.removeItem('recentlyViewed');
    localStorage.removeItem('wishlist');
    localStorage.removeItem('theme');
    localStorage.removeItem('colorTheme');
    localStorage.removeItem('language');
    localStorage.removeItem('fontSize');
  }

  static async addToWishlist(userId: string, internshipId: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      
      await updateDoc(docRef, {
        wishlist: arrayUnion(internshipId),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  static async removeFromWishlist(userId: string, internshipId: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      
      await updateDoc(docRef, {
        wishlist: arrayRemove(internshipId),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  static async updateLastLoginTheme(userId: string, theme: string, colorTheme: string): Promise<void> {
    try {
      const docRef = this.getPreferencesRef(userId);
      
      await updateDoc(docRef, {
        lastLoginTheme: theme,
        lastLoginColorTheme: colorTheme,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating last login theme:', error);
      throw error;
    }
  }
}

export default UserPreferencesService;