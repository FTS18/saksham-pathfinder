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

// Re-export the migration service functions
export const getAllInternships = InternshipMigrationService.getAllInternships;
export const getInternshipsPaginated =
  InternshipMigrationService.getInternshipsPaginated;
export const searchInternships = InternshipMigrationService.searchInternships;

// Enhanced getInternshipById with JSON fallback
export const getInternshipById = async (id: string): Promise<any | null> => {
  try {
    // Try Firestore first
    const firestoreInternship =
      await InternshipMigrationService.getInternshipById(id);
    if (firestoreInternship) {
      return firestoreInternship;
    }
  } catch (err) {
    console.warn("Error fetching from Firestore:", err);
  }

  // Fallback to JSON file if not found in Firestore
  try {
    const response = await fetch("/internships.json");
    if (!response.ok) throw new Error("Failed to fetch internships.json");
    const internships = await response.json();

    // Search by id (string or number)
    const found = internships.find((i: any) => String(i.id) === String(id));
    return found || null;
  } catch (err) {
    console.warn("Error fetching from JSON fallback:", err);
    return null;
  }
};

export const getTrendingInternships = (limit?: number) =>
  InternshipMigrationService.getTrendingInternships(limit);
export const getFeaturedInternships = () =>
  InternshipMigrationService.getFeaturedInternships();
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
