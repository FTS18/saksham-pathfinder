import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const OnboardingRedirect = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, needsOnboarding, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && currentUser && needsOnboarding) {
      // Don't redirect if already on onboarding page
      if (location.pathname !== '/onboarding') {
        navigate('/onboarding');
      }
    }
  }, [currentUser, needsOnboarding, loading, navigate, location.pathname]);

  // Show loading or redirect to onboarding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};