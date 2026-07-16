// Import the new migration service
import {
  InternshipMigrationService,
  FirebaseInternship,
} from "./internshipMigrationService";
import { db } from "@/lib/firebase";
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
  serverTimestamp,
} from "firebase/firestore";

export interface InternshipApplication {
  internshipId: string;
  candidateId: string;
  recruiterId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export const applyToInternship = async (
  applicationData: InternshipApplication
) => {
  try {
    // Check if user already applied
    const existingApplicationQuery = query(
      collection(db, "applications"),
      where("internshipId", "==", applicationData.internshipId),
      where("candidateId", "==", applicationData.candidateId)
    );

    const existingApplications = await getDocs(existingApplicationQuery);

    if (!existingApplications.empty) {
      throw new Error("You have already applied to this internship");
    }

    // Create application
    const application = {
      ...applicationData,
      status: "pending",
      appliedDate: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "applications"), application);

    // Update internship application count
    const internshipRef = doc(db, "internships", applicationData.internshipId);
    await updateDoc(internshipRef, {
      applicationCount: increment(1),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error applying to internship:", error);
    throw error;
  }
};

// Override getAllInternships to combine Firestore and Live Scraper API
export const getAllInternships = async (): Promise<any[]> => {
  try {
    let firestoreData: any[] = [];
    try {
      firestoreData = await InternshipMigrationService.getAllInternships();
      // Filter out the hardcoded mock data that was migrated (it has no recruiterId)
      firestoreData = firestoreData.filter(job => !!job.recruiterId);
    } catch (e) {
      console.warn("Firestore fetch failed, relying on live scraper");
    }

    let liveData: any[] = [];
    try {
      // 1. Fetch from live_internships collection (Scraped by GitHub Actions)
      const liveInternshipsQuery = query(collection(db, "live_internships"), where("is_active", "==", true));
      const querySnapshot = await getDocs(liveInternshipsQuery);
      
      const firestoreLiveData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      // 2. Fetch from Netlify Serverless Function (replaces localhost:3001)
      let localLiveData: any[] = [];
      try {
        const response = await fetch("/.netlify/functions/internships-api");
        if (response.ok) {
          const json = await response.json();
          localLiveData = json.data || [];
        }
      } catch (e) {
        console.warn("Failed to fetch from Netlify functions API", e);
      }

      liveData = [...firestoreLiveData, ...localLiveData];
      
      // Remove duplicates by ID
      const uniqueLiveData = Array.from(new Map(liveData.map(item => [item.id, item])).values());
      liveData = uniqueLiveData;

    } catch (e) {
      console.warn("Live scraper fetch failed:", e);
    }

    // Merge and deduplicate
    const combined = [...firestoreData, ...liveData];
    return combined;
  } catch (error) {
    console.error("Error in getAllInternships wrapper:", error);
    return [];
  }
};

export const getInternshipsPaginated = async (lastDoc: any, pageSize = 12) => {
  const all = await getAllInternships();
  // Simple in-memory pagination for live data
  return { internships: all.slice(0, pageSize), lastDoc: null, hasMore: false };
};

export const searchInternships = async (queryStr: string) => {
  const all = await getAllInternships();
  return all.filter(job => 
    job.title.toLowerCase().includes(queryStr.toLowerCase()) || 
    job.company.toLowerCase().includes(queryStr.toLowerCase())
  );
};

export const getTrendingInternships = async (limitNum = 6) => {
  try {
    const trending = await InternshipMigrationService.getTrendingInternships(limitNum);
    if (trending && trending.length > 0) {
      return trending;
    }
  } catch (err) {
    console.warn("Error fetching trending from Firestore migration:", err);
  }
  // Fallback
  const all = await getAllInternships();
  return all.slice(0, limitNum);
};

export const getFeaturedInternships = async () => {
  try {
    const featured = await InternshipMigrationService.getFeaturedInternships();
    if (featured && featured.length > 0) {
      return featured;
    }
  } catch (err) {
    console.warn("Error fetching featured from Firestore migration:", err);
  }
  // Fallback
  const all = await getAllInternships();
  return all.slice(0, 4); // Just return top 4 for now
};

// Enhanced getInternshipById with JSON fallback
export const getInternshipById = async (id: string): Promise<any | null> => {
  try {
    // Try Firestore (legacy/recruiter internships) first
    const firestoreInternship =
      await InternshipMigrationService.getInternshipById(id);
    if (firestoreInternship) {
      return firestoreInternship;
    }
  } catch (err) {
    console.warn("Error fetching from Firestore:", err);
  }

  try {
    // Try live_internships collection next
    const liveDoc = await getDoc(doc(db, "live_internships", id));
    if (liveDoc.exists()) {
      return { ...liveDoc.data(), id: liveDoc.id };
    }
  } catch (err) {
    console.warn("Error fetching from live_internships:", err);
  }

  // Fallback to Live Scraper API (Netlify Function)
  try {
    const response = await fetch("/.netlify/functions/internships-api");
    if (!response.ok) throw new Error("Failed to fetch live internships API");
    const data = await response.json();
    const internships = data.data || [];

    // Search by id (string or number)
    const found = internships.find((i: any) => String(i.id) === String(id));
    return found || null;
  } catch (err) {
    console.warn("Error fetching from Live API fallback:", err);
    return null;
  }
};
export const incrementViewCount = (id: string) =>
  InternshipMigrationService.incrementViewCount(id);

// Legacy function name for backward compatibility
export const getInternshipsForStudents =
  InternshipMigrationService.getAllInternships;

export const getUserApplications = async (userId: string) => {
  try {
    const q = query(
      collection(db, "applications"),
      where("userId", "==", userId) // Changed from candidateId to userId to match ApplicationService
      // orderBy removed to avoid index requirement
    );

    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      appliedDate:
        doc.data().appliedAt?.toDate() ||
        doc.data().appliedDate?.toDate() ||
        new Date(),
    })) as any[];

    // Sort in memory
    applications.sort(
      (a, b) => b.appliedDate.getTime() - a.appliedDate.getTime()
    );

    // Fetch internship details for each application
    const internshipPromises = applications.map(async (app) => {
      const internshipDoc = await getDoc(
        doc(db, "internships", app.internshipId)
      );
      return {
        ...app,
        internship: internshipDoc.exists()
          ? {
              id: internshipDoc.id,
              ...internshipDoc.data(),
            }
          : null,
      };
    });

    return await Promise.all(internshipPromises);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    throw error;
  }
};

// Export types
export type { FirebaseInternship };
