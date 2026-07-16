import { VercelRequest, VercelResponse } from "@vercel/node";
import { db, auth, FieldValue } from "./_utils/firebase";
import { DecodedIdToken } from "firebase-admin/auth";

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// ─── Auth helpers ────────────────────────────────────────────────────────────

async function verifyAuth(
  req: VercelRequest
): Promise<DecodedIdToken | null> {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await auth.verifyIdToken(authHeader.substring(7));
  } catch {
    return null;
  }
}

async function verifyRecruiterRole(
  decoded: DecodedIdToken
): Promise<boolean> {
  try {
    if (decoded.admin === true || decoded.recruiter === true) return true;
    const doc = await db.collection("recruiters").doc(decoded.uid).get();
    if (!doc.exists) return false;
    const data = doc.data();
    return data?.isVerified === true && data?.status === "active";
  } catch {
    return false;
  }
}

async function verifyInternshipOwnership(
  internshipId: string,
  recruiterId: string
): Promise<boolean> {
  try {
    const doc = await db.collection("internships").doc(internshipId).get();
    return doc.exists && doc.data()?.recruiterId === recruiterId;
  } catch {
    return false;
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

async function handleInitializeRecruiter(
  userId: string,
  data: any,
  res: VercelResponse
) {
  const { companyName, companyEmail, gstNumber } = data;
  if (!companyName || !companyEmail || !gstNumber) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  await db
    .collection("recruiters")
    .doc(userId)
    .set({
      userId,
      companyName,
      companyEmail,
      gstNumber,
      isVerified: false,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  return res.status(200).json({
    success: true,
    message: "Recruiter profile initialized",
    recruiterId: userId,
  });
}

async function handleCreateInternship(
  userId: string,
  data: any,
  decoded: DecodedIdToken,
  res: VercelResponse
) {
  if (!(await verifyRecruiterRole(decoded))) {
    return res.status(403).json({ error: "Not authorized as recruiter" });
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
    return res.status(400).json({ error: "Missing required fields" });
  }
  const ref = db.collection("internships").doc();
  await ref.set({
    id: ref.id,
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
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return res.status(201).json({
    success: true,
    message: "Internship created successfully",
    internshipId: ref.id,
  });
}

async function handleUpdateInternship(
  userId: string,
  data: any,
  res: VercelResponse
) {
  const { internshipId, ...updates } = data;
  if (!internshipId) return res.status(400).json({ error: "Missing internshipId" });
  const owned = await verifyInternshipOwnership(internshipId, userId);
  if (!owned) return res.status(403).json({ error: "Not authorized" });
  await db
    .collection("internships")
    .doc(internshipId)
    .update({ ...updates, updatedAt: FieldValue.serverTimestamp() });
  return res.status(200).json({ success: true, message: "Internship updated" });
}

async function handleDeleteInternship(
  userId: string,
  data: any,
  res: VercelResponse
) {
  const { internshipId } = data;
  if (!internshipId) return res.status(400).json({ error: "Missing internshipId" });
  const owned = await verifyInternshipOwnership(internshipId, userId);
  if (!owned) return res.status(403).json({ error: "Not authorized" });
  await db.collection("internships").doc(internshipId).delete();
  return res.status(200).json({ success: true, message: "Internship deleted" });
}

async function handlePublishInternship(
  userId: string,
  data: any,
  res: VercelResponse
) {
  const { internshipId } = data;
  if (!internshipId) return res.status(400).json({ error: "Missing internshipId" });
  const owned = await verifyInternshipOwnership(internshipId, userId);
  if (!owned) return res.status(403).json({ error: "Not authorized" });
  await db.collection("internships").doc(internshipId).update({
    status: "published",
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return res.status(200).json({ success: true, message: "Internship published" });
}

async function handleGetApplications(userId: string, res: VercelResponse) {
  const snap = await db
    .collection("applications")
    .where("recruiterId", "==", userId)
    .get();
  const applications = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return res
    .status(200)
    .json({ success: true, data: applications, total: applications.length });
}

async function handleUpdateApplicationStatus(
  userId: string,
  data: any,
  decoded: DecodedIdToken,
  res: VercelResponse
) {
  const { applicationId, status } = data;
  if (!applicationId || !status)
    return res.status(400).json({ error: "Missing required fields" });
  if (!(await verifyRecruiterRole(decoded)))
    return res.status(403).json({ error: "Not authorized as recruiter" });
  const appDoc = await db.collection("applications").doc(applicationId).get();
  if (!appDoc.exists || appDoc.data()?.recruiterId !== userId)
    return res.status(403).json({ error: "Not authorized to update this application" });
  await db
    .collection("applications")
    .doc(applicationId)
    .update({ status, updatedAt: FieldValue.serverTimestamp() });
  return res.status(200).json({ success: true, message: "Application status updated" });
}

async function handleBulkUpdateApplications(
  userId: string,
  data: any,
  decoded: DecodedIdToken,
  res: VercelResponse
) {
  const { applicationIds, status } = data;
  if (!applicationIds || !Array.isArray(applicationIds) || !status)
    return res.status(400).json({ error: "Missing required fields" });
  if (!(await verifyRecruiterRole(decoded)))
    return res.status(403).json({ error: "Not authorized as recruiter" });
  const batch = db.batch();
  for (const appId of applicationIds) {
    const appDoc = await db.collection("applications").doc(appId).get();
    if (appDoc.exists && appDoc.data()?.recruiterId === userId) {
      batch.update(db.collection("applications").doc(appId), {
        status,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
  await batch.commit();
  return res.status(200).json({
    success: true,
    message: `${applicationIds.length} applications updated`,
  });
}

async function handleTrackView(data: any, res: VercelResponse) {
  const { internshipId } = data;
  if (!internshipId)
    return res.status(400).json({ error: "Internship ID required" });
  await db
    .collection("internships")
    .doc(internshipId)
    .update({ views: FieldValue.increment(1) });
  return res.status(200).json({ success: true });
}

async function handleGetAnalytics(userId: string, res: VercelResponse) {
  const snap = await db
    .collection("internships")
    .where("recruiterId", "==", userId)
    .get();
  let totalViews = 0;
  let totalApplications = 0;
  snap.docs.forEach((doc) => {
    const d = doc.data();
    totalViews += d?.views || 0;
    totalApplications += d?.applications || 0;
  });
  return res.status(200).json({
    success: true,
    data: {
      totalInternships: snap.docs.length,
      totalViews,
      totalApplications,
    },
  });
}

async function handleExportData(userId: string, res: VercelResponse) {
  const [recruiterDoc, internshipsSnap, applicationsSnap] = await Promise.all([
    db.collection("recruiters").doc(userId).get(),
    db.collection("internships").where("recruiterId", "==", userId).get(),
    db.collection("applications").where("recruiterId", "==", userId).get(),
  ]);
  const data = {
    recruiter: recruiterDoc.data(),
    internships: internshipsSnap.docs.map((d) => d.data()),
    applications: applicationsSnap.docs.map((d) => d.data()),
    exportedAt: new Date().toISOString(),
  };
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="user-data.json"'
  );
  return res.status(200).json(data);
}

async function handleDeactivateAccount(
  userId: string,
  data: any,
  res: VercelResponse
) {
  await db
    .collection("recruiters")
    .doc(userId)
    .update({
      status: "deactivated",
      deactivatedAt: FieldValue.serverTimestamp(),
      deactivationReason: data.reason || "User requested",
    });
  return res
    .status(200)
    .json({ success: true, message: "Account deactivated" });
}

async function handleReactivateAccount(userId: string, res: VercelResponse) {
  await db.collection("recruiters").doc(userId).update({
    status: "active",
    reactivatedAt: FieldValue.serverTimestamp(),
  });
  return res
    .status(200)
    .json({ success: true, message: "Account reactivated" });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(200).end();

  // Health check
  const url = req.url || "";
  if (req.method === "GET" && url.endsWith("/health")) {
    return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  }

  const decoded = await verifyAuth(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });

  const userId = decoded.uid;
  const body = req.body || {};

  // Extract sub-path after /api/recruiter-api
  let path = url;
  if (path.includes("/api/recruiter-api")) {
    path = path.split("/api/recruiter-api")[1] || "";
  } else if (path.includes("/recruiter-api")) {
    path = path.split("/recruiter-api")[1] || "";
  }

  const method = req.method || "GET";
  console.log(`[Recruiter API] ${method} ${path}`, { userId });

  try {
    if (path === "/initialize-recruiter" && method === "POST")
      return handleInitializeRecruiter(userId, body, res);
    if (path === "/create-internship" && method === "POST")
      return handleCreateInternship(userId, body, decoded, res);
    if (path === "/update-internship" && method === "PUT")
      return handleUpdateInternship(userId, body, res);
    if (path === "/delete-internship" && method === "DELETE")
      return handleDeleteInternship(userId, body, res);
    if (path === "/publish-internship" && method === "POST")
      return handlePublishInternship(userId, body, res);
    if (path === "/get-applications" && method === "GET")
      return handleGetApplications(userId, res);
    if (path === "/update-application-status" && method === "PUT")
      return handleUpdateApplicationStatus(userId, body, decoded, res);
    if (path === "/bulk-update-applications" && method === "PUT")
      return handleBulkUpdateApplications(userId, body, decoded, res);
    if (path === "/track-view" && method === "POST")
      return handleTrackView(body, res);
    if (path === "/get-analytics" && method === "GET")
      return handleGetAnalytics(userId, res);
    if (path === "/export-data" && method === "POST")
      return handleExportData(userId, res);
    if (path === "/deactivate-account" && method === "POST")
      return handleDeactivateAccount(userId, body, res);
    if (path === "/reactivate-account" && method === "POST")
      return handleReactivateAccount(userId, res);

    return res.status(404).json({ error: "Endpoint not found" });
  } catch (error: any) {
    console.error("[Recruiter API] Error:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Internal server error" });
  }
}
