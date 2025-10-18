import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteTransitionContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentPath: string;
}

const RouteTransitionContext = createContext<RouteTransitionContextType | undefined>(undefined);

export const RouteTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // Auto show loading on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (location.pathname !== currentPath) {
        setIsLoading(true);
        setCurrentPath(location.pathname);
        
        // Auto hide loading after content renders
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    };

    handleRouteChange();
  }, [location.pathname, currentPath]);

  return (
    <RouteTransitionContext.Provider value={{ isLoading, setIsLoading, currentPath }}>
      {children}
    </RouteTransitionContext.Provider>
  );
};

export const useRouteTransition = () => {
  const context = useContext(RouteTransitionContext);
  if (context === undefined) {
    throw new Error('useRouteTransition must be used within a RouteTransitionProvider');
  }
  return context;
};
