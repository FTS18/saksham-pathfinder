import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useTimeTracking = () => {
  const { currentUser } = useAuth();
  const startTimeRef = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    startTimeRef.current = Date.now();

    // Update points every 30 minutes (1800000 ms)
    intervalRef.current = setInterval(async () => {
      try {
        const docRef = doc(db, 'profiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const currentData = docSnap.data();
          const newPoints = (currentData.points || 0) + 100;
          
          await updateDoc(docRef, {
            points: newPoints,
            lastActiveTime: new Date().toISOString()
          });
        } else {
          // Create initial profile
          await setDoc(docRef, {
            points: 100,
            lastActiveTime: new Date().toISOString(),
            username: currentUser.displayName || 'User',
            email: currentUser.email
          });
        }
      } catch (error) {
        console.error('Error updating time-based points:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUser]);

  // Track session end
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!currentUser) return;
      
      const sessionTime = Date.now() - startTimeRef.current;
      const minutesSpent = Math.floor(sessionTime / (1000 * 60));
      
      if (minutesSpent >= 5) { // Only track if spent at least 5 minutes
        try {
          const docRef = doc(db, 'profiles', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const currentData = docSnap.data();
            await updateDoc(docRef, {
              totalTimeSpent: (currentData.totalTimeSpent || 0) + minutesSpent,
              lastSessionTime: minutesSpent,
              lastActiveTime: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error('Error saving session time:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentUser]);
};