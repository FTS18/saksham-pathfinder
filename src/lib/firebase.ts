import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNsLEbkPhxOj7d255npjF_9qJ6ddsH-HQ",
  authDomain: "saksham-ai-81c3a.firebaseapp.com",
  projectId: "saksham-ai-81c3a",
  storageBucket: "saksham-ai-81c3a.firebasestorage.app",
  messagingSenderId: "915586746274",
  appId: "1:915586746274:web:274b9bfc0a07961fd9d4fb",
  measurementId: "G-CTR1NLXF77"
};

// Add localhost and local IP to authorized domains in Firebase Console:
// Go to Firebase Console > Authentication > Settings > Authorized domains
// Add: localhost, 127.0.0.1, and your local IP (172.31.69.90)

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;