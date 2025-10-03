import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface InternshipFilters {
  sector?: string;
  location?: string;
  minStipend?: number;
  skills?: string[];
  workMode?: string;
  company?: string;
}

export class FirestoreService {
  static async getInternships(filters: InternshipFilters = {}, pageSize = 50, lastDoc?: DocumentSnapshot) {
    try {
      let q = query(collection(db, 'internships'));
      
      // Apply filters
      if (filters.sector && filters.sector !== 'all') {
        q = query(q, where('sector_tags', 'array-contains', filters.sector));
      }
      
      if (filters.location && filters.location !== 'all') {
        q = query(q, where('location', '==', filters.location));
      }
      
      if (filters.company) {
        q = query(q, where('company', '==', filters.company));
      }
      
      if (filters.workMode && filters.workMode !== 'all') {
        q = query(q, where('work_mode', '==', filters.workMode));
      }
      
      // Order by created date
      q = query(q, orderBy('posted_date', 'desc'));
      
      // Pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      q = query(q, limit(pageSize));
      
      const snapshot = await getDocs(q);
      const internships = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        internships,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === pageSize
      };
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  }
  
  static async getInternshipsByCity(city: string, pageSize = 50) {
    try {
      // Try with orderBy first
      let q = query(
        collection(db, 'internships'),
        where('location', '==', city),
        orderBy('posted_date', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error with ordered query, trying simple query:', error);
      // Fallback to simple query without orderBy
      try {
        const q = query(
          collection(db, 'internships'),
          where('location', '==', city),
          limit(pageSize)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (fallbackError) {
        console.error('Error fetching internships by city:', fallbackError);
        throw fallbackError;
      }
    }
  }
  
  static async getInternshipsBySkill(skill: string, pageSize = 50) {
    try {
      // Try simple query first to avoid index requirements
      const q = query(
        collection(db, 'internships'),
        where('required_skills', 'array-contains', skill),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by posted_date in memory if available
      return results.sort((a: any, b: any) => {
        const dateA = a.posted_date?.toDate?.() || new Date(a.posted_date || 0);
        const dateB = b.posted_date?.toDate?.() || new Date(b.posted_date || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching internships by skill:', error);
      throw error;
    }
  }
  
  static async getInternshipsByCompany(company: string, pageSize = 50) {
    try {
      const q = query(
        collection(db, 'internships'),
        where('company', '==', company),
        orderBy('posted_date', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error with ordered query, trying simple query:', error);
      try {
        const q = query(
          collection(db, 'internships'),
          where('company', '==', company),
          limit(pageSize)
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (fallbackError) {
        console.error('Error fetching internships by company:', fallbackError);
        throw fallbackError;
      }
    }
  }
  
  static async getInternshipsBySector(sector: string, pageSize = 50) {
    try {
      const q = query(
        collection(db, 'internships'),
        where('sector_tags', 'array-contains', sector),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching internships by sector:', error);
      throw error;
    }
  }
  
  static async getInternshipsByTitle(title: string, pageSize = 50) {
    try {
      const q = query(
        collection(db, 'internships'),
        where('title', '==', title),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching internships by title:', error);
      throw error;
    }
  }
}