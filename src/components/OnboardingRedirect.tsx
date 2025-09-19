import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const OnboardingRedirect = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, needsOnboarding, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!loading && currentUser && needsOnboarding && !hasRedirected) {
      const excludedPaths = ['/onboarding', '/login', '/register'];
      if (!excludedPaths.includes(location.pathname)) {
        setHasRedirected(true);
        navigate('/onboarding', { replace: true });
      }
    }
  }, [currentUser, needsOnboarding, loading, navigate, location.pathname, hasRedirected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentUser && needsOnboarding && location.pathname !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};