import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generateUniqueUserId } from '@/lib/userIdGenerator';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  needsOnboarding: boolean;
  needsEmailVerification: boolean;
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
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, name: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Generate unique user ID and create initial profile
    const uniqueUserId = generateUniqueUserId();
    try {
      const docRef = doc(db, 'profiles', user.uid);
      await setDoc(docRef, {
        uniqueUserId,
        email: user.email,
        displayName: name,
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
        emailVerified: false
      }, { merge: true });
    } catch (error) {
      console.error('Error creating initial profile:', error);
    }
    
    setNeedsEmailVerification(true);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user exists, if not create profile with unique ID
    try {
      const docRef = doc(db, 'profiles', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const uniqueUserId = generateUniqueUserId();
        await setDoc(docRef, {
          uniqueUserId,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: new Date().toISOString(),
          onboardingCompleted: false
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error creating Google user profile:', error);
    }
    
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
        // Check email verification first
        if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
          setNeedsEmailVerification(true);
          setNeedsOnboarding(false);
        } else {
          setNeedsEmailVerification(false);
          await checkOnboardingStatus(user);
        }
      } else {
        setNeedsOnboarding(false);
        setNeedsEmailVerification(false);
      }
      setLoading(false);
    });

    // Listen for onboarding completion
    const handleOnboardingCompleted = () => {
      setNeedsOnboarding(false);
    };
    
    const handleEmailVerified = () => {
      setNeedsEmailVerification(false);
    };
    
    window.addEventListener('onboardingCompleted', handleOnboardingCompleted);
    window.addEventListener('emailVerified', handleEmailVerified);

    return () => {
      unsubscribe();
      window.removeEventListener('onboardingCompleted', handleOnboardingCompleted);
      window.removeEventListener('emailVerified', handleEmailVerified);
    };
  }, []);

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    loading,
    needsOnboarding,
    needsEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};