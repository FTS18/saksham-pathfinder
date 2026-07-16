import { VercelRequest, VercelResponse } from "@vercel/node";
import { auth } from "./_utils/firebase";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    if (decodedToken.admin !== true) {
      return res
        .status(403)
        .json({ error: "Forbidden. Only admins can assign roles." });
    }

    const { targetUid, role, assign = true } = req.body || {};

    if (!targetUid || !role) {
      return res.status(400).json({ error: "Missing targetUid or role" });
    }

    if (role !== "recruiter" && role !== "admin") {
      return res.status(400).json({ error: "Invalid role" });
    }

    const userRecord = await auth.getUser(targetUid);
    const existingClaims = userRecord.customClaims || {};
    const newClaims = { ...existingClaims, [role]: assign };

    await auth.setCustomUserClaims(targetUid, newClaims);

    return res.status(200).json({
      success: true,
      message: `Successfully set ${role} claim to ${assign} for user ${targetUid}`,
    });
  } catch (error: any) {
    console.error("[Admin API] Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}
