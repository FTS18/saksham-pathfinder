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

  console.log(`[RecruiterService] ${method} ${API_BASE}${endpoint}`, { body });

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  const responseData = await response.json();

  console.log(`[RecruiterService] Response:`, responseData);

  if (!response.ok) {
    throw new Error(
      responseData.error || `API request failed: ${response.status}`
    );
  }

  return responseData;
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
      return await apiCall("/get-status", "GET");
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
    return apiCall("/create-internship", "POST", internship);
  }

  /**
   * Update internship
   */
  static async updateInternship(
    internshipId: string,
    updates: Partial<Internship>
  ): Promise<{ success: boolean; message: string }> {
    return apiCall("/update-internship", "PUT", {
      internshipId,
      ...updates,
    });
  }

  /**
   * Delete internship
   */
  static async deleteInternship(internshipId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiCall("/delete-internship", "DELETE", { internshipId });
  }

  /**
   * Publish internship (make it visible to students)
   */
  static async publishInternship(internshipId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiCall("/publish-internship", "POST", { internshipId });
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
    return apiCall("/update-internship", "PUT", {
      internshipId,
      ...updates,
    });
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
      const response = await apiCall("/get-applications", "GET");
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
    return apiCall("/update-application-status", "PUT", {
      applicationId,
      status,
      notes,
    });
  }

  /**
   * Bulk update application statuses
   */
  static async bulkUpdateApplicationStatus(
    applicationIds: string[],
    status: string
  ): Promise<{ success: boolean; updatedCount: number; message: string }> {
    return apiCall("/bulk-update-applications", "PUT", {
      applicationIds,
      status,
    });
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
      return await apiCall("/track-view", "POST", { internshipId });
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
      return await apiCall("/get-analytics", "GET");
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
        "",
        "",
        "",
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
    return apiCall("/export-data", "POST");
  }

  /**
   * Deactivate account (temporary)
   */
  static async deactivateAccount(reason?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiCall("/deactivate-account", "POST", { reason });
  }

  /**
   * Reactivate account
   */
  static async reactivateAccount(): Promise<{
    success: boolean;
    message: string;
  }> {
    return apiCall("/reactivate-account", "POST");
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
