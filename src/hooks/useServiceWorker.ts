import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(() => {
            console.log('Service Worker registered successfully');
          })
          .catch(() => {
            console.warn('Service Worker registration failed');
          });
      });
    }
  }, []);
};