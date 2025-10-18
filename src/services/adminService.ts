import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

class AdminService {
  /**
   * Check if user is admin (email or admins collection)
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) return false;
      
      // Check if email is admin email
      if (currentUser.email === 'spacify1807@gmail.com') {
        return true;
      }
      
      // Check admins collection
      const adminDocRef = doc(db, 'admins', userId);
      const adminDoc = await getDoc(adminDocRef);
      
      return adminDoc.exists();
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Add user as admin
   */
  static async addAdmin(userId: string, email: string): Promise<void> {
    try {
      const adminDocRef = doc(db, 'admins', userId);
      await setDoc(adminDocRef, {
        userId,
        email,
        createdAt: new Date().toISOString(),
        role: 'admin'
      });
    } catch (error) {
      console.error('Error adding admin:', error);
      throw error;
    }
  }

  /**
   * Remove admin status
   */
  static async removeAdmin(userId: string): Promise<void> {
    try {
      const adminDocRef = doc(db, 'admins', userId);
      await setDoc(adminDocRef, { deletedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error removing admin:', error);
      throw error;
    }
  }
}

export default AdminService;
