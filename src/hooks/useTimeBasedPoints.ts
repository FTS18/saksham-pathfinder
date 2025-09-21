import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useTimeBasedPoints = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const trackTime = async () => {
      try {
        const profileRef = doc(db, 'profiles', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          const now = Date.now();
          const lastActive = data.lastActive || now;
          const timeSpent = data.timeSpent || 0;
          const points = data.points || 0;
          
          // Award 100 points every 30 minutes (1800000 ms)
          const newTimeSpent = timeSpent + (now - lastActive);
          const pointsToAdd = Math.floor(newTimeSpent / 1800000) * 100;
          
          if (pointsToAdd > 0) {
            await updateDoc(profileRef, {
              points: points + pointsToAdd,
              timeSpent: newTimeSpent % 1800000, // Reset counter
              lastActive: now
            });
          } else {
            await updateDoc(profileRef, {
              timeSpent: newTimeSpent,
              lastActive: now
            });
          }
        } else {
          // Create initial profile
          await setDoc(profileRef, {
            username: currentUser.displayName || 'User',
            email: currentUser.email,
            points: 0,
            referrals: 0,
            timeSpent: 0,
            lastActive: Date.now(),
            referralCode: generateReferralCode()
          });
        }
      } catch (error) {
        console.error('Error tracking time:', error);
      }
    };

    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Track time every minute
    const interval = setInterval(trackTime, 60000);
    
    // Track on mount
    trackTime();

    return () => clearInterval(interval);
  }, [currentUser]);
};

export default useTimeBasedPoints;