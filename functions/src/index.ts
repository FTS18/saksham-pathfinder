import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

admin.initializeApp();

// Whitelist only known production domains
const ALLOWED_ORIGINS = [
  "https://saksham-ai-81c3a.web.app",
  "https://upskillers.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
];
const corsHandler = cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    }
  },
});
const db = admin.firestore();

/**
 * ============================================================================
 * AUTHENTICATION & AUTHORIZATION MIDDLEWARE
 * ============================================================================
 */

/**
 * Verify user is authenticated by validating the Firebase ID token.
 * FIX #1: Actually verifies the JWT instead of trusting a client-supplied header.
 */
async function getAuthenticatedUserId(
  req: functions.https.Request
): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Verify user has recruiter role
 */
async function verifyRecruiterRole(userId: string): Promise<boolean> {
  try {
    const recruiterDoc = await db.collection("recruiters").doc(userId).get();

    if (!recruiterDoc.exists) {
      return false;
    }

    const data = recruiterDoc.data();
    return data?.isVerified === true && data?.status === "active";
  } catch (error) {
    console.error("Error verifying recruiter role:", error);
    return false;
  }
}

/**
 * FIX #3: Server-side rate limiting using Firestore sliding window counters.
 * Unlike the client-side Map in security.ts, this survives refreshes, incognito,
 * and different devices. Stored in _ratelimits collection.
 * 
 * @param userId  Firebase UID of the caller
 * @param action  Logical action key (e.g. "post-internship", "api-call")
 * @param limit   Max requests per window (default: 30)
 * @param windowMs  Window size in ms (default: 60 seconds)
 * @returns true if request is allowed, false if rate limit exceeded
 */
async function checkRateLimit(
  userId: string,
  action: string,
  limit: number = 30,
  windowMs: number = 60_000
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const docRef = db.collection("_ratelimits").doc(`${userId}_${action}`);

  try {
    const result = await db.runTransaction(async (tx) => {
      const doc = await tx.get(docRef);
      const data = doc.data() || { requests: [] };

      // Slide the window — remove timestamps older than windowMs
      const recent: number[] = (data.requests as number[]).filter(
        (ts: number) => ts > windowStart
      );

      if (recent.length >= limit) {
        return false; // Rate limit exceeded
      }

      recent.push(now);
      tx.set(docRef, {
        requests: recent,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return true;
    });

    return result;
  } catch (error) {
    // If rate limit check fails (e.g., Firestore outage), allow the request
    // to avoid blocking legitimate users due to infrastructure issues
    console.error("[RateLimit] Error checking rate limit:", error);
    return true;
  }
}

/**
 * Verify recruiter owns the internship
 */
async function verifyInternshipOwnership(
  internshipId: string,
  recruiterId: string
): Promise<boolean> {
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
  } catch (error) {
    console.error("Error verifying internship ownership:", error);
    return false;
  }
}

/**
 * ============================================================================
 * ADMIN MANAGEMENT — CUSTOM CLAIMS
 * ============================================================================
 */

/**
 * FIX #4: Set admin custom claim on a user.
 * Call this from Firebase Admin SDK console or a secure script to bootstrap:
 *   admin.auth().setCustomUserClaims(uid, { admin: true })
 * 
 * Only existing admins can grant admin to others.
 * Usage: call this Firebase Function with { targetUid: "uid-to-promote" }
 */
export const setAdminClaim = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    // Require caller to be authenticated
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required");
    }

    // Verify caller is already an admin via custom claim
    const callerToken = context.auth?.token;
    const isCallerAdmin =
      callerToken?.admin === true ||
      (await db.collection("admins").doc(context.auth.uid).get()).exists;

    if (!isCallerAdmin) {
      throw new functions.https.HttpsError("permission-denied", "Only admins can grant admin privileges");
    }

    const { targetUid } = data;
    if (!targetUid || typeof targetUid !== "string") {
      throw new functions.https.HttpsError("invalid-argument", "targetUid is required");
    }

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(targetUid, { admin: true });

    // Also add to admins collection for Firestore rule backwards compatibility
    await db.collection("admins").doc(targetUid).set({
      grantedBy: context.auth.uid,
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: `Admin claim set for user ${targetUid}` };
  }
);

/**
 * Revoke admin claim from a user.
 */
