import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import UserPreferencesService from '@/services/userPreferencesService';

interface RecentlyViewedItem {
  id: string;
  title: string;
  company: string;
  viewedAt: string;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      if (currentUser) {
        try {
          await UserPreferencesService.syncLocalToFirebase(currentUser.uid);
          const preferences = await UserPreferencesService.getUserPreferences(currentUser.uid);
          const viewedItems = preferences.recentlyViewed.map(item => ({
            id: item.id,
            title: item.title,
            company: item.company,
            viewedAt: item.timestamp.toDate().toISOString()
          }));
          setRecentlyViewed(viewedItems);
        } catch (error) {
          console.error('Error loading recently viewed:', error);
          const stored = localStorage.getItem('recentlyViewed');
          if (stored) {
            try {
              setRecentlyViewed(JSON.parse(stored));
            } catch (error) {
              console.warn('Failed to parse recently viewed data:', error);
            }
          }
        }
      } else {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
          try {
            setRecentlyViewed(JSON.parse(stored));
          } catch (error) {
            console.warn('Failed to parse recently viewed data:', error);
          }
        }
      }
    };

    loadRecentlyViewed();
  }, [currentUser]);

  const addToRecentlyViewed = async (internship: any) => {
    const item: RecentlyViewedItem = {
      id: internship.id,
      title: internship.title,
      company: internship.company,
      viewedAt: new Date().toISOString()
    };

    if (currentUser) {
      try {
        await UserPreferencesService.addToRecentlyViewed(currentUser.uid, {
          id: internship.id,
          title: internship.title,
          company: internship.company
        });
        const preferences = await UserPreferencesService.getUserPreferences(currentUser.uid);
        const viewedItems = preferences.recentlyViewed.map(item => ({
          id: item.id,
          title: item.title,
          company: item.company,
          viewedAt: item.timestamp.toDate().toISOString()
        }));
        setRecentlyViewed(viewedItems);
      } catch (error) {
        console.error('Error adding to recently viewed:', error);
        setRecentlyViewed(prev => {
          const filtered = prev.filter(i => i.id !== item.id);
          const updated = [item, ...filtered].slice(0, 10);
          localStorage.setItem('recentlyViewed', JSON.stringify(updated));
          return updated;
        });
      }
    } else {
      setRecentlyViewed(prev => {
        const filtered = prev.filter(i => i.id !== item.id);
        const updated = [item, ...filtered].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  };
};