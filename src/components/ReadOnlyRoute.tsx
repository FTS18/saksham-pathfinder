import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ReadOnlyRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

/**
 * Route component that allows both authenticated and unauthenticated users
 * Unauthenticated users can view but cannot perform actions that require login
 * (like wishlist, applications, etc.)
 */
export const ReadOnlyRoute = ({ children, fallbackPath = '/login' }: ReadOnlyRouteProps) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow both authenticated and unauthenticated users
  // Components should handle auth checks internally
  return <>{children}</>;
};
