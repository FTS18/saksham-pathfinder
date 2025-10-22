"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternshipForOG = exports.reactivateAccount = exports.deactivateAccount = exports.exportUserData = exports.getRecruiterAnalytics = exports.trackInternshipView = exports.bulkUpdateApplicationStatus = exports.updateApplicationStatus = exports.getApplications = exports.publishInternship = exports.deleteInternship = exports.updateInternship = exports.createInternship = exports.getRecruiterStatus = exports.initializeRecruiterProfile = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const cors_1 = __importDefault(require("cors"));
admin.initializeApp();
const corsHandler = (0, cors_1.default)({ origin: true });
const db = admin.firestore();
/**
 * ============================================================================
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * ============================================================================
 */
/**
 * Verify user is authenticated
 */
function getAuthenticatedUserId(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return null;
    }
    const token = authHeader.substring(7);
    // Token validation is handled by Firebase Admin SDK
    // In production, decode JWT here
    return req.headers["x-user-id"] || null;
}
/**
 * Verify user has recruiter role
 */
async function verifyRecruiterRole(userId) {
    try {
        const recruiterDoc = await db
            .collection("recruiters")
            .doc(userId)
            .get();
        if (!recruiterDoc.exists) {
            return false;
        }
        const data = recruiterDoc.data();
        return data?.isVerified === true && data?.status === "active";
    }
    catch (error) {
        console.error("Error verifying recruiter role:", error);
        return false;
    }
}
/**
 * Verify recruiter owns the internship
 */
async function verifyInternshipOwnership(internshipId, recruiterId) {
    try {
        const internshipDoc = await db
            .collection("internships")
            .doc(internshipId)
            .get();
        if (!internshipDoc.exists) {
            return false;
        }
        const data = internshipDoc.data();
        return data?.recruiterId === recruiterId;
    }
    catch (error) {
        console.error("Error verifying internship ownership:", error);
        return false;
    }
}
/**
 * ============================================================================
 * RECRUITER VERIFICATION & ONBOARDING
 * ============================================================================
 */
/**
 * Initialize recruiter profile with company verification
 */
exports.initializeRecruiterProfile = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const { companyName, companyEmail, gstNumber, incorporationCertificate } = data;
        if (!companyName || !companyEmail || !gstNumber) {
            throw new functions.https.HttpsError("invalid-argument", "Missing required fields: companyName, companyEmail, gstNumber");
        }
        // Verify company email domain
        const emailDomain = companyEmail.split("@")[1];
        const companyDomain = companyName.toLowerCase().replace(/\s+/g, "");
        const recruiterRef = db.collection("recruiters").doc(context.auth.uid);
        const recruiterData = {
            userId: context.auth.uid,
            companyName,
            companyEmail,
            emailDomain,
            gstNumber,
            incorporationCertificateUrl: incorporationCertificate || null,
            isVerified: false,
            status: "pending",
            submittedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            internshipsCreated: 0,
            applicationsReceived: 0,
        };
        await recruiterRef.set(recruiterData);
        // Create verification request for admin
        const verificationRef = db.collection("verificationRequests").doc();
        await verificationRef.set({
            recruiterId: context.auth.uid,
            companyName,
            companyEmail,
            gstNumber,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            message: "Recruiter profile initialized. Awaiting verification.",
            recruiterId: context.auth.uid,
        };
    }
    catch (error) {
        console.error("Error initializing recruiter profile:", error);
        throw error;
    }
});
/**
 * Get recruiter verification status
 */
exports.getRecruiterStatus = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const recruiterDoc = await db
            .collection("recruiters")
            .doc(context.auth.uid)
            .get();
        if (!recruiterDoc.exists) {
            return {
                isRecruiter: false,
                status: "not_started",
            };
        }
        const data = recruiterDoc.data();
        return {
            isRecruiter: true,
            status: data?.status || "pending",
            isVerified: data?.isVerified || false,
            companyName: data?.companyName,
            internshipsCreated: data?.internshipsCreated || 0,
        };
    }
    catch (error) {
        console.error("Error getting recruiter status:", error);
        throw error;
    }
});
/**
 * ============================================================================
 * INTERNSHIP CRUD OPERATIONS
 * ============================================================================
 */
/**
 * Create internship (recruiter only)
 */