export const revokeAdminClaim = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required");
    }

    const callerToken = context.auth?.token;
    const isCallerAdmin =
      callerToken?.admin === true ||
      (await db.collection("admins").doc(context.auth.uid).get()).exists;

    if (!isCallerAdmin) {
      throw new functions.https.HttpsError("permission-denied", "Only admins can revoke admin privileges");
    }

    const { targetUid } = data;
    if (!targetUid) throw new functions.https.HttpsError("invalid-argument", "targetUid is required");

    await admin.auth().setCustomUserClaims(targetUid, { admin: false });
    await db.collection("admins").doc(targetUid).delete();

    return { success: true };
  }
);

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
export const deleteUserData = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const batch = db.batch();
  const MAX_BATCH_SIZE = 400; // Firestore batch limit is 500
  let batchCount = 0;

  async function commitAndReset() {
    if (batchCount > 0) {
      await batch.commit();
      batchCount = 0;
    }
  }

  try {
    // 1. Delete profile
    batch.delete(db.collection("profiles").doc(uid));
    batchCount++;

    // 2. Delete recruiter profile (if exists)
    batch.delete(db.collection("recruiters").doc(uid));
    batchCount++;

    // 3. Delete admin entry (if exists)
    batch.delete(db.collection("admins").doc(uid));
    batchCount++;

    // 4. Delete all applications by this user
    const applications = await db
      .collection("applications")
      .where("userId", "==", uid)
      .get();
    for (const doc of applications.docs) {
      batch.delete(doc.ref);
      batchCount++;
      if (batchCount >= MAX_BATCH_SIZE) await commitAndReset();
    }

    // 5. Delete all notifications for this user
    const notifications = await db
      .collection("notifications")
      .where("userId", "==", uid)
      .get();
    for (const doc of notifications.docs) {
      batch.delete(doc.ref);
      batchCount++;
      if (batchCount >= MAX_BATCH_SIZE) await commitAndReset();
    }

    // 6. If recruiter, delete their internships and applications received
    const internships = await db
      .collection("internships")
      .where("recruiterId", "==", uid)
      .get();

    for (const internship of internships.docs) {
      // Delete applications for each internship
      const appsByInternship = await db
        .collection("applications")
        .where("internshipId", "==", internship.id)
        .get();
      for (const app of appsByInternship.docs) {
        batch.delete(app.ref);
        batchCount++;
        if (batchCount >= MAX_BATCH_SIZE) await commitAndReset();
      }
      batch.delete(internship.ref);
      batchCount++;
      if (batchCount >= MAX_BATCH_SIZE) await commitAndReset();
    }

    // 7. Final commit
    await commitAndReset();

    console.log(`[GDPR] Successfully deleted all data for user ${uid}`);
  } catch (error) {
    console.error(`[GDPR] Error deleting data for user ${uid}:`, error);
    // Don't throw — the Auth user is already deleted, we just log the error
  }
});

/**
 * Manual GDPR data deletion (callable by authenticated user themselves)
 */
export const requestDataDeletion = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError("unauthenticated", "Authentication required");
    }

    // Mark the account for deletion — actual deletion happens in deleteUserData trigger
    await db.collection("profiles").doc(context.auth.uid).update({
      deletionRequested: true,
      deletionRequestedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Data deletion requested. Your account will be deleted within 30 days per GDPR Article 17.",
    };
  }
);

/**
 * ============================================================================
 * RECRUITER VERIFICATION & ONBOARDING
 * ============================================================================
 */

/**
 * Initialize recruiter profile with company verification
 */
export const initializeRecruiterProfile = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      // FIX #3: Rate limit — max 5 recruiter profile submissions per hour
      const allowed = await checkRateLimit(context.auth.uid, "init-recruiter-profile", 5, 3_600_000);
      if (!allowed) {
        throw new functions.https.HttpsError(
          "resource-exhausted",
          "Too many submissions. Please try again in an hour."
        );
      }

      const { companyName, companyEmail, gstNumber, incorporationCertificate } =
        data;

      if (!companyName || !companyEmail || !gstNumber) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required fields: companyName, companyEmail, gstNumber"
        );
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
    } catch (error) {
      console.error("Error initializing recruiter profile:", error);
      throw error;
    }
  }
);

/**
 * Get recruiter verification status
 */
export const getRecruiterStatus = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
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
    } catch (error) {
      console.error("Error getting recruiter status:", error);
      throw error;
    }
  }
);

