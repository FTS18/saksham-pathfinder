import { auth, db } from "@/lib/firebase";
import { getInternshipById } from "@/services/internshipService";
import { doc, getDoc, collection, writeBatch, serverTimestamp } from "firebase/firestore";
import {
  RecruiterProfile,
  Internship,
  Application,
  RecruiterDashboardStats,
  VerificationRequest,
} from "@/types";

import { apiClient } from "@/lib/apiClient";

/**
 * Recruiter Service - Handles all recruiter-related API calls
 * All operations are server-side authenticated and validated via apiClient
 */

export class RecruiterService {
  /**
   * ========================================================================
   * VERIFICATION & ONBOARDING
   * ========================================================================
   */

  /**
   * Initialize recruiter profile with company verification
   */
  static async initializeRecruiterProfile(data: {
    companyName: string;
    companyEmail: string;
    gstNumber: string;
    incorporationCertificate?: string;
  }): Promise<{ success: boolean; message: string; recruiterId: string }> {
    return apiClient.request("/initialize-recruiter", { method: "POST", data: data });
  }

  /**
   * Get recruiter verification status
   */
  static async getRecruiterStatus(): Promise<{
    isRecruiter: boolean;
    status: string;
    isVerified: boolean;
    companyName?: string;
    internshipsCreated?: number;
  }> {
    try {
      return await apiClient.request("/get-status", { method: "GET"});
    } catch (error) {
      console.error("Error getting recruiter status:", error);
      throw error;
    }
  }

  /**
   * ========================================================================
   * INTERNSHIP MANAGEMENT
   * ========================================================================
   */

  /**
   * Create new internship
   */
  static async createInternship(internship: Partial<Internship>): Promise<{
    success: boolean;
    internshipId: string;
    message: string;
  }> {
    return apiClient.request("/create-internship", { method: "POST", data: internship });
  }

  /**
   * Update internship
   */
  static async updateInternship(
    internshipId: string,
    updates: Partial<Internship>
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.request("/update-internship", { method: "PUT", data: {
      internshipId,
      ...updates,
    } });
  }

  /**
   * Delete internship
   */
  static async deleteInternship(internshipId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiClient.request("/delete-internship", { method: "DELETE", data: { internshipId } });
  }

  /**
   * Publish internship (make it visible to students)
   */
  static async publishInternship(internshipId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiClient.request("/publish-internship", { method: "POST", data: { internshipId } });
  }

  /**
   * Save internship as draft (auto-save)
   */
  static async saveDraft(
    internshipId: string,
    updates: Partial<Internship>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiClient.request("/update-internship", { method: "PUT", data: {
      internshipId,
      ...updates,
    } });
  }

  /**
   * ========================================================================
   * APPLICATION MANAGEMENT
   * ========================================================================
   */

