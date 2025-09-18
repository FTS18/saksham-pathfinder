import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generate random username
export const generateUsername = (): string => {
  const adjectives = ['Cool', 'Smart', 'Quick', 'Bright', 'Swift', 'Bold', 'Sharp', 'Fast', 'Wise', 'Strong'];
  const nouns = ['Coder', 'Dev', 'Tech', 'Pro', 'Ace', 'Star', 'Hero', 'Ninja', 'Guru', 'Master'];
  const numbers = Math.floor(Math.random() * 9999) + 1000;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}`;
};

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const q = query(collection(db, 'usernames'), where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

// Reserve username for user
export const reserveUsername = async (username: string, userId: string): Promise<boolean> => {
  try {
    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) return false;
    
    await setDoc(doc(db, 'usernames', username.toLowerCase()), {
      username: username.toLowerCase(),
      userId,
      createdAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error reserving username:', error);
    return false;
  }
};

// Generate unique username
export const generateUniqueUsername = async (): Promise<string> => {
  let attempts = 0;
  while (attempts < 10) {
    const username = generateUsername();
    const isAvailable = await checkUsernameAvailability(username);
    if (isAvailable) {
      return username;
    }
    attempts++;
  }
  
  // Fallback with timestamp
  return `User${Date.now()}`;
};

// Get user ID by username
export const getUserIdByUsername = async (username: string): Promise<string | null> => {
  try {
    const q = query(collection(db, 'usernames'), where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data().userId;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user by username:', error);
    return null;
  }
};