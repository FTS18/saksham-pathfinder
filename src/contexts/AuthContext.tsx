import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  needsOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    setNeedsOnboarding(true);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await checkOnboardingStatus(result.user);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const checkOnboardingStatus = async (user: User) => {
    try {
      // Check localStorage first for immediate response
      const localOnboarding = localStorage.getItem('onboardingCompleted');
      if (localOnboarding === 'true') {
        setNeedsOnboarding(false);
        return;
      }
      
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      const completed = data?.onboardingCompleted || false;
      
      setNeedsOnboarding(!completed);
      
      // Update localStorage to match Firebase
      if (completed) {
        localStorage.setItem('onboardingCompleted', 'true');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await checkOnboardingStatus(user);
      } else {
        setNeedsOnboarding(false);
      }
      setLoading(false);
    });

    // Listen for onboarding completion
    const handleOnboardingCompleted = () => {
      setNeedsOnboarding(false);
    };
    
    window.addEventListener('onboardingCompleted', handleOnboardingCompleted);

    return () => {
      unsubscribe();
      window.removeEventListener('onboardingCompleted', handleOnboardingCompleted);
    };
  }, []);

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    loading,
    needsOnboarding
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};