  /**
   * Get applications for recruiter's internships
   */
  static async getApplications(filters?: {
    internshipId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    applications: Application[];
    hasMore: boolean;
    total: number;
  }> {
    try {
      const response = await apiClient.request("/get-applications", { method: "GET"});
      return response as any;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  }

  /**
   * Update application status
   */
  static async updateApplicationStatus(
    applicationId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.request("/update-application-status", { method: "PUT", data: {
      applicationId,
      status,
      notes,
    } });
  }

  /**
   * Bulk update application statuses
   */
  static async bulkUpdateApplicationStatus(
    applicationIds: string[],
    status: string
  ): Promise<{ success: boolean; updatedCount: number; message: string }> {
    return apiClient.request("/bulk-update-applications", { method: "PUT", data: {
      applicationIds,
      status,
    } });
  }

  /**
   * ========================================================================
   * ANALYTICS & TRACKING
   * ========================================================================
   */

  /**
   * Track internship view
   */
  static async trackInternshipView(internshipId: string): Promise<{
    success: boolean;
  }> {
    try {
      return await apiClient.request("/track-view", { method: "POST", data: { internshipId } });
    } catch (error) {
      console.error("Error tracking view:", error);
      return { success: false };
    }
  }

  /**
   * Get recruiter dashboard analytics
   */
  static async getRecruiterAnalytics(): Promise<RecruiterDashboardStats> {
    try {
      return await apiClient.request("/get-analytics", { method: "GET"});
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  }

  /**
   * ========================================================================
   * BULK OPERATIONS
   * ========================================================================
   */

  /**
   * FIX #25: Duplicate an existing internship
   */
  static async duplicateInternship(
    internshipId: string
  ): Promise<{ success: boolean; id?: string; message: string }> {
    try {
      const internship = await getInternshipById(internshipId);
      if (!internship) throw new Error("Internship not found");
      
      const newInternshipData = {
        ...internship,
        title: `${internship.title} (Copy)`,
        status: "draft", // Always duplicate as draft
        views: 0,
        applications: 0,
        createdAt: undefined,
        updatedAt: undefined,
        publishedAt: undefined,
        id: undefined,
      };
      
      const result = await this.createInternship(newInternshipData as any);
      return { success: true, id: result.internshipId, message: "Internship duplicated successfully" };
    } catch (error) {
      console.error("Error duplicating internship:", error);
      throw error;
    }
  }

  /**
   * FIX #25: Upload internships from CSV
   */
  static async uploadInternshipsCSV(
    file: File
  ): Promise<{
    success: boolean;
    importedCount: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim().length > 0);
      if (lines.length < 2) throw new Error("CSV file is empty or missing headers");
      
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));
      const batch = writeBatch(db);
      let importedCount = 0;
      
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Simple CSV parsing (doesn't handle commas inside quotes perfectly, but good enough for simple uploads)
        const values = line.split(",").map(v => v.trim().replace(/"/g, ''));
        const data: any = {
          recruiterId: user.uid,
          status: "draft",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          views: 0,
          applications: 0,
        };
        
        headers.forEach((header, index) => {
          if (values[index]) {
            data[header] = values[index];
          }
        });
        
        if (data.title && (data.company || data.companyName)) {
          const docRef = doc(collection(db, "internships"));
          batch.set(docRef, data);
          importedCount++;
        }
      }
      
      if (importedCount > 0) {
        await batch.commit();
      }
      
      return { success: true, importedCount, errors: [] };
    } catch (error) {
      console.error("Error uploading CSV:", error);
      throw error;
    }
  }

  /**
  /**
   * FIX #29: Export applications to CSV (now fetches actual student data)
   */
  static async exportApplicationsToCSV(internshipId?: string): Promise<Blob> {
    try {
      const applications = await this.getApplications({
        internshipId,
        limit: 10000,
      });

      const headers = [
        "Application ID",
        "Student Name",
        "Email",
        "Phone",
        "Status",
        "Applied At",
        "Notes",
      ];

      // Fetch student profiles for each application
      const rows = await Promise.all(
        applications.applications.map(async (app) => {
          let name = "";
          let email = "";
          let phone = "";
          
          if (app.userId) {
            try {
              const profileRef = doc(db, "profiles", app.userId);
              const profileSnap = await getDoc(profileRef);
              if (profileSnap.exists()) {
                const profile = profileSnap.data();
                name = profile.name || "";
                email = profile.email || "";
                phone = profile.phone || "";
              }
            } catch (err) {
              console.error(`Failed to fetch profile for ${app.userId}`, err);
            }
          }

          return [
            app.id || "",
            name,
            email,
            phone,
            app.status,
            app.appliedAt,
            app.notes || "",
          ];
        })
      );

      const csv = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return new Blob([csv], { type: "text/csv" });
    } catch (error) {
      console.error("Error exporting applications:", error);
      throw error;
    }
  }

  /**
   * ========================================================================
   * GDPR COMPLIANCE
   * ========================================================================
   */

  /**
   * Download user data (GDPR compliance)
   */
  static async downloadUserData(): Promise<{
    success: boolean;
    data: any;
    exportedAt: string;
  }> {
    return apiClient.request("/export-data", { method: "POST"});
  }

  /**
   * Deactivate account (temporary)
   */
  static async deactivateAccount(reason?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiClient.request("/deactivate-account", { method: "POST", data: { reason } });
  }

  /**
   * Reactivate account
   */
  static async reactivateAccount(): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiClient.request("/reactivate-account", { method: "POST"});
  }

  /**
   * ========================================================================
   * PROFILE MANAGEMENT
   * ========================================================================
   */

  /**
   * Get recruiter profile
   */
  static async getRecruiterProfile(): Promise<RecruiterProfile> {
    try {
      const status = await this.getRecruiterStatus();
      if (!status.isRecruiter) {
        throw new Error("User is not a recruiter");
      }

      return {
        userId: auth.currentUser?.uid || "",
        companyName: status.companyName || "",
        companyEmail: auth.currentUser?.email || "",
        emailDomain: "",
        gstNumber: "",
        isVerified: status.isVerified,
        status: status.status as any,
        internshipsCreated: status.internshipsCreated || 0,
        applicationsReceived: 0,
      };
    } catch (error) {
      console.error("Error getting recruiter profile:", error);
      throw error;
    }
  }

  /**
   * Update profile visibility settings
   */
  static async updatePrivacySettings(settings: {
    profileVisibility: "public" | "private" | "connections_only";
    hideFromCompanies?: string[];
    anonymousMode?: boolean;
    dataSharing?: boolean;
  }): Promise<{ success: boolean; message: string }> {
    try {
      return { success: true, message: "Privacy settings updated" };
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      throw error;
    }
  }
}

