import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserPreferencesService from "@/services/userPreferencesService";

const SEARCH_HISTORY_KEY = "saksham_search_history";
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Clean up corrupted localStorage data on mount
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Check if any items are objects (corrupted data)
          const hasCorruptedData = parsed.some(
            (item) => typeof item === "object" && item !== null
          );
          if (hasCorruptedData) {
            // Extract all query strings and save clean data
            const cleanedHistory = parsed
              .map((item: any) => {
                if (typeof item === "string") return item;
                if (typeof item === "object" && item.query) return item.query;
                return "";
              })
              .filter(Boolean)
              .slice(0, MAX_HISTORY_ITEMS);
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(cleanedHistory));
          }
        }
      } catch {
        // If parse fails, clear the corrupted data
        localStorage.removeItem(SEARCH_HISTORY_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (currentUser) {
        try {
          // Sync localStorage to Firebase first
          await UserPreferencesService.syncLocalToFirebase(currentUser.uid);
          const preferences = await UserPreferencesService.getUserPreferences(
            currentUser.uid
          );
          if (
            preferences?.searchHistory &&
            Array.isArray(preferences.searchHistory)
          ) {
            const historyQueries = preferences.searchHistory
              .map((item: any) => {
                if (typeof item === "string") return item;
                if (typeof item === "object" && item.query) return item.query;
                return "";
              })
              .filter(Boolean);
            setSearchHistory(historyQueries);
          } else {
            setSearchHistory([]);
          }
        } catch (error) {
          console.error("Error loading search history:", error);
          const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                // Extract strings from potential mixed array of strings and objects
                const historyQueries = parsed
                  .map((item: any) => {
                    if (typeof item === "string") return item;
                    if (typeof item === "object" && item.query) return item.query;
                    return "";
                  })
                  .filter(Boolean);
                setSearchHistory(historyQueries);
              } else {
                setSearchHistory([]);
              }
            } catch {
              setSearchHistory([]);
            }
          }
        }
      } else {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              // Extract strings from potential mixed array of strings and objects
              const historyQueries = parsed
                .map((item: any) => {
                  if (typeof item === "string") return item;
                  if (typeof item === "object" && item.query) return item.query;
                  return "";
                })
                .filter(Boolean);
              setSearchHistory(historyQueries);
            } else {
              setSearchHistory([]);
            }
          } catch {
            setSearchHistory([]);
          }
        }
      }
    };

    loadHistory();
  }, [currentUser]);

  const addToHistory = async (query: string) => {
    if (!query.trim()) return;

    if (currentUser) {
      try {
        await UserPreferencesService.addToSearchHistory(
          currentUser.uid,
          query.trim()
        );
        const preferences = await UserPreferencesService.getUserPreferences(
          currentUser.uid
        );
        if (
          preferences?.searchHistory &&
          Array.isArray(preferences.searchHistory)
        ) {
          const historyQueries = preferences.searchHistory
            .map((item: any) => {
              if (typeof item === "string") return item;
              if (typeof item === "object" && item.query) return item.query;
              return "";
            })
            .filter(Boolean);
          setSearchHistory(historyQueries);
        } else {
          setSearchHistory([query]);
        }
      } catch (error) {
        console.error("Error adding to search history:", error);
        const newHistory = [
          query,
          ...searchHistory.filter((item) => item !== query),
        ].slice(0, MAX_HISTORY_ITEMS);
        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      }
    } else {
      const newHistory = [
        query,
        ...searchHistory.filter((item) => item !== query),
      ].slice(0, MAX_HISTORY_ITEMS);
      setSearchHistory(newHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    }
  };

  const removeFromHistory = async (query: string) => {
    if (currentUser) {
      try {
        await UserPreferencesService.removeFromSearchHistory(
          currentUser.uid,
          query
        );
        const preferences = await UserPreferencesService.getUserPreferences(
          currentUser.uid
        );
        if (
          preferences?.searchHistory &&
          Array.isArray(preferences.searchHistory)
        ) {
          const historyQueries = preferences.searchHistory
            .map((item: any) => {
              if (typeof item === "string") return item;
              if (typeof item === "object" && item.query) return item.query;
              return "";
            })
            .filter(Boolean);
          setSearchHistory(historyQueries);
        } else {
          setSearchHistory([]);
        }
      } catch (error) {
        console.error("Error removing from search history:", error);
        const newHistory = searchHistory.filter((item) => item !== query);
        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      }
    } else {
      const newHistory = searchHistory.filter((item) => item !== query);
      setSearchHistory(newHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    }
  };

  const clearHistory = async () => {
    if (currentUser) {
      try {
        await UserPreferencesService.clearSearchHistory(currentUser.uid);
        setSearchHistory([]);
      } catch (error) {
        console.error("Error clearing search history:", error);
        setSearchHistory([]);
        localStorage.removeItem(SEARCH_HISTORY_KEY);
      }
    } else {
      setSearchHistory([]);
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    }
  };

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};
