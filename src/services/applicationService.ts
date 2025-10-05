import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export interface Application {
  id?: string;
  userId: string;
  internshipId: string;
  internshipTitle: string;
  companyName: string;
  status: 'pending' | 'applied' | 'in-review' | 'under_review' | 'shortlisted' | 'interview' | 'interview_scheduled' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: any;
  updatedAt: any;
  notes?: string;
  resumeURL?: string;
  coverLetter?: string;
  priority?: 'low' | 'medium' | 'high';
  source?: string;
  metadata?: any;
}

export class ApplicationService {
  private static readonly COLLECTION = 'applications';

  static async applyToInternship(application: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>): Promise<string> {
    return this.createApplication(application);
  }

  static async createApplication(application: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...application,
        status: application.status || 'pending',
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(applicationId: string, status: Application['status'], notes?: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, applicationId);
      await updateDoc(docRef, {
        status,
        notes: notes || '',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating application:', error);
      throw error;
    }
  }

  static async getUserApplications(userId: string): Promise<Application[]> {
    try {
      const q = query(collection(db, this.COLLECTION), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  static async getApplicationByInternship(userId: string, internshipId: string): Promise<Application | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('internshipId', '==', internshipId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Application;
    } catch (error) {
      console.error('Error fetching application:', error);
      return null;
    }
  }

  static async hasApplied(userId: string, internshipId: string): Promise<boolean> {
    const application = await this.getApplicationByInternship(userId, internshipId);
    return application !== null;
  }

  static async withdrawApplication(applicationId: string): Promise<void> {
    return this.updateApplicationStatus(applicationId, 'withdrawn');
  }
}

export default ApplicationService;
