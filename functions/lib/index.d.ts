import * as functions from "firebase-functions";
/**
 * ============================================================================
 * RECRUITER VERIFICATION & ONBOARDING
 * ============================================================================
 */
/**
 * Initialize recruiter profile with company verification
 */
export declare const initializeRecruiterProfile: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Get recruiter verification status
 */
export declare const getRecruiterStatus: functions.HttpsFunction & functions.Runnable<any>;
/**
 * ============================================================================
 * INTERNSHIP CRUD OPERATIONS
 * ============================================================================
 */
/**
 * Create internship (recruiter only)
 */
export declare const createInternship: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Update internship (recruiter only, must own internship)
 */
export declare const updateInternship: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Delete internship (recruiter only, must own internship)
 */
export declare const deleteInternship: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Publish internship (make it visible to students)
 */
export declare const publishInternship: functions.HttpsFunction & functions.Runnable<any>;
/**
 * ============================================================================
 * APPLICATION MANAGEMENT
 * ============================================================================
 */
/**
 * Get applications for recruiter's internships
 */
export declare const getApplications: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Update application status
 */
export declare const updateApplicationStatus: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Bulk update application statuses
 */
export declare const bulkUpdateApplicationStatus: functions.HttpsFunction & functions.Runnable<any>;
/**
 * ============================================================================
 * ANALYTICS & TRACKING
 * ============================================================================
 */
/**
 * Track internship view
 */
export declare const trackInternshipView: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Get recruiter dashboard analytics
 */
export declare const getRecruiterAnalytics: functions.HttpsFunction & functions.Runnable<any>;
/**
 * ============================================================================
 * GDPR COMPLIANCE
 * ============================================================================
 */
/**
 * Export user data (GDPR compliance)
 */
export declare const exportUserData: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Deactivate user account
 */
export declare const deactivateAccount: functions.HttpsFunction & functions.Runnable<any>;
/**
 * Reactivate user account
 */
export declare const reactivateAccount: functions.HttpsFunction & functions.Runnable<any>;
export declare const getInternshipForOG: functions.HttpsFunction;
//# sourceMappingURL=index.d.ts.map