import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc, deleteDoc, writeBatch, startAfter, limit, increment, setDoc } from 'firebase/firestore';

// Enhanced internship interface for Firebase
export interface FirebaseInternship {
  id?: string; // Firestore document ID
  pmis_id?: string;
  title: string;
  role: string;
  company: string;
  location: string | { city: string; lat?: number; lng?: number; };
  stipend: string;
  duration?: string;
  sector_tags: string[];
  required_skills: string[];
  preferred_education_levels?: string[];
  description?: string;
  responsibilities?: string[];
  perks?: string[];
  work_mode?: string;
  type?: string;
  openings?: number;
  application_deadline?: string;
  posted_date?: string;
  apply_link?: string;
  logo?: string;
  featured?: boolean;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  applicationCount?: number;
  viewCount?: number;
  recruiterId?: string; // For recruiter-posted jobs
}

export class InternshipMigrationService {
  private static readonly COLLECTION_NAME = 'internships';
  private static readonly BATCH_SIZE = 500; // Firestore batch limit

  /**
   * Get collection reference for internships
   */
  private static getInternshipsCollection() {
    return collection(db, this.COLLECTION_NAME);
  }

  /**
   * Migrate internships from JSON to Firebase
   */
  static async migrateFromJSON(internshipsData: any[]): Promise<void> {
    try {
      console.log(`Starting migration of ${internshipsData.length} internships...`);
      
      const batch = writeBatch(db);
      let batchCount = 0;
      let totalMigrated = 0;

      for (const internship of internshipsData) {
        const firestoreInternship: any = {
          pmis_id: internship.pmis_id,
          title: internship.title,
          role: internship.role,
          company: internship.company,
          location: internship.location,
          stipend: internship.stipend,
          duration: internship.duration,
          sector_tags: internship.sector_tags || [],
          required_skills: internship.required_skills || [],
          preferred_education_levels: internship.preferred_education_levels || [],
          work_mode: internship.work_mode,
          type: internship.type || 'Internship',
          openings: internship.openings || 1,
          featured: internship.featured || false,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          applicationCount: 0,
          viewCount: 0,

        };

        // Only add fields that are not undefined
        if (internship.description) firestoreInternship.description = internship.description;
        if (internship.responsibilities) firestoreInternship.responsibilities = internship.responsibilities;
        if (internship.perks) firestoreInternship.perks = internship.perks;
        if (internship.application_deadline) firestoreInternship.application_deadline = internship.application_deadline;
        if (internship.posted_date) firestoreInternship.posted_date = internship.posted_date;
        if (internship.apply_link) firestoreInternship.apply_link = internship.apply_link;
        if (internship.logo) firestoreInternship.logo = internship.logo;

        const docRef = doc(this.getInternshipsCollection());
        batch.set(docRef, firestoreInternship);
        
        batchCount++;
        totalMigrated++;

        // Commit batch when it reaches the limit
        if (batchCount >= this.BATCH_SIZE) {
          await batch.commit();
          console.log(`Migrated batch: ${totalMigrated} internships`);
          batchCount = 0;
        }
      }

      // Commit remaining items
      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`✅ Migration completed! Total migrated: ${totalMigrated} internships`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Get all internships from Firebase
   */
  static async getAllInternships(): Promise<FirebaseInternship[]> {
    try {
      if (!db) {
        console.warn('Firebase not initialized, returning empty array');
        return [];
      }
      
      const q = query(
        this.getInternshipsCollection(),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as FirebaseInternship));
    } catch (error) {
      console.error('Error fetching internships:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  /**
   * Get internships with pagination
   */
  static async getInternshipsPaginated(limit: number = 20, lastDoc?: any): Promise<{
    internships: FirebaseInternship[];
    lastDoc: any;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        this.getInternshipsCollection(),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(limit + 1)); // Get one extra to check if there are more

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
      
      const hasMore = docs.length > limit;
      const internships = docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as FirebaseInternship));

      return {
        internships,
        lastDoc: docs[limit - 1] || null,
        hasMore
      };
    } catch (error) {
      console.error('Error fetching paginated internships:', error);
      throw error;
    }
  }

