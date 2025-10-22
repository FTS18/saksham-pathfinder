import * as admin from "firebase-admin";
import { Handler } from "@netlify/functions";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();

/**
 * Verify user is authenticated via JWT
 */
async function verifyAuth(headers: Record<string, string | string[] | undefined>): Promise<string | null> {
  const authHeader = headers.authorization;
  if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Verify recruiter role
 */
async function verifyRecruiterRole(userId: string): Promise<boolean> {
  try {
    const recruiterDoc = await db.collection("recruiters").doc(userId).get();
    if (!recruiterDoc.exists) return false;

    const data = recruiterDoc.data();
    return data?.isVerified === true && data?.status === "active";
  } catch (error) {
    console.error("Error verifying recruiter role:", error);
    return false;
  }
}

/**
 * Verify internship ownership
 */
async function verifyInternshipOwnership(internshipId: string, recruiterId: string): Promise<boolean> {
  try {
    const internshipDoc = await db.collection("internships").doc(internshipId).get();
    if (!internshipDoc.exists) return false;

    const data = internshipDoc.data();
    return data?.recruiterId === recruiterId;
  } catch (error) {
    console.error("Error verifying internship ownership:", error);
    return false;
  }
}

/**
 * Main API handler for recruiter operations
 */
export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const userId = await verifyAuth(event.headers);
    if (!userId) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    
    // Extract path - handle both .netlify and direct function name routing
    let path = event.path;
    if (path.includes("/.netlify/functions/recruiter-api")) {
      path = path.split("/.netlify/functions/recruiter-api")[1] || "";
    }
    
    const method = event.httpMethod;

    console.log(`[Recruiter API] ${method} ${path}`, { userId, body });

    // Route to appropriate handler
    if (path === "/initialize-recruiter" && method === "POST") {
      return handleInitializeRecruiter(userId, body, headers);
    } else if (path === "/create-internship" && method === "POST") {
      return handleCreateInternship(userId, body, headers);
    } else if (path === "/update-internship" && method === "PUT") {
      return handleUpdateInternship(userId, body, headers);
    } else if (path === "/delete-internship" && method === "DELETE") {
      return handleDeleteInternship(userId, body, headers);
    } else if (path === "/publish-internship" && method === "POST") {
      return handlePublishInternship(userId, body, headers);
    } else if (path === "/get-applications" && method === "GET") {
      return handleGetApplications(userId, headers);
    } else if (path === "/update-application-status" && method === "PUT") {
      return handleUpdateApplicationStatus(userId, body, headers);
    } else if (path === "/bulk-update-applications" && method === "PUT") {
      return handleBulkUpdateApplications(userId, body, headers);
    } else if (path === "/track-view" && method === "POST") {
      return handleTrackView(body, headers);
    } else if (path === "/get-analytics" && method === "GET") {
      return handleGetAnalytics(userId, headers);
    } else if (path === "/export-data" && method === "POST") {
      return handleExportData(userId, headers);
    } else if (path === "/deactivate-account" && method === "POST") {
      return handleDeactivateAccount(userId, body, headers);
    } else if (path === "/reactivate-account" && method === "POST") {
      return handleReactivateAccount(userId, headers);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "Endpoint not found" }),
    };
  } catch (error: any) {
    console.error("[Recruiter API] Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error?.message || "Internal server error" }),
    };
  }
};

/**
 * Handler functions
 */

async function handleInitializeRecruiter(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const { companyName, companyEmail, gstNumber } = data;

    if (!companyName || !companyEmail || !gstNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const recruiterRef = db.collection("recruiters").doc(userId);
    await recruiterRef.set({
      userId,
      companyName,
      companyEmail,
      gstNumber,
      isVerified: false,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Recruiter profile initialized",
        recruiterId: userId,
      }),
    };
  } catch (error) {
    console.error("Error initializing recruiter:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to initialize recruiter" }),
    };
  }
}

async function handleCreateInternship(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const isRecruiter = await verifyRecruiterRole(userId);
    if (!isRecruiter) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "Not authorized as recruiter" }),
      };
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
      maxApplications,
    } = data;

    if (!title || !description || !sector) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const internshipRef = db.collection("internships").doc();
    const internshipData = {
      id: internshipRef.id,
      recruiterId: userId,
      title,
      description,
      location,
      stipend,
      duration,
      sector,
      skills: skills || [],
      workMode,
      applicationDeadline,
      maxApplications,
      status: "draft",
      views: 0,
      applications: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await internshipRef.set(internshipData);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Internship created successfully",
        internshipId: internshipRef.id,
      }),
    };
  } catch (error) {
    console.error("Error creating internship:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to create internship" }),
    };
  }
}

