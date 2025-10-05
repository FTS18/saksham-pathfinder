import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface OnboardingRouterProps {
  children: React.ReactNode;
}

export const OnboardingRouter = ({ children }: OnboardingRouterProps) => {
  const { currentUser, userType, needsOnboarding, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/about', '/news-events', '/tutorials', '/login', '/register', '/search', '/admin-demo'];
    const isPublicPath = publicPaths.some(path => currentPath === path) || 
                        currentPath.startsWith('/profiles/') || 
                        currentPath.startsWith('/u/') || 
                        currentPath.startsWith('/company/') || 
                        currentPath.startsWith('/skill/') || 
                        currentPath.startsWith('/sector/') || 
                        currentPath.startsWith('/city/') || 
                        currentPath.startsWith('/title/');

    // Don't redirect if on public paths
    if (isPublicPath) {
      return;
    }

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (needsOnboarding) {
      if (userType === 'recruiter') {
        navigate('/recruiter/onboarding');
      } else {
        navigate('/onboarding');
      }
      return;
    }

    // If user is completed and on wrong dashboard, redirect
    if (currentUser && !needsOnboarding) {
      if (userType === 'recruiter' && !currentPath.startsWith('/recruiter')) {
        navigate('/recruiter/dashboard');
      } else if (userType === 'student' && currentPath.startsWith('/recruiter')) {
        navigate('/dashboard');
      }
    }
  }, [currentUser, userType, needsOnboarding, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};