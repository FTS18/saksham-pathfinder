import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useSafeAuth = () => {
  try {
    const context = useContext(AuthContext);
    return context || { currentUser: null, userType: null, loading: false, needsOnboarding: false, needsEmailVerification: false };
  } catch {
    return { currentUser: null, userType: null, loading: false, needsOnboarding: false, needsEmailVerification: false };
  }
};