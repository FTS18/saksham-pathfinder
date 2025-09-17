import { useState, useEffect, useMemo } from 'react';

interface UseInternshipsOptions {
  pageSize?: number;
  initialLoad?: number;
}

export const useInternships = ({ pageSize = 20, initialLoad = 10 }: UseInternshipsOptions = {}) => {
  const [allInternships, setAllInternships] = useState<any[]>([]);
  const [loadedCount, setLoadedCount] = useState(initialLoad);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load internships progressively
  useEffect(() => {
    const loadInternships = async () => {
      setLoading(true);
      try {
        const response = await fetch('/internships.json');
        const data = await response.json();
        setAllInternships(data);
      } catch (err) {
        setError('Failed to load internships');
        console.error('Failed to load internships:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, []);

  // Memoized visible internships
  const visibleInternships = useMemo(() => 
    allInternships.slice(0, loadedCount), 
    [allInternships, loadedCount]
  );

  const loadMore = () => {
    setLoadedCount(prev => Math.min(prev + pageSize, allInternships.length));
  };

  const hasMore = loadedCount < allInternships.length;

  return {
    allInternships,
    visibleInternships,
    loading,
    error,
    loadMore,
    hasMore,
    totalCount: allInternships.length,
    loadedCount
  };
};