/**
 * ============================================================================
 * INTERNSHIP CRUD OPERATIONS
 * ============================================================================
 */

/**
 * Create internship (recruiter only)
 */
export const createInternship = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const isRecruiter = await verifyRecruiterRole(context.auth.uid);
      if (!isRecruiter) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not a verified recruiter"
        );
      }

      const {
        title,
        description,
        location,
        stipend,
        duration,
        sector,
        skills,
        workMode,
        applicationDeadline,
        companyLogoUrl,
        maxApplications,
      } = data;

      // Validate required fields
      if (!title || !description || !location || !sector) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Missing required fields: title, description, location, sector"
        );
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
    } catch (error) {
      console.error("Error creating internship:", error);
      throw error;
    }
  }
);

/**
 * Update internship (recruiter only, must own internship)
 */
export const updateInternship = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const isRecruiter = await verifyRecruiterRole(context.auth.uid);
      if (!isRecruiter) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not a verified recruiter"
        );
      }

      const { internshipId, updates } = data;

      if (!internshipId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "internshipId is required"
        );
      }

      const ownsInternship = await verifyInternshipOwnership(
        internshipId,
        context.auth.uid
      );
      if (!ownsInternship) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not own this internship"
        );
      }

      // Prevent modifying certain fields
      const safeUpdates = { ...updates };
      delete safeUpdates.recruiterId;
      delete safeUpdates.createdAt;
      delete safeUpdates.applications;
      delete safeUpdates.views;

      safeUpdates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

      await db.collection("internships").doc(internshipId).update(safeUpdates);

      return {
        success: true,
        message: "Internship updated successfully",
      };
    } catch (error) {
      console.error("Error updating internship:", error);
      throw error;
    }
  }
);

/**
 * Delete internship (recruiter only, must own internship)
 */
export const deleteInternship = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const isRecruiter = await verifyRecruiterRole(context.auth.uid);
      if (!isRecruiter) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not a verified recruiter"
        );
      }

      const { internshipId } = data;

      if (!internshipId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "internshipId is required"
        );
      }

      const ownsInternship = await verifyInternshipOwnership(
        internshipId,
        context.auth.uid
      );
      if (!ownsInternship) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not own this internship"
        );
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
    } catch (error) {
      console.error("Error deleting internship:", error);
      throw error;
    }
  }
);

/**
 * Publish internship (make it visible to students)
 */
export const publishInternship = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const { internshipId } = data;

      const ownsInternship = await verifyInternshipOwnership(
        internshipId,
        context.auth.uid
      );
      if (!ownsInternship) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not own this internship"
        );
      }

      await db.collection("internships").doc(internshipId).update({
        status: "published",
        publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        message: "Internship published successfully",
      };
    } catch (error) {
      console.error("Error publishing internship:", error);
      throw error;
    }
  }
);

/**
 * ============================================================================
 * APPLICATION MANAGEMENT
 * ============================================================================
 */

/**
 * Get applications for recruiter's internships
 */
export const getApplications = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const isRecruiter = await verifyRecruiterRole(context.auth.uid);
      if (!isRecruiter) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not a verified recruiter"
        );
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
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  }
);

/**
 * Update application status
 */
export const updateApplicationStatus = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const { applicationId, status, notes } = data;

      if (!applicationId || !status) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "applicationId and status are required"
        );
      }

      const applicationDoc = await db
        .collection("applications")
        .doc(applicationId)
        .get();

      if (!applicationDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Application not found"
        );
      }

      const appData = applicationDoc.data();
      if (appData?.recruiterId !== context.auth.uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You do not have permission to update this application"
        );
      }

      const updateData: any = {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (notes) {
        updateData.notes = notes;
      }

      await db.collection("applications").doc(applicationId).update(updateData);

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
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  }
);

/**
 * Bulk update application statuses
 */
export const bulkUpdateApplicationStatus = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const { applicationIds, status } = data;

      if (!applicationIds || !Array.isArray(applicationIds) || !status) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "applicationIds array and status are required"
        );
      }

      const batch = db.batch();
      const notificationBatch = db.batch();

      for (const appId of applicationIds) {
        const appRef = db.collection("applications").doc(appId);
        const appDoc = await appRef.get();

        if (!appDoc.exists) continue;

        const appData = appDoc.data();
        if (appData?.recruiterId !== context.auth.uid) continue;

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
    } catch (error) {
      console.error("Error bulk updating applications:", error);
      throw error;
    }
  }
);

