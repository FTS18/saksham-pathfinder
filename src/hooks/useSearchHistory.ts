import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserPreferencesService from '@/services/userPreferencesService';

const SEARCH_HISTORY_KEY = 'saksham_search_history';
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadHistory = async () => {
      if (currentUser) {
        try {
          // Sync localStorage to Firebase first
          await UserPreferencesService.syncLocalToFirebase(currentUser.uid);
          const preferences = await UserPreferencesService.getUserPreferences(currentUser.uid);
          const historyQueries = preferences.searchHistory.map(item => item.query);
          setSearchHistory(historyQueries);
        } catch (error) {
          console.error('Error loading search history:', error);
          const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
          if (saved) {
            setSearchHistory(JSON.parse(saved));
          }
        }
      } else {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (saved) {
          setSearchHistory(JSON.parse(saved));
        }
      }
    };

    loadHistory();
  }, [currentUser]);

  const addToHistory = async (query: string) => {
    if (!query.trim()) return;
    
    if (currentUser) {
      try {
        await UserPreferencesService.addToSearchHistory(currentUser.uid, query.trim());
        const preferences = await UserPreferencesService.getUserPreferences(currentUser.uid);
        const historyQueries = preferences.searchHistory.map(item => item.query);
        setSearchHistory(historyQueries);
      } catch (error) {
        console.error('Error adding to search history:', error);
        const newHistory = [
          query,
          ...searchHistory.filter(item => item !== query)
        ].slice(0, MAX_HISTORY_ITEMS);
        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      }
    } else {
      const newHistory = [
        query,
        ...searchHistory.filter(item => item !== query)
      ].slice(0, MAX_HISTORY_ITEMS);
      setSearchHistory(newHistory);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    }
  };

  const removeFromHistory = async (query: string) => {
    if (currentUser) {
      try {
        await UserPreferencesService.removeFromSearchHistory(currentUser.uid, query);
        const preferences = await UserPreferencesService.getUserPreferences(currentUser.uid);
        const historyQueries = preferences.searchHistory.map(item => item.query);
        setSearchHistory(historyQueries);
      } catch (error) {
        console.error('Error removing from search history:', error);
        const newHistory = searchHistory.filter(item => item !== query);
        setSearchHistory(newHistory);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      }
    } else {
      const newHistory = searchHistory.filter(item => item !== query);
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
        console.error('Error clearing search history:', error);
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
    clearHistory
  };
};