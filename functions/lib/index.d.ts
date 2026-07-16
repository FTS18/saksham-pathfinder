import * as functionsV1 from "firebase-functions/v1";
/**
 * ============================================================================
 * ADMIN MANAGEMENT — CUSTOM CLAIMS
 * ============================================================================
 */
/**
 * FIX #4: Set admin custom claim on a user.
 * Call this from Firebase Admin SDK console or a secure script to bootstrap:
 *   getAuth().setCustomUserClaims(uid, { admin: true })
 *
 * Only existing admins can grant admin to others.
 * Usage: call this Firebase Function with { targetUid: "uid-to-promote" }
 */
export declare const setAdminClaim: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Revoke admin claim from a user.
 */
export declare const revokeAdminClaim: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * ============================================================================
 * GDPR COMPLIANCE — Right to Erasure (Article 17)
 * ============================================================================
 */
/**
 * FIX #24: Full cascade delete of all user data across all Firestore collections.
 * Called automatically when a user deletes their Firebase Auth account,
 * or can be called manually by the user.
 *
 * Collections deleted:
 * - profiles/{userId}
 * - applications (where userId == uid)
 * - notifications (where userId == uid)
 * - _ratelimits (where key starts with uid)
 * - recruiters/{userId} (if recruiter)
 * - internships (where recruiterId == uid, if recruiter)
 */
export declare const deleteUserData: functionsV1.CloudFunction<import("firebase-admin/auth").UserRecord>;
/**
 * Manual GDPR data deletion (callable by authenticated user themselves)
 */
export declare const requestDataDeletion: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * ============================================================================
 * RECRUITER VERIFICATION & ONBOARDING
 * ============================================================================
 */
/**
 * Initialize recruiter profile with company verification
 */
export declare const initializeRecruiterProfile: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Get recruiter verification status
 */
export declare const getRecruiterStatus: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * ============================================================================
 * INTERNSHIP CRUD OPERATIONS
 * ============================================================================
 */
/**
 * Create internship (recruiter only)
 */
export declare const createInternship: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Update internship (recruiter only, must own internship)
 */
export declare const updateInternship: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Delete internship (recruiter only, must own internship)
 */
export declare const deleteInternship: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Publish internship (make it visible to students)
 */
export declare const publishInternship: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * ============================================================================
 * APPLICATION MANAGEMENT
 * ============================================================================
 */
/**
 * Get applications for recruiter's internships
 */
export declare const getApplications: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Update application status
 */
export declare const updateApplicationStatus: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Bulk update application statuses
 */
export declare const bulkUpdateApplicationStatus: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * ============================================================================
 * ANALYTICS & TRACKING
 * ============================================================================
 */
/**
 * Track internship view
 */
export declare const trackInternshipView: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Get recruiter dashboard analytics
 */
export declare const getRecruiterAnalytics: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * ============================================================================
 * GDPR COMPLIANCE
 * ============================================================================
 */
/**
 * Export user data (GDPR compliance)
 */
export declare const exportUserData: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Deactivate user account
 */
export declare const deactivateAccount: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
/**
 * Reactivate user account
 */
export declare const reactivateAccount: functionsV1.HttpsFunction & functionsV1.Runnable<any>;
export declare const getInternshipForOG: functionsV1.HttpsFunction;
/**
 * ============================================================================
 * FIX #19: DATABASE BACKUPS (Scheduled)
 * ============================================================================
 */
/**
 * Scheduled function to export Firestore data to Cloud Storage daily.
 * Requires setting up a Google Cloud Storage bucket: gs://saksham-ai-81c3a-backups
 * Requires assigning the default App Engine service account `roles/datastore.importExportAdmin`
 */
export declare const scheduledFirestoreBackup: functionsV1.CloudFunction<unknown>;
//# sourceMappingURL=index.d.ts.map