exports.createInternship = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const isRecruiter = await verifyRecruiterRole(context.auth.uid);
        if (!isRecruiter) {
            throw new functions.https.HttpsError("permission-denied", "User is not a verified recruiter");
        }
        const { title, description, location, stipend, duration, sector, skills, workMode, applicationDeadline, companyLogoUrl, maxApplications, } = data;
        // Validate required fields
        if (!title || !description || !location || !sector) {
            throw new functions.https.HttpsError("invalid-argument", "Missing required fields: title, description, location, sector");
        }
        const recruiterDoc = await db
            .collection("recruiters")
            .doc(context.auth.uid)
            .get();
        const companyData = recruiterDoc.data();
        const internshipRef = db.collection("internships").doc();
        const internshipData = {
            id: internshipRef.id,
            recruiterId: context.auth.uid,
            title,
            description,
            location,
            stipend,
            duration,
            sector,
            skills: skills || [],
            workMode,
            companyName: companyData?.companyName,
            companyLogoUrl,
            applicationDeadline,
            maxApplications,
            status: "draft",
            views: 0,
            applications: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            publishedAt: null,
        };
        await internshipRef.set(internshipData);
        // Update recruiter's internship count
        await db
            .collection("recruiters")
            .doc(context.auth.uid)
            .update({
            internshipsCreated: admin.firestore.FieldValue.increment(1),
        });
        return {
            success: true,
            internshipId: internshipRef.id,
            message: "Internship created successfully",
        };
    }
    catch (error) {
        console.error("Error creating internship:", error);
        throw error;
    }
});
/**
 * Update internship (recruiter only, must own internship)
 */
exports.updateInternship = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const isRecruiter = await verifyRecruiterRole(context.auth.uid);
        if (!isRecruiter) {
            throw new functions.https.HttpsError("permission-denied", "User is not a verified recruiter");
        }
        const { internshipId, updates } = data;
        if (!internshipId) {
            throw new functions.https.HttpsError("invalid-argument", "internshipId is required");
        }
        const ownsInternship = await verifyInternshipOwnership(internshipId, context.auth.uid);
        if (!ownsInternship) {
            throw new functions.https.HttpsError("permission-denied", "You do not own this internship");
        }
        // Prevent modifying certain fields
        const safeUpdates = { ...updates };
        delete safeUpdates.recruiterId;
        delete safeUpdates.createdAt;
        delete safeUpdates.applications;
        delete safeUpdates.views;
        safeUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
        await db
            .collection("internships")
            .doc(internshipId)
            .update(safeUpdates);
        return {
            success: true,
            message: "Internship updated successfully",
        };
    }
    catch (error) {
        console.error("Error updating internship:", error);
        throw error;
    }
});
/**
 * Delete internship (recruiter only, must own internship)
 */
exports.deleteInternship = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const isRecruiter = await verifyRecruiterRole(context.auth.uid);
        if (!isRecruiter) {
            throw new functions.https.HttpsError("permission-denied", "User is not a verified recruiter");
        }
        const { internshipId } = data;
        if (!internshipId) {
            throw new functions.https.HttpsError("invalid-argument", "internshipId is required");
        }
        const ownsInternship = await verifyInternshipOwnership(internshipId, context.auth.uid);
        if (!ownsInternship) {
            throw new functions.https.HttpsError("permission-denied", "You do not own this internship");
        }
        // Use batch to delete internship and related applications
        const batch = db.batch();
        // Delete internship
        batch.delete(db.collection("internships").doc(internshipId));
        // Delete related applications
        const applicationsSnapshot = await db
            .collection("applications")
            .where("internshipId", "==", internshipId)
            .get();
        applicationsSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        // Update recruiter's internship count
        await db
            .collection("recruiters")
            .doc(context.auth.uid)
            .update({
            internshipsCreated: admin.firestore.FieldValue.increment(-1),
        });
        return {
            success: true,
            message: "Internship deleted successfully",
        };
    }
    catch (error) {
        console.error("Error deleting internship:", error);
        throw error;
    }
});
/**
 * Publish internship (make it visible to students)
 */
exports.publishInternship = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const { internshipId } = data;
        const ownsInternship = await verifyInternshipOwnership(internshipId, context.auth.uid);
        if (!ownsInternship) {
            throw new functions.https.HttpsError("permission-denied", "You do not own this internship");
        }
        await db
            .collection("internships")
            .doc(internshipId)
            .update({
            status: "published",
            publishedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            message: "Internship published successfully",
        };
    }
    catch (error) {
        console.error("Error publishing internship:", error);
        throw error;
    }
});
/**
 * ============================================================================
 * APPLICATION MANAGEMENT
 * ============================================================================
 */
/**
 * Get applications for recruiter's internships
 */
exports.getApplications = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const isRecruiter = await verifyRecruiterRole(context.auth.uid);
        if (!isRecruiter) {
            throw new functions.https.HttpsError("permission-denied", "User is not a verified recruiter");
        }
        const { internshipId, status, limit = 50, offset = 0 } = data;
        let query = db
            .collection("applications")
            .where("recruiterId", "==", context.auth.uid);
        if (internshipId) {
            query = query.where("internshipId", "==", internshipId);
        }
        if (status) {
            query = query.where("status", "==", status);
        }
        const snapshot = await query
            .orderBy("appliedAt", "desc")
            .limit(limit + 1)
            .offset(offset)
            .get();
        const applications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return {
            applications,
            hasMore: applications.length > limit,
            total: applications.length,
        };
    }
    catch (error) {
        console.error("Error fetching applications:", error);
        throw error;
    }
});
/**
 * Update application status
 */
