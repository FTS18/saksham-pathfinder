import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const checkUsernameAvailability = async (username: string, currentUserId?: string): Promise<boolean> => {
  if (!username || username.length < 3) return false;
  
  try {
    // Check current user's profile first
    if (currentUserId) {
      const userDocRef = doc(db, 'profiles', currentUserId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().username === username) {
        return true; // User's own username is available
      }
    }
    
    const q = query(collection(db, 'profiles'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    // If Firebase fails, assume username is available for current user
    return true;
  }
};

export const reserveUsername = async (username: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'profiles', userId);
    await setDoc(docRef, { username }, { merge: true });
  } catch (error) {
    console.error('Error reserving username:', error);
    throw error;
  }
};

export const generateUniqueUsername = async (): Promise<string> => {
  const adjectives = ['cool', 'smart', 'bright', 'quick', 'sharp', 'clever', 'swift', 'bold'];
  const nouns = ['coder', 'dev', 'tech', 'pro', 'ace', 'star', 'ninja', 'guru'];
  
  for (let i = 0; i < 10; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999) + 1;
    const username = `${adj}${noun}${num}`;
    
    if (await checkUsernameAvailability(username)) {
      return username;
    }
  }
  
  // Fallback
  return `user${Date.now()}`;
};