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
    // Check for admin login
    if (email === 'admin@gmail.com' && password === '123456') {
      // Create a mock admin user
      const adminUser = {
        uid: 'admin-user',
        email: 'admin@gmail.com',
        displayName: 'Admin User',
        emailVerified: true
      } as User;
      setCurrentUser(adminUser);
      setUserType('recruiter');
      return;
    }
    
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
    // Check for admin login
    if (email === 'admin@gmail.com' && password === '123456') {
      // Create a mock admin user
      const adminUser = {
        uid: 'admin-user',
        email: 'admin@gmail.com',
        displayName: 'Admin User',
        emailVerified: true
      } as User;
      setCurrentUser(adminUser);
      setUserType('recruiter');
      return;
    }
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if user exists in recruiters collection
    try {
      const docRef = doc(db, 'recruiters', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // User is not a recruiter, show message and logout
        await signOut(auth);
        throw new Error('Account not found in recruiter database. Please register as a recruiter first or login as a student.');
      }
      
      setUserType('recruiter');
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
      
      // Try both collections to determine user type
      let docRef = doc(db, 'profiles', user.uid);
      let docSnap = await getDoc(docRef);
      let currentUserType: 'student' | 'recruiter' = 'student';
      
      if (!docSnap.exists()) {
        docRef = doc(db, 'recruiters', user.uid);
        docSnap = await getDoc(docRef);
        currentUserType = 'recruiter';
      }
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        currentUserType = data?.userType || currentUserType;
        const completed = data?.onboardingCompleted || false;
        
        setUserType(currentUserType);
        setNeedsOnboarding(!completed);
        
        // Update localStorage to match Firebase
        if (completed) {
          localStorage.setItem('onboardingCompleted', 'true');
        }
      } else {
        setUserType(type || 'student');
        setNeedsOnboarding(true);
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