async function handleUpdateInternship(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const { internshipId, ...updateData } = data;

    if (!internshipId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Internship ID required" }),
      };
    }

    const owns = await verifyInternshipOwnership(internshipId, userId);
    if (!owns) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "You do not own this internship" }),
      };
    }

    await db.collection("internships").doc(internshipId).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Internship updated" }),
    };
  } catch (error) {
    console.error("Error updating internship:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to update internship" }),
    };
  }
}

async function handleDeleteInternship(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const { internshipId } = data;

    if (!internshipId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Internship ID required" }),
      };
    }

    const owns = await verifyInternshipOwnership(internshipId, userId);
    if (!owns) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "You do not own this internship" }),
      };
    }

    await db.collection("internships").doc(internshipId).delete();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Internship deleted" }),
    };
  } catch (error) {
    console.error("Error deleting internship:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to delete internship" }),
    };
  }
}

async function handlePublishInternship(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const { internshipId } = data;

    if (!internshipId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Internship ID required" }),
      };
    }

    const owns = await verifyInternshipOwnership(internshipId, userId);
    if (!owns) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "You do not own this internship" }),
      };
    }

    await db.collection("internships").doc(internshipId).update({
      status: "published",
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Internship published" }),
    };
  } catch (error) {
    console.error("Error publishing internship:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to publish internship" }),
    };
  }
}

async function handleGetApplications(userId: string, headers: Record<string, string>) {
  try {
    const applicationsRef = await db
      .collection("applications")
      .where("recruiterId", "==", userId)
      .get();

    const applications = applicationsRef.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: applications,
        total: applications.length,
      }),
    };
  } catch (error) {
    console.error("Error fetching applications:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch applications" }),
    };
  }
}

async function handleUpdateApplicationStatus(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const { applicationId, status } = data;

    if (!applicationId || !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    await db.collection("applications").doc(applicationId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Application status updated" }),
    };
  } catch (error) {
    console.error("Error updating application status:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to update application status" }),
    };
  }
}

async function handleBulkUpdateApplications(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const { applicationIds, status } = data;

    if (!applicationIds || !Array.isArray(applicationIds) || !status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const batch = db.batch();
    for (const appId of applicationIds) {
      batch.update(db.collection("applications").doc(appId), {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `${applicationIds.length} applications updated`,
      }),
    };
  } catch (error) {
    console.error("Error bulk updating applications:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to update applications" }),
    };
  }
}

async function handleTrackView(data: any, headers: Record<string, string>) {
  try {
    const { internshipId } = data;

    if (!internshipId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Internship ID required" }),
      };
    }

    await db.collection("internships").doc(internshipId).update({
      views: admin.firestore.FieldValue.increment(1),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error tracking view:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to track view" }),
    };
  }
}

async function handleGetAnalytics(userId: string, headers: Record<string, string>) {
  try {
    const internshipsRef = await db
      .collection("internships")
      .where("recruiterId", "==", userId)
      .get();

    let totalViews = 0;
    let totalApplications = 0;

    internshipsRef.docs.forEach((doc) => {
      const data = doc.data();
      totalViews += data?.views || 0;
      totalApplications += data?.applications || 0;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          totalInternships: internshipsRef.docs.length,
          totalViews,
          totalApplications,
        },
      }),
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch analytics" }),
    };
  }
}

async function handleExportData(userId: string, headers: Record<string, string>) {
  try {
    const recruiterDoc = await db.collection("recruiters").doc(userId).get();
    const internshipsRef = await db
      .collection("internships")
      .where("recruiterId", "==", userId)
      .get();
    const applicationsRef = await db
      .collection("applications")
      .where("recruiterId", "==", userId)
      .get();

    const data = {
      recruiter: recruiterDoc.data(),
      internships: internshipsRef.docs.map((doc) => doc.data()),
      applications: applicationsRef.docs.map((doc) => doc.data()),
      exportedAt: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers: { ...headers, "Content-Disposition": 'attachment; filename="user-data.json"' },
      body: JSON.stringify(data, null, 2),
    };
  } catch (error) {
    console.error("Error exporting data:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to export data" }),
    };
  }
}

async function handleDeactivateAccount(
  userId: string,
  data: any,
  headers: Record<string, string>
) {
  try {
    const { reason } = data;

    await db.collection("recruiters").doc(userId).update({
      status: "deactivated",
      deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deactivationReason: reason || "User requested",
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Account deactivated" }),
    };
  } catch (error) {
    console.error("Error deactivating account:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to deactivate account" }),
    };
  }
}

async function handleReactivateAccount(userId: string, headers: Record<string, string>) {
  try {
    await db.collection("recruiters").doc(userId).update({
      status: "active",
      reactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: "Account reactivated" }),
    };
  } catch (error) {
    console.error("Error reactivating account:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to reactivate account" }),
    };
  }
}