exports.updateApplicationStatus = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const { applicationId, status, notes } = data;
        if (!applicationId || !status) {
            throw new functions.https.HttpsError("invalid-argument", "applicationId and status are required");
        }
        const applicationDoc = await db
            .collection("applications")
            .doc(applicationId)
            .get();
        if (!applicationDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Application not found");
        }
        const appData = applicationDoc.data();
        if (appData?.recruiterId !== context.auth.uid) {
            throw new functions.https.HttpsError("permission-denied", "You do not have permission to update this application");
        }
        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if (notes) {
            updateData.notes = notes;
        }
        await db
            .collection("applications")
            .doc(applicationId)
            .update(updateData);
        // Send notification to student
        const notificationRef = db.collection("notifications").doc();
        await notificationRef.set({
            userId: appData?.userId,
            type: "application_status_updated",
            title: `Application Status Updated`,
            message: `Your application status has been updated to: ${status}`,
            applicationId,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            message: "Application status updated and notification sent",
        };
    }
    catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
});
/**
 * Bulk update application statuses
 */
exports.bulkUpdateApplicationStatus = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const { applicationIds, status } = data;
        if (!applicationIds || !Array.isArray(applicationIds) || !status) {
            throw new functions.https.HttpsError("invalid-argument", "applicationIds array and status are required");
        }
        const batch = db.batch();
        const notificationBatch = db.batch();
        for (const appId of applicationIds) {
            const appRef = db.collection("applications").doc(appId);
            const appDoc = await appRef.get();
            if (!appDoc.exists)
                continue;
            const appData = appDoc.data();
            if (appData?.recruiterId !== context.auth.uid)
                continue;
            batch.update(appRef, {
                status,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // Create notification
            const notifRef = db.collection("notifications").doc();
            notificationBatch.set(notifRef, {
                userId: appData?.userId,
                type: "application_status_updated",
                title: "Application Status Updated",
                message: `Your application status has been updated to: ${status}`,
                applicationId: appId,
                read: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        await batch.commit();
        await notificationBatch.commit();
        return {
            success: true,
            updatedCount: applicationIds.length,
            message: `${applicationIds.length} applications updated`,
        };
    }
    catch (error) {
        console.error("Error bulk updating applications:", error);
        throw error;
    }
});
/**
 * ============================================================================
 * ANALYTICS & TRACKING
 * ============================================================================
 */
/**
 * Track internship view
 */
exports.trackInternshipView = functions.https.onCall(async (data, context) => {
    try {
        const { internshipId } = data;
        if (!internshipId) {
            throw new functions.https.HttpsError("invalid-argument", "internshipId is required");
        }
        // Increment views counter
        await db
            .collection("internships")
            .doc(internshipId)
            .update({
            views: admin.firestore.FieldValue.increment(1),
        });
        // Track analytics
        const analyticsRef = db.collection("analytics").doc();
        await analyticsRef.set({
            internshipId,
            userId: context.auth?.uid || "anonymous",
            eventType: "view",
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error tracking view:", error);
        throw error;
    }
});
/**
 * Get recruiter dashboard analytics
 */
exports.getRecruiterAnalytics = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const isRecruiter = await verifyRecruiterRole(context.auth.uid);
        if (!isRecruiter) {
            throw new functions.https.HttpsError("permission-denied", "User is not a verified recruiter");
        }
        // Get recruiter's internships
        const internshipsSnapshot = await db
            .collection("internships")
            .where("recruiterId", "==", context.auth.uid)
            .get();
        const internshipIds = internshipsSnapshot.docs.map((doc) => doc.id);
        // Get applications for all internships
        const applicationsSnapshot = await db
            .collection("applications")
            .where("recruiterId", "==", context.auth.uid)
            .get();
        // Calculate stats
        let totalViews = 0;
        let totalApplications = applicationsSnapshot.size;
        let statusBreakdown = {};
        internshipsSnapshot.docs.forEach((doc) => {
            totalViews += doc.data().views || 0;
        });
        applicationsSnapshot.docs.forEach((doc) => {
            const status = doc.data().status;
            statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
        });
        return {
            totalInternships: internshipIds.length,
            totalViews,
            totalApplications,
            statusBreakdown,
            conversionRate: internshipIds.length > 0
                ? ((totalApplications / (totalViews || 1)) * 100).toFixed(2)
                : 0,
        };
    }
    catch (error) {
        console.error("Error getting recruiter analytics:", error);
        throw error;
    }
});
/**
 * ============================================================================
 * GDPR COMPLIANCE
 * ============================================================================
 */
/**
 * Export user data (GDPR compliance)
 */
exports.exportUserData = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const userId = context.auth.uid;
        const userData = {};
        // Get user profile
        const profileDoc = await db.collection("profiles").doc(userId).get();
        if (profileDoc.exists) {
            userData.profile = profileDoc.data();
        }
        // Get recruiter data if exists
        const recruiterDoc = await db.collection("recruiters").doc(userId).get();
        if (recruiterDoc.exists) {
            userData.recruiter = recruiterDoc.data();
        }
        // Get applications
        const applicationsSnapshot = await db
            .collection("applications")
            .where("userId", "==", userId)
            .get();
        userData.applications = applicationsSnapshot.docs.map((doc) => doc.data());
        // Get internships if recruiter
        const internshipsSnapshot = await db
            .collection("internships")
            .where("recruiterId", "==", userId)
            .get();
        userData.internships = internshipsSnapshot.docs.map((doc) => doc.data());
        // Get notifications
        const notificationsSnapshot = await db
            .collection("notifications")
            .where("userId", "==", userId)
            .get();
        userData.notifications = notificationsSnapshot.docs.map((doc) => doc.data());
        return {
            success: true,
            data: userData,
            exportedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error("Error exporting user data:", error);
        throw error;
    }
});
/**
 * Deactivate user account
 */
