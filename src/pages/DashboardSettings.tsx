import { Settings } from '../components/Settings';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function DashboardSettings() {
  const { currentUser } = useAuth();
  const [dashboardProfile, setDashboardProfile] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      loadDashboardProfile();
    }
  }, [currentUser]);

  const loadDashboardProfile = async () => {
    if (!currentUser) return;
    
    try {
      const docRef = doc(db, 'profiles', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setDashboardProfile(docSnap.data());
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <Settings 
          dashboardProfile={dashboardProfile} 
          onProfileUpdate={(profile) => {
            setDashboardProfile(profile);
            loadDashboardProfile();
          }}
        />
      </div>
    </div>
  );
}