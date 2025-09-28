import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc, 
  updateDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';

export interface InternshipApplication {
  internshipId: string;
  candidateId: string;
  recruiterId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export const applyToInternship = async (applicationData: InternshipApplication) => {
  try {
    // Check if user already applied
    const existingApplicationQuery = query(
      collection(db, 'applications'),
      where('internshipId', '==', applicationData.internshipId),
      where('candidateId', '==', applicationData.candidateId)
    );
    
    const existingApplications = await getDocs(existingApplicationQuery);
    
    if (!existingApplications.empty) {
      throw new Error('You have already applied to this internship');
    }

    // Create application
    const application = {
      ...applicationData,
      status: 'pending',
      appliedDate: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'applications'), application);

    // Update internship application count
    const internshipRef = doc(db, 'internships', applicationData.internshipId);
    await updateDoc(internshipRef, {
      applicationCount: increment(1)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error applying to internship:', error);
    throw error;
  }
};

export const getInternshipsForStudents = async () => {
  try {
    const q = query(
      collection(db, 'internships'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
};

export const getUserApplications = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'applications'),
      where('candidateId', '==', userId),
      orderBy('appliedDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedDate: doc.data().appliedDate?.toDate() || new Date()
    }));

    // Fetch internship details for each application
    const internshipPromises = applications.map(async (app) => {
      const internshipDoc = await getDoc(doc(db, 'internships', app.internshipId));
      return {
        ...app,
        internship: internshipDoc.exists() ? {
          id: internshipDoc.id,
          ...internshipDoc.data()
        } : null
      };
    });

    return await Promise.all(internshipPromises);
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
};

export const getInternshipById = async (internshipId: string) => {
  try {
    const docRef = doc(db, 'internships', internshipId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching internship:', error);
    throw error;
  }
};

export const searchInternships = async (filters: {
  location?: string;
  sector?: string;
  skills?: string[];
  stipendRange?: { min: number; max: number };
  duration?: string;
}) => {
  try {
    let q = query(
      collection(db, 'internships'),
      where('status', '==', 'active')
    );

    // Apply filters
    if (filters.location) {
      q = query(q, where('location', '==', filters.location));
    }
    
    if (filters.sector) {
      q = query(q, where('sector', '==', filters.sector));
    }

    const querySnapshot = await getDocs(q);
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    }));

    // Client-side filtering for complex queries
    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(internship => 
        filters.skills!.some(skill => 
          internship.skills.some((s: string) => 
            s.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    if (filters.stipendRange) {
      results = results.filter(internship => {
        const stipend = parseInt(internship.stipend.replace(/[^\d]/g, ''));
        return stipend >= filters.stipendRange!.min && stipend <= filters.stipendRange!.max;
      });
    }

    if (filters.duration) {
      results = results.filter(internship => 
        internship.duration.toLowerCase().includes(filters.duration!.toLowerCase())
      );
    }

    return results;
  } catch (error) {
    console.error('Error searching internships:', error);
    throw error;
  }
};