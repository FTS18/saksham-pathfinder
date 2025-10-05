import UserPreferencesService from './userPreferencesService';
import { ApplicationService } from './applicationService';

class DataSyncService {
  static async syncAllUserData(userId: string): Promise<void> {
    try {
      // First sync local data to Firebase
      await UserPreferencesService.syncLocalToFirebase(userId);
      
      // Then load all data from Firebase
      const preferences = await UserPreferencesService.getUserPreferences(userId);
      
      // Restore all data to localStorage and UI
      this.restoreAllData(preferences);
      
      console.log('✅ All user data synced successfully');
    } catch (error) {
      console.error('❌ Error syncing user data:', error);
    }
  }

  private static restoreAllData(preferences: any) {
    // Restore theme settings
    if (preferences.theme) {
      localStorage.setItem('theme', preferences.theme);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(preferences.theme);
    }
    
    if (preferences.colorTheme) {
      localStorage.setItem('colorTheme', preferences.colorTheme);
      document.documentElement.classList.remove('blue', 'grey', 'red', 'yellow', 'green');
      document.documentElement.classList.add(preferences.colorTheme);
    }
    
    if (preferences.language) {
      localStorage.setItem('language', preferences.language);
      document.documentElement.lang = preferences.language;
    }
    
    if (preferences.fontSize) {
      localStorage.setItem('fontSize', String(preferences.fontSize));
      document.documentElement.style.fontSize = `${preferences.fontSize}px`;
    }
    
    // Restore wishlist
    if (preferences.wishlist && Array.isArray(preferences.wishlist)) {
      localStorage.setItem('wishlist', JSON.stringify(preferences.wishlist));
    }
    
    // Restore search history
    if (preferences.searchHistory && Array.isArray(preferences.searchHistory)) {
      localStorage.setItem('saksham_search_history', JSON.stringify(preferences.searchHistory));
    }
    
    // Restore recently viewed
    if (preferences.recentlyViewed && Array.isArray(preferences.recentlyViewed)) {
      localStorage.setItem('recentlyViewed', JSON.stringify(preferences.recentlyViewed));
    }
    
    // Restore user profile
    if (preferences.userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(preferences.userProfile));
    }
    
    // Restore onboarding status
    if (preferences.onboardingCompleted) {
      localStorage.setItem('onboardingCompleted', 'true');
    }
  }

  static async clearLocalStorageAfterSync(): Promise<void> {
    const keysToRemove = [
      'saksham_search_history',
      'recentlyViewed', 
      'wishlist',
      'userProfile'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('🧹 Local storage cleared after sync');
  }
  
  static async loadUserDataFromFirebase(userId: string): Promise<void> {
    try {
      const preferences = await UserPreferencesService.getUserPreferences(userId);
      this.restoreAllData(preferences);
      console.log('✅ User data loaded from Firebase');
    } catch (error) {
      console.error('❌ Error loading user data from Firebase:', error);
    }
  }
}

export default DataSyncService;