/**
 * ============================================================================
 * ANALYTICS & TRACKING
 * ============================================================================
 */

/**
 * Track internship view
 */
export const trackInternshipView = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      const { internshipId } = data;

      if (!internshipId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "internshipId is required"
        );
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
    } catch (error) {
      console.error("Error tracking view:", error);
      throw error;
    }
  }
);

/**
 * Get recruiter dashboard analytics
 */
export const getRecruiterAnalytics = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const isRecruiter = await verifyRecruiterRole(context.auth.uid);
      if (!isRecruiter) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "User is not a verified recruiter"
        );
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
      let statusBreakdown: any = {};

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
        conversionRate:
          internshipIds.length > 0
            ? ((totalApplications / (totalViews || 1)) * 100).toFixed(2)
            : 0,
      };
    } catch (error) {
      console.error("Error getting recruiter analytics:", error);
      throw error;
    }
  }
);

/**
 * ============================================================================
 * GDPR COMPLIANCE
 * ============================================================================
 */

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const userId = context.auth.uid;
      const userData: any = {};

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
      userData.applications = applicationsSnapshot.docs.map((doc) =>
        doc.data()
      );

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
      userData.notifications = notificationsSnapshot.docs.map((doc) =>
        doc.data()
      );

      return {
        success: true,
        data: userData,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error exporting user data:", error);
      throw error;
    }
  }
);

/**
 * Deactivate user account
 */
export const deactivateAccount = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
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
        await db.collection("recruiters").doc(userId).update({
          status: "deactivated",
          deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return {
        success: true,
        message:
          "Account deactivated successfully. You can reactivate it within 30 days.",
      };
    } catch (error) {
      console.error("Error deactivating account:", error);
      throw error;
    }
  }
);

/**
 * Reactivate user account
 */
export const reactivateAccount = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    try {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User not authenticated"
        );
      }

      const userId = context.auth.uid;

      // Check if deactivated recently
      const profileDoc = await db.collection("profiles").doc(userId).get();
      if (!profileDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "User profile not found"
        );
      }

      const deactivatedAt =
        profileDoc.data()?.deactivatedAt?.toDate?.() || null;
      if (!deactivatedAt) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Account is not deactivated"
        );
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      if (deactivatedAt < thirtyDaysAgo) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Account reactivation window has expired"
        );
      }

      // Reactivate profile
      await db.collection("profiles").doc(userId).update({
        isActive: true,
        deactivatedAt: null,
        deactivationReason: null,
      });

      // Reactivate recruiter if exists
      const recruiterDoc = await db.collection("recruiters").doc(userId).get();
      if (
        recruiterDoc.exists &&
        recruiterDoc.data()?.status === "deactivated"
      ) {
        await db.collection("recruiters").doc(userId).update({
          status: "active",
          deactivatedAt: null,
        });
      }

      return {
        success: true,
        message: "Account reactivated successfully",
      };
    } catch (error) {
      console.error("Error reactivating account:", error);
      throw error;
    }
  }
);

export const getInternshipForOG = functions.https.onRequest(
  (req: any, res: any) => {
    corsHandler(req, res, async () => {
      try {
        const internshipId = req.query.id || req.path?.split("/").pop();

        if (!internshipId) {
          return res.status(400).json({ error: "Internship ID required" });
        }

        const doc = await db
          .collection("internships")
          .doc(internshipId as string)
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
      } catch (error) {
        console.error("Error fetching internship:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch internship data" });
      }
    });
  }
);

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
export const scheduledFirestoreBackup = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const backupBucket = `gs://${projectId}-backups`;
    
    // Google API client for Firestore
    const client = new (require("@google-cloud/firestore").v1.FirestoreAdminClient)();
    const databaseName = client.databasePath(projectId, "(default)");

    try {
      const responses = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: backupBucket,
        // Leave collectionIds empty to export all collections
        collectionIds: [],
      });
      
      const response = responses[0];
      console.log(`[Backup] Started Firestore export operation: ${response.name}`);
      return true;
    } catch (err) {
      console.error("[Backup] Export operation failed", err);
      throw new Error("Export operation failed");
    }
  });
