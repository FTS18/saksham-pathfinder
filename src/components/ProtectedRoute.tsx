import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'student' | 'recruiter';
}

export const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  const { currentUser, userType, loading } = useAuth();

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

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check user type if specified
  if (requiredUserType && userType !== requiredUserType) {
    const redirectPath = userType === 'recruiter' ? '/recruiter/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};