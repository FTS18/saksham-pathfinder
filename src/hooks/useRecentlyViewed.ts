import { useState, useEffect } from 'react';

interface RecentlyViewedItem {
  id: string;
  title: string;
  company: string;
  viewedAt: string;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse recently viewed data:', error);
      }
    }
  }, []);

  const addToRecentlyViewed = (internship: any) => {
    const item: RecentlyViewedItem = {
      id: internship.id,
      title: internship.title,
      company: internship.company,
      viewedAt: new Date().toISOString()
    };

    setRecentlyViewed(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
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