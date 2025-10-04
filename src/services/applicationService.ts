import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export interface Application {
  id?: string;
  userId: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: any;
  updatedAt: any;
  coverLetter?: string;
  resumeUrl?: string;
}

export const ApplicationService = {
  async applyToInternship(application: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'applications'), {
        ...application,
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error applying to internship:', error);
      throw error;
    }
  },

  async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const q = query(collection(db, 'applications'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
    } catch (error) {
      console.error('Error getting applications:', error);
      return [];
    }
  },

  async updateApplicationStatus(applicationId: string, status: Application['status']) {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  async withdrawApplication(applicationId: string) {
    return this.updateApplicationStatus(applicationId, 'withdrawn');
  }
};