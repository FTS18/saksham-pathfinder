import UserPreferencesService from "./userPreferencesService";
import { ApplicationService } from "./applicationService";

class DataSyncService {
  static async syncAllUserData(userId: string): Promise<void> {
    try {
      // Skip syncLocalToFirebase since we now manage theme/preferences directly in ThemeContext
      // and theme changes save directly to profiles collection

      // Just load all data from Firebase
      const preferences = await UserPreferencesService.getUserPreferences(
        userId
      );

      // Restore all data to localStorage and UI
      this.restoreAllData(preferences);
    } catch (error) {
      console.error("❌ Error syncing user data:", error);
    }
  }

  private static restoreAllData(preferences: any) {
    // Restore theme settings
    if (preferences.theme) {
      // Aggressively clean theme value - remove all whitespace and newlines
      const theme = String(preferences.theme).replace(/[\s\n\r\t]/g, "");
      const validThemes = ["light", "dark"];
      if (validThemes.includes(theme)) {
        localStorage.setItem("theme", theme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
      }
    }

    if (preferences.colorTheme) {
      // Aggressively clean colorTheme value
      const colorTheme = String(preferences.colorTheme).replace(
        /[\s\n\r\t]/g,
        ""
      );
      const validColors = ["blue", "grey", "red", "yellow", "green"];
      if (validColors.includes(colorTheme)) {
        localStorage.setItem("colorTheme", colorTheme);
        document.documentElement.classList.remove(
          "blue",
          "grey",
          "red",
          "yellow",
          "green"
        );
        document.documentElement.classList.add(colorTheme);
      }
    }

    if (preferences.language) {
      const language = String(preferences.language).replace(/[\s\n\r\t]/g, "");
      localStorage.setItem("language", language);
      document.documentElement.lang = language;
    }

    if (preferences.fontSize) {
      const fontSize = String(preferences.fontSize).replace(/[\s\n\r\t]/g, "");
      localStorage.setItem("fontSize", fontSize);
      document.documentElement.style.fontSize = `${fontSize}px`;
    }

    // Restore wishlist
    if (preferences.wishlist && Array.isArray(preferences.wishlist)) {
      localStorage.setItem("wishlist", JSON.stringify(preferences.wishlist));
    }

    // Restore search history
    if (preferences.searchHistory && Array.isArray(preferences.searchHistory)) {
      localStorage.setItem(
        "saksham_search_history",
        JSON.stringify(preferences.searchHistory)
      );
    }

    // Restore recently viewed
    if (
      preferences.recentlyViewed &&
      Array.isArray(preferences.recentlyViewed)
    ) {
      localStorage.setItem(
        "recentlyViewed",
        JSON.stringify(preferences.recentlyViewed)
      );
    }

    // Restore user profile
    if (preferences.userProfile) {
      localStorage.setItem(
        "userProfile",
        JSON.stringify(preferences.userProfile)
      );
    }

    // Restore onboarding status
    if (preferences.onboardingCompleted) {
      localStorage.setItem("onboardingCompleted", "true");
    }
  }

  static async clearLocalStorageAfterSync(): Promise<void> {
    const keysToRemove = [
      "saksham_search_history",
      "recentlyViewed",
      "wishlist",
      "userProfile",
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  static async loadUserDataFromFirebase(userId: string): Promise<void> {
    try {
      const preferences = await UserPreferencesService.getUserPreferences(
        userId
      );
      this.restoreAllData(preferences);
    } catch (error) {
      console.error("❌ Error loading user data from Firebase:", error);
    }
  }
}

export default DataSyncService;
