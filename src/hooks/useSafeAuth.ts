import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useSafeAuth = () => {
  try {
    const context = useContext(AuthContext);
    return context || { user: null };
  } catch {
    return { user: null };
  }
};