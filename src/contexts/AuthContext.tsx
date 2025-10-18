import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generateUniqueUserId } from '@/lib/userIdGenerator';
import { useNavigate } from 'react-router-dom';
import DataSyncService from '@/services/dataSyncService';

interface AuthContextType {
  currentUser: User | null;
  userType: 'student' | 'recruiter' | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, userType?: 'student' | 'recruiter') => Promise<void>;
  loginWithGoogle: (userType?: 'student' | 'recruiter') => Promise<void>;
  loginAsRecruiter: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserPassword: (newPassword: string, currentPassword?: string) => Promise<void>;
  deleteUserAccount: (currentPassword?: string) => Promise<void>;
  reauthenticateUser: (currentPassword?: string) => Promise<void>;
  loading: boolean;
  needsOnboarding: boolean;
  needsEmailVerification: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [userType, setUserType] = useState<'student' | 'recruiter' | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user exists in students collection
    try {
      const docRef = doc(db, 'profiles', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Check if they're a recruiter trying to login as student
        const recruiterRef = doc(db, 'recruiters', result.user.uid);
        const recruiterSnap = await getDoc(recruiterRef);
        
        if (recruiterSnap.exists()) {
          await signOut(auth);
          throw new Error('Recruiter account detected. Please use the Recruiter login tab.');
        }
        
        // New user, will be handled by onboarding
        setUserType('student');
      } else {
        setUserType('student');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Recruiter account detected')) {
        throw error;
      }
      // Continue with normal flow for other errors
      setUserType('student');
    }
  };

  const register = async (email: string, password: string, name: string, userType: 'student' | 'recruiter' = 'student') => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Generate unique user ID and create initial profile
    const uniqueUserId = generateUniqueUserId();
    try {
      const collection = userType === 'recruiter' ? 'recruiters' : 'profiles';
      const docRef = doc(db, collection, user.uid);
      await setDoc(docRef, {
        uniqueUserId,
        email: user.email,
        displayName: name,
        userType,
        // Theme and preferences - for students only
        ...(userType === 'student' && {
          theme: localStorage.getItem('theme') || 'dark',
          colorTheme: localStorage.getItem('colorTheme') || 'blue',
          language: localStorage.getItem('language') || 'en',
          fontSize: parseInt(localStorage.getItem('fontSize') || '16'),
          searchHistory: [],
          recentlyViewed: [],
          wishlist: []
        }),
        createdAt: new Date().toISOString(),
        onboardingCompleted: false,
        emailVerified: false
      }, { merge: true });
    } catch (error) {
      console.error('Error creating initial profile:', error);
    }
    
    setUserType(userType);
    setNeedsEmailVerification(true);
  };

  const loginWithGoogle = async (userType: 'student' | 'recruiter' = 'student') => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user exists, if not create profile with unique ID
    try {
      const collection = userType === 'recruiter' ? 'recruiters' : 'profiles';
      const docRef = doc(db, collection, result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // New Google user - create profile and set onboarding to false
        const uniqueUserId = generateUniqueUserId();
        await setDoc(docRef, {
          uniqueUserId,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          userType,
          // Theme and preferences - for students only
          ...(userType === 'student' && {
            theme: localStorage.getItem('theme') || 'dark',
            colorTheme: localStorage.getItem('colorTheme') || 'blue',
            language: localStorage.getItem('language') || 'en',
            fontSize: parseInt(localStorage.getItem('fontSize') || '16'),
            searchHistory: [],
            recentlyViewed: [],
            wishlist: []
          }),
          createdAt: new Date().toISOString(),
          onboardingCompleted: false,
          emailVerified: true // Google accounts are pre-verified
        }, { merge: true });
        
        setUserType(userType);
        // Force onboarding for new Google users
        setNeedsOnboarding(true);
        return;
      } else {
        setUserType(docSnap.data()?.userType || 'student');
      }
    } catch (error) {
      console.error('Error creating Google user profile:', error);
    }
    
    await checkOnboardingStatus(result.user, userType);
  };

  const loginAsRecruiter = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user is admin or exists in recruiters collection
    try {
      // Allow admin account - check email directly
      if (email === 'spacify1807@gmail.com') {
        setUserType('recruiter');
        // Admin doesn't need onboarding
        setNeedsOnboarding(false);
        localStorage.setItem('onboardingCompleted', 'true');
        return;
      }
      
      // Check recruiters collection
      const docRef = doc(db, 'recruiters', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // User is not a recruiter, show message and logout
        await signOut(auth);
        throw new Error('Account not found in recruiter database. Please register as a recruiter first or login as a student.');
      }
      
      // User is a recruiter - check onboarding status
      await checkOnboardingStatus(result.user, 'recruiter');
    } catch (error) {
      await signOut(auth);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const reauthenticateUser = async (currentPassword?: string) => {
    if (!currentUser) throw new Error('No user logged in');
    
    // Check if user signed in with Google
    const isGoogleUser = currentUser.providerData.some(provider => provider.providerId === 'google.com');
    
    if (isGoogleUser) {
      // Reauthenticate with Google
      const provider = new GoogleAuthProvider();
      await reauthenticateWithCredential(currentUser, GoogleAuthProvider.credential());
    } else {
      // Reauthenticate with email/password
      if (!currentPassword) {
        throw new Error('Current password required for email/password users');
      }
      if (!currentUser.email) {
        throw new Error('User email not found');
      }
      
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
    }
  };

  const updateUserPassword = async (newPassword: string, currentPassword?: string) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      // Try to update password directly first
      await updatePassword(currentUser, newPassword);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        // Reauthenticate and try again
        await reauthenticateUser(currentPassword);
        await updatePassword(currentUser, newPassword);
      } else {
        throw error;
      }
    }
  };

  const deleteUserAccount = async (currentPassword?: string) => {
    if (!currentUser) throw new Error('No user logged in');
    
    try {
      // Try to delete account directly first
      await deleteUser(currentUser);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        // Reauthenticate and try again
        await reauthenticateUser(currentPassword);
        await deleteUser(currentUser);
      } else {
        throw error;
      }
    }
  };

  const checkOnboardingStatus = async (user: User, type?: 'student' | 'recruiter') => {
    try {
      // Check localStorage first for immediate response
      const localOnboarding = localStorage.getItem('onboardingCompleted');
      if (localOnboarding === 'true') {
        setNeedsOnboarding(false);
        return;
      }
      
      // Determine user type: check admin, then recruiters, then profiles
      let currentUserType: 'student' | 'recruiter' = type || 'student';
      
      // Check if admin
      if (user.email === 'spacify1807@gmail.com') {
        currentUserType = 'recruiter';
        setUserType('recruiter');
        setNeedsOnboarding(false);
        return;
      }
      
      // Try recruiters collection
      let docRef = doc(db, 'recruiters', user.uid);
      let docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        currentUserType = 'recruiter';
        const data = docSnap.data();
        const completed = data?.onboardingCompleted || false;
        
        setUserType('recruiter');
        setNeedsOnboarding(!completed);
        
        if (completed) {
          localStorage.setItem('onboardingCompleted', 'true');
        }
        return;
      }
      
      // Try profiles collection (student)
      docRef = doc(db, 'profiles', user.uid);
      docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        currentUserType = data?.userType || 'student';
        const completed = data?.onboardingCompleted || false;
        
        setUserType(currentUserType);
        setNeedsOnboarding(!completed);
        
        if (completed) {
          localStorage.setItem('onboardingCompleted', 'true');
        }
        return;
      }
      
      // Default to student for new users
      setUserType('student');
      setNeedsOnboarding(true);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(true);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          // Load all user data from Firebase (theme, wishlist, profile, etc.)
          await DataSyncService.loadUserDataFromFirebase(user.uid);
          
          // Then sync any new local changes to Firebase
          await DataSyncService.syncAllUserData(user.uid);
          
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
          setUserType(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setNeedsOnboarding(false);
        setNeedsEmailVerification(false);
      } finally {
        setLoading(false);
      }
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
    userType,
    login,
    register,
    loginWithGoogle,
    loginAsRecruiter,
    logout,
    updateUserPassword,
    deleteUserAccount,
    reauthenticateUser,
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