  /**
   * Search internships with filters
   */
  static async searchInternships(filters: {
    location?: string;
    sector?: string;
    skills?: string[];
    company?: string;
    workMode?: string;
    stipendRange?: { min: number; max: number };
    searchQuery?: string;
  }): Promise<FirebaseInternship[]> {
    try {
      let q = query(
        this.getInternshipsCollection(),
        where('status', '==', 'active')
      );

      // Apply basic filters
      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }
      
      if (filters.company) {
        q = query(q, where('company', '==', filters.company));
      }
      
      if (filters.workMode) {
        q = query(q, where('work_mode', '==', filters.workMode));
      }

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as FirebaseInternship));

      // Client-side filtering for complex queries
      if (filters.sector) {
        results = results.filter(internship => 
          internship.sector_tags.includes(filters.sector!)
        );
      }

      if (filters.skills && filters.skills.length > 0) {
        results = results.filter(internship => 
          filters.skills!.some(skill => 
            internship.required_skills.some(s => 
              s.toLowerCase().includes(skill.toLowerCase())
            )
          )
        );
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        results = results.filter(internship => 
          internship.title.toLowerCase().includes(query) ||
          internship.company.toLowerCase().includes(query) ||
          internship.role.toLowerCase().includes(query) ||
          internship.description?.toLowerCase().includes(query)
        );
      }

      if (filters.stipendRange) {
        results = results.filter(internship => {
          const stipend = parseInt(internship.stipend.replace(/[^\\d]/g, ''));
          return stipend >= filters.stipendRange!.min && stipend <= filters.stipendRange!.max;
        });
      }

      return results;
    } catch (error) {
      console.error('Error searching internships:', error);
      throw error;
    }
  }

  /**
   * Get internship by ID
   */
  static async getInternshipById(id: string): Promise<FirebaseInternship | null> {
    try {
      const docRef = doc(this.getInternshipsCollection(), id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
        } as FirebaseInternship;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching internship:', error);
      throw error;
    }
  }

  /**
   * Update internship view count
   */
  static async incrementViewCount(id: string): Promise<void> {
    try {
      const docRef = doc(this.getInternshipsCollection(), id);
      await updateDoc(docRef, {
        viewCount: increment(1),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  }

  /**
   * Get trending internships (most viewed)
   */
  static async getTrendingInternships(limit: number = 10): Promise<FirebaseInternship[]> {
    try {
      const q = query(
        this.getInternshipsCollection(),
        where('status', '==', 'active'),
        orderBy('viewCount', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.slice(0, limit).map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as FirebaseInternship));
    } catch (error) {
      console.error('Error fetching trending internships:', error);
      throw error;
    }
  }

  /**
   * Get featured internships
   */
  static async getFeaturedInternships(): Promise<FirebaseInternship[]> {
    try {
      const q = query(
        this.getInternshipsCollection(),
        where('status', '==', 'active'),
        where('featured', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as FirebaseInternship));
    } catch (error) {
      console.error('Error fetching featured internships:', error);
      throw error;
    }
  }

  /**
   * Create a new internship
   */
  static async createInternship(internshipData: Omit<FirebaseInternship, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(this.getInternshipsCollection());
      const firestoreInternship: FirebaseInternship = {
        ...internshipData,
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 0,
        viewCount: 0
      };
      
      await setDoc(docRef, firestoreInternship);
      console.log('✅ Internship created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error creating internship:', error);
      throw error;
    }
  }

  /**
   * Update an existing internship
   */
  static async updateInternship(id: string, updates: Partial<FirebaseInternship>): Promise<void> {
    try {
      const docRef = doc(this.getInternshipsCollection(), id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
      console.log('✅ Internship updated:', id);
    } catch (error) {
      console.error('❌ Error updating internship:', error);
      throw error;
    }
  }

  /**
   * Delete an internship
   */
  static async deleteInternship(id: string): Promise<void> {
    try {
      const docRef = doc(this.getInternshipsCollection(), id);
      await deleteDoc(docRef);
      console.log('✅ Internship deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting internship:', error);
      throw error;
    }
  }

  /**
   * Clear all internships (for testing)
   */
  static async clearAllInternships(): Promise<void> {
    try {
      const querySnapshot = await getDocs(this.getInternshipsCollection());
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('✅ All internships cleared');
    } catch (error) {
      console.error('❌ Error clearing internships:', error);
      throw error;
    }
  }
}

// Export the service for use in components
export default InternshipMigrationService;