import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt?: Date;
}

interface GamificationData {
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  weeklyChallenge?: {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: number;
    reward: number;
    expiresAt: Date;
  };
}

interface GamificationContextType {
  data: GamificationData;
  addPoints: (points: number, reason: string) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  loading: boolean;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const ACHIEVEMENTS: Achievement[] = [
  { id: 'profile_complete', title: 'Profile Master', description: 'Complete your profile', icon: '👤', points: 50 },
  { id: 'first_application', title: 'First Step', description: 'Apply to your first internship', icon: '📝', points: 25 },
  { id: 'five_applications', title: 'Go Getter', description: 'Apply to 5 internships', icon: '🎯', points: 100 },
  { id: 'first_referral', title: 'Team Player', description: 'Refer your first friend', icon: '🤝', points: 100 },
  { id: 'skill_master', title: 'Skill Collector', description: 'Add 10+ skills to profile', icon: '⭐', points: 75 },
];

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useAuth();
  const user = authContext?.user;
  const [data, setData] = useState<GamificationData>({
    totalPoints: 0,
    level: 1,
    achievements: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    } else {
      setData({ totalPoints: 0, level: 1, achievements: [] });
      setLoading(false);
    }
  }, [user]);

  const loadGamificationData = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'gamification', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data() as GamificationData;
        setData(userData);
      } else {
        // Initialize new user
        const initialData: GamificationData = {
          totalPoints: 0,
          level: 1,
          achievements: [],
        };
        await setDoc(docRef, initialData);
        setData(initialData);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (points: number, reason: string) => {
    if (!user) return;
    
    const newTotalPoints = data.totalPoints + points;
    const newLevel = Math.floor(newTotalPoints / 100) + 1;
    
    const updatedData = {
      ...data,
      totalPoints: newTotalPoints,
      level: newLevel,
    };
    
    setData(updatedData);
    
    try {
      const docRef = doc(db, 'gamification', user.uid);
      await updateDoc(docRef, updatedData);
      
      // Show toast notification
      console.log(`+${points} points for ${reason}!`);
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!user) return;
    
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement || data.achievements.some(a => a.id === achievementId)) return;
    
    const unlockedAchievement = {
      ...achievement,
      unlockedAt: new Date(),
    };
    
    const updatedData = {
      ...data,
      achievements: [...data.achievements, unlockedAchievement],
      totalPoints: data.totalPoints + achievement.points,
    };
    
    setData(updatedData);
    
    try {
      const docRef = doc(db, 'gamification', user.uid);
      await updateDoc(docRef, updatedData);
      
      console.log(`Achievement unlocked: ${achievement.title}! +${achievement.points} points`);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  try {
    return (
      <GamificationContext.Provider value={{ data, addPoints, unlockAchievement, loading }}>
        {children}
      </GamificationContext.Provider>
    );
  } catch (error) {
    console.error('GamificationProvider error:', error);
    return <>{children}</>;
  }
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};