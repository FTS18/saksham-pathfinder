import React from 'react';
import { useRouteTransition } from '@/contexts/RouteTransitionContext';
import { LoadingSpinner } from './LoadingSpinner';
import './RouteLoadingOverlay.css';

export const RouteLoadingOverlay: React.FC = () => {
  const { isLoading } = useRouteTransition();

  return (
    <>
      {isLoading && (
        <div className="route-loading-overlay">
          <div className="route-loading-content">
            <div className="route-loading-spinner-wrapper">
              <LoadingSpinner />
            </div>
            <p className="route-loading-text">Loading...</p>
          </div>
        </div>
      )}
    </>
  );
};
