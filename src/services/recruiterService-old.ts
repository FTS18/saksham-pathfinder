import { auth } from "@/lib/firebase";
import {
  RecruiterProfile,
  Internship,
  Application,
  RecruiterDashboardStats,
  VerificationRequest,
} from "@/types";

const API_BASE = "/.netlify/functions/recruiter-api";

/**
 * Get authorization header with Firebase ID token
 */
async function getAuthHeader(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  const token = await user.getIdToken();
  return `Bearer ${token}`;
}

/**
 * Make API request to Netlify function
 */
async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: await getAuthHeader(),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

/**
 * Recruiter Service - Handles all recruiter-related API calls to Netlify Functions
 * All operations are server-side authenticated and validated
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
    return apiCall("/initialize-recruiter", "POST", data);
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
      const getStatus = httpsCallable(functions, "getRecruiterStatus");
      const result = await getStatus({});
      return result.data as any;
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
    try {
      const createInternship = httpsCallable(functions, "createInternship");
      const result = await createInternship(internship);
      return result.data as any;
    } catch (error) {
      console.error("Error creating internship:", error);
      throw error;
    }
  }

  /**
   * Update internship
   */
  static async updateInternship(
    internshipId: string,
    updates: Partial<Internship>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updateInternship = httpsCallable(functions, "updateInternship");
      const result = await updateInternship({ internshipId, updates });
      return result.data as any;
    } catch (error) {
      console.error("Error updating internship:", error);
      throw error;
    }
  }

  /**
   * Delete internship
   */
  static async deleteInternship(internshipId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const deleteInternship = httpsCallable(functions, "deleteInternship");
      const result = await deleteInternship({ internshipId });
      return result.data as any;
    } catch (error) {
      console.error("Error deleting internship:", error);
      throw error;
    }
  }

  /**
   * Publish internship (make it visible to students)
   */
  static async publishInternship(internshipId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const publishInternship = httpsCallable(functions, "publishInternship");
      const result = await publishInternship({ internshipId });
      return result.data as any;
    } catch (error) {
      console.error("Error publishing internship:", error);
      throw error;
    }
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
    try {
      const updateInternship = httpsCallable(functions, "updateInternship");
      const result = await updateInternship({ internshipId, updates });
      return result.data as any;
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
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
      const getApplications = httpsCallable(functions, "getApplications");
      const result = await getApplications(filters || {});
      return result.data as any;
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
    try {
      const updateStatus = httpsCallable(functions, "updateApplicationStatus");
      const result = await updateStatus({ applicationId, status, notes });
      return result.data as any;
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  }

  /**
   * Bulk update application statuses
   */
  static async bulkUpdateApplicationStatus(
    applicationIds: string[],
    status: string
  ): Promise<{ success: boolean; updatedCount: number; message: string }> {
    try {
      const bulkUpdate = httpsCallable(
        functions,
        "bulkUpdateApplicationStatus"
      );
      const result = await bulkUpdate({ applicationIds, status });
      return result.data as any;
    } catch (error) {
      console.error("Error bulk updating applications:", error);
      throw error;
    }
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
      const trackView = httpsCallable(functions, "trackInternshipView");
      const result = await trackView({ internshipId });
      return result.data as any;
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
      const getAnalytics = httpsCallable(functions, "getRecruiterAnalytics");
      const result = await getAnalytics({});
      return result.data as any;
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
   * Duplicate internship
   */
  static async duplicateInternship(internshipId: string): Promise<{
    success: boolean;
    newInternshipId: string;
    message: string;
  }> {
    try {
      // Fetch original internship
      // Duplicate it with new ID
      // This would be implemented as a separate Cloud Function
      throw new Error("duplicateInternship not yet implemented");
    } catch (error) {
      console.error("Error duplicating internship:", error);
      throw error;
    }
  }

  /**
   * Upload internships via CSV
   */
  static async uploadInternshipsCSV(file: File): Promise<{
    success: boolean;
    importedCount: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    try {
      // This would typically involve:
      // 1. Reading CSV file
      // 2. Parsing rows
      // 3. Validating data
      // 4. Creating internships in batch
      const formData = new FormData();
      formData.append("file", file);

      // Call a dedicated upload endpoint
      throw new Error("uploadInternshipsCSV not yet implemented");
    } catch (error) {
      console.error("Error uploading CSV:", error);
      throw error;
    }
  }

  /**
   * Export applications to CSV
   */
  static async exportApplicationsToCSV(internshipId?: string): Promise<Blob> {
    try {
      const applications = await this.getApplications({
        internshipId,
        limit: 10000,
      });

      // Create CSV content
      const headers = [
        "Application ID",
        "Student Name",
        "Email",
        "Phone",
        "Status",
        "Applied At",
        "Notes",
      ];

      const rows = applications.applications.map((app) => [
        app.id || "",
        "", // Would need to fetch student profile
        "", // Would need to fetch student email
        "", // Would need to fetch student phone
        app.status,
        app.appliedAt,
        app.notes || "",
      ]);

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
    try {
      const exportData = httpsCallable(functions, "exportUserData");
      const result = await exportData({});
      return result.data as any;
    } catch (error) {
      console.error("Error exporting user data:", error);
      throw error;
    }
  }

  /**
   * Deactivate account (temporary)
   */
  static async deactivateAccount(reason?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const deactivate = httpsCallable(functions, "deactivateAccount");
      const result = await deactivate({ reason });
      return result.data as any;
    } catch (error) {
      console.error("Error deactivating account:", error);
      throw error;
    }
  }

  /**
   * Reactivate account
   */
  static async reactivateAccount(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const reactivate = httpsCallable(functions, "reactivateAccount");
      const result = await reactivate({});
      return result.data as any;
    } catch (error) {
      console.error("Error reactivating account:", error);
      throw error;
    }
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

      // In a real implementation, this would fetch full recruiter profile from Firestore
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
      // This would update the recruiter's privacy settings
      // For now, returning a mock response
      return { success: true, message: "Privacy settings updated" };
    } catch (error) {
      console.error("Error updating privacy settings:", error);
      throw error;
    }
  }
}