exports.deactivateAccount = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const userId = context.auth.uid;
        const { reason } = data;
        // Mark user profile as deactivated
        await db
            .collection("profiles")
            .doc(userId)
            .update({
            isActive: false,
            deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            deactivationReason: reason || null,
        });
        // Mark recruiter as inactive if exists
        const recruiterDoc = await db.collection("recruiters").doc(userId).get();
        if (recruiterDoc.exists) {
            await db
                .collection("recruiters")
                .doc(userId)
                .update({
                status: "deactivated",
                deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        return {
            success: true,
            message: "Account deactivated successfully. You can reactivate it within 30 days.",
        };
    }
    catch (error) {
        console.error("Error deactivating account:", error);
        throw error;
    }
});
/**
 * Reactivate user account
 */
exports.reactivateAccount = functions.https.onCall(async (data, context) => {
    try {
        if (!context.auth?.uid) {
            throw new functions.https.HttpsError("unauthenticated", "User not authenticated");
        }
        const userId = context.auth.uid;
        // Check if deactivated recently
        const profileDoc = await db.collection("profiles").doc(userId).get();
        if (!profileDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User profile not found");
        }
        const deactivatedAt = profileDoc.data()?.deactivatedAt?.toDate?.() || null;
        if (!deactivatedAt) {
            throw new functions.https.HttpsError("invalid-argument", "Account is not deactivated");
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (deactivatedAt < thirtyDaysAgo) {
            throw new functions.https.HttpsError("permission-denied", "Account reactivation window has expired");
        }
        // Reactivate profile
        await db
            .collection("profiles")
            .doc(userId)
            .update({
            isActive: true,
            deactivatedAt: null,
            deactivationReason: null,
        });
        // Reactivate recruiter if exists
        const recruiterDoc = await db.collection("recruiters").doc(userId).get();
        if (recruiterDoc.exists && recruiterDoc.data()?.status === "deactivated") {
            await db
                .collection("recruiters")
                .doc(userId)
                .update({
                status: "active",
                deactivatedAt: null,
            });
        }
        return {
            success: true,
            message: "Account reactivated successfully",
        };
    }
    catch (error) {
        console.error("Error reactivating account:", error);
        throw error;
    }
});
exports.getInternshipForOG = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const internshipId = req.query.id || req.path?.split("/").pop();
            if (!internshipId) {
                return res.status(400).json({ error: "Internship ID required" });
            }
            const doc = await db
                .collection("internships")
                .doc(internshipId)
                .get();
            if (!doc.exists) {
                return res.status(404).json({ error: "Internship not found" });
            }
            const data = doc.data();
            return res.json({
                id: doc.id,
                title: data?.title || "Internship",
                company: data?.companyName || "Company",
                description: data?.description || "",
                location: data?.location || "India",
                stipend: data?.stipend || "Competitive",
                sector: data?.sector || "Technology",
                logo: data?.companyLogoUrl || null,
                work_mode: data?.workMode || "Not specified",
            });
        }
        catch (error) {
            console.error("Error fetching internship:", error);
            return res.status(500).json({ error: "Failed to fetch internship data" });
        }
    });
});
//# sourceMappingURL=index.js.map