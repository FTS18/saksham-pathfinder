import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn('Firebase configuration incomplete. Some features may not work.');
}

// Add localhost and local IP to authorized domains in Firebase Console:
// Go to Firebase Console > Authentication > Settings > Authorized domains
// Add: localhost, 127.0.0.1, and your local IP (172.31.69.90)

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connect to Firebase Emulator Suite for local development
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  console.log('🔥 Using Firebase Emulator Suite for local development');
  
  // Connect Firestore Emulator
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('✓ Firestore Emulator connected on localhost:8080');
  } catch (error) {
    // Already connected, ignore error
    if ((error as Error).message?.includes('duplicate app')) {
      // Ignore duplicate connection errors
    }
  }

  // Connect Auth Emulator
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    console.log('✓ Auth Emulator connected on localhost:9099');
  } catch (error) {
    // Already connected, ignore error
  }

  // Connect Storage Emulator
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('✓ Storage Emulator connected on localhost:9199');
  } catch (error) {
    // Already connected, ignore error
  }
}

// Set auth persistence to LOCAL (keeps user logged in across sessions)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

export default app;