import { db } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  location?: string;
  skills: string[];
  interests: string[];
  experience?: string;
  education?: string;
  portfolio?: string;
  linkedin?: string;
  github?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActive: Timestamp;
  isVerified: boolean;
  profileComplete: boolean;
  settings: {
    privacy: 'public' | 'private' | 'friends';
    notifications: boolean;
    emailUpdates: boolean;
  };
  stats: {
    profileViews: number;
    applicationsCount: number;
    wishlistCount: number;
  };
}

export class UserService {
  private static readonly USERNAMES_COLLECTION = 'usernames';
  private static readonly PROFILES_COLLECTION = 'profiles';

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const normalizedUsername = username.toLowerCase().trim();
      
      // Check reserved usernames
      const reserved = ['admin', 'api', 'www', 'mail', 'support', 'help', 'about', 'contact'];
      if (reserved.includes(normalizedUsername)) return false;

      const usernameDoc = await getDoc(doc(db, this.USERNAMES_COLLECTION, normalizedUsername));
      return !usernameDoc.exists();
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Reserve username for user (big tech level atomicity)
   */
  static async reserveUsername(uid: string, username: string, oldUsername?: string): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      const normalizedUsername = username.toLowerCase().trim();

      // Check availability first
      if (!(await this.isUsernameAvailable(normalizedUsername))) {
        return false;
      }

      // Reserve new username
      const usernameRef = doc(db, this.USERNAMES_COLLECTION, normalizedUsername);
      batch.set(usernameRef, {
        uid,
        reservedAt: serverTimestamp(),
        active: true
      });

      // Delete old username if exists
      if (oldUsername) {
        const oldUsernameRef = doc(db, this.USERNAMES_COLLECTION, oldUsername.toLowerCase());
        batch.delete(oldUsernameRef);
      }

      // Update user profile
      const profileRef = doc(db, this.PROFILES_COLLECTION, uid);
      batch.update(profileRef, {
        username: normalizedUsername,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error reserving username:', error);
      return false;
    }
  }

  /**
   * Create user profile with username
   */
  static async createProfile(userData: Partial<UserProfile>): Promise<boolean> {
    try {
      const { uid, username, email, displayName } = userData;
      if (!uid || !username || !email) return false;

      // Reserve username first
      const usernameReserved = await this.reserveUsername(uid, username);
      if (!usernameReserved) return false;

      const profileData: UserProfile = {
        uid,
        username: username.toLowerCase().trim(),
        email,
        displayName: displayName || '',
        skills: [],
        interests: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastActive: Timestamp.now(),
        isVerified: false,
        profileComplete: false,
        settings: {
          privacy: 'public',
          notifications: true,
          emailUpdates: true
        },
        stats: {
          profileViews: 0,
          applicationsCount: 0,
          wishlistCount: 0
        },
        ...userData
      };

      await setDoc(doc(db, this.PROFILES_COLLECTION, uid), profileData);
      return true;
    } catch (error) {
      console.error('Error creating profile:', error);
      return false;
    }
  }

  /**
   * Get user profile by UID
   */
  static async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const profileDoc = await getDoc(doc(db, this.PROFILES_COLLECTION, uid));
      if (!profileDoc.exists()) return null;

      // Update last active
      await updateDoc(doc(db, this.PROFILES_COLLECTION, uid), {
        lastActive: serverTimestamp()
      });

      return profileDoc.data() as UserProfile;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  /**
   * Get user profile by username
   */
  static async getProfileByUsername(username: string): Promise<UserProfile | null> {
    try {
      const normalizedUsername = username.toLowerCase().trim();
      
      // Get UID from username
      const usernameDoc = await getDoc(doc(db, this.USERNAMES_COLLECTION, normalizedUsername));
      if (!usernameDoc.exists()) return null;

      const { uid } = usernameDoc.data();
      return await this.getProfile(uid);
    } catch (error) {
      console.error('Error getting profile by username:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const profileRef = doc(db, this.PROFILES_COLLECTION, uid);
      
      // Handle username change
      if (updates.username) {
        const currentProfile = await this.getProfile(uid);
        if (!currentProfile) return false;

        const success = await this.reserveUsername(uid, updates.username, currentProfile.username);
        if (!success) return false;
      }

      await updateDoc(profileRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  /**
   * Delete user profile and cleanup
   */
  static async deleteProfile(uid: string): Promise<boolean> {
    try {
      const batch = writeBatch(db);
      
      // Get current profile
      const profile = await this.getProfile(uid);
      if (!profile) return false;

      // Delete username reservation
      const usernameRef = doc(db, this.USERNAMES_COLLECTION, profile.username);
      batch.delete(usernameRef);

      // Delete profile
      const profileRef = doc(db, this.PROFILES_COLLECTION, uid);
      batch.delete(profileRef);

      // Delete related data (applications, notifications, etc.)
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('candidateId', '==', uid)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      applicationsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', uid)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      notificationsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  /**
   * Increment profile stats
   */
  static async incrementStat(uid: string, stat: keyof UserProfile['stats']): Promise<void> {
    try {
      const profileRef = doc(db, this.PROFILES_COLLECTION, uid);
      const profile = await getDoc(profileRef);
      
      if (profile.exists()) {
        const currentStats = profile.data().stats || {};
        await updateDoc(profileRef, {
          [`stats.${stat}`]: (currentStats[stat] || 0) + 1,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error incrementing stat:', error);
    }
  }
}