import { useState, useEffect } from 'react';
import { DataUpdater } from '../services/dataUpdater';

export const useDataUpdater = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);

  const updater = new DataUpdater();

  // Manual update trigger
  const updateNow = async () => {
    setIsUpdating(true);
    try {
      const result = await updater.updateInternshipData();
      setLastUpdate(new Date());
      setUpdateCount(result.length);
      return result;
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-update on component mount
  useEffect(() => {
    // Check if data is stale (older than 24 hours)
    const lastUpdateTime = localStorage.getItem('lastDataUpdate');
    const now = new Date().getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (!lastUpdateTime || (now - parseInt(lastUpdateTime)) > dayInMs) {
      updateNow().then(() => {
        localStorage.setItem('lastDataUpdate', now.toString());
      });
    }

    // Set up periodic updates (every 6 hours)
    const interval = setInterval(() => {
      updateNow().then(() => {
        localStorage.setItem('lastDataUpdate', Date.now().toString());
      });
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isUpdating,
    lastUpdate,
    updateCount,
    updateNow
  };
};