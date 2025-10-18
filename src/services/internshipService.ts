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
export const getInternshipById = InternshipMigrationService.getInternshipById;
export const getTrendingInternships =
  InternshipMigrationService.getTrendingInternships;
export const getFeaturedInternships =
  InternshipMigrationService.getFeaturedInternships;
export const incrementViewCount = InternshipMigrationService.incrementViewCount;

// Legacy function name for backward compatibility
export const getInternshipsForStudents =
  InternshipMigrationService.getAllInternships;

export const getUserApplications = async (userId: string) => {
  try {
    const q = query(
      collection(db, "applications"),
      where("candidateId", "==", userId),
      orderBy("appliedDate", "desc")
    );

    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      appliedDate: doc.data().appliedDate?.toDate() || new Date(),
    }));

    // Fetch internship details for each application
    const internshipPromises = applications.map(async (app) => {
      const internshipDoc = await getDoc(
        doc(db, "internships", app.id)
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
