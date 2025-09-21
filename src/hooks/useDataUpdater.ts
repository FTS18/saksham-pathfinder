import { useState, useEffect } from 'react';

export const useDataUpdater = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const updateNow = async () => {
    setIsUpdating(true);
    // Simulate AI update process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastUpdate(new Date());
    setUpdateCount(prev => prev + 1);
    setIsUpdating(false);
  };

  useEffect(() => {
    // Auto-update every 30 minutes
    const interval = setInterval(() => {
      updateNow();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isUpdating,
    lastUpdate,
    updateCount,
    updateNow
  };
};