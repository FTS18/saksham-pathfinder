import { VercelRequest, VercelResponse } from "@vercel/node";
import { db, auth, FieldValue } from "./_utils/firebase";

// Shared CORS headers
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Point values per action
const POINT_VALUES: Record<string, number> = {
  profile_completion: 200,
  referral: 100,
  daily_login: 50,
  time_tracking: 100,
  application_submitted: 50,
};

async function verifyAuth(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers on every response
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const uid = await verifyAuth(req);
  if (!uid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action, idempotencyKey, targetUid } = req.body || {};

  if (!action || !POINT_VALUES[action]) {
    return res.status(400).json({ error: "Invalid action type" });
  }

  const pointsToAward = POINT_VALUES[action];
  const userToAward = targetUid || uid;

  try {
    const result = await db.runTransaction(async (tx) => {
      if (idempotencyKey) {
        const txRef = db
          .collection("point_transactions")
          .doc(`${userToAward}_${idempotencyKey}`);
        const txDoc = await tx.get(txRef);
        if (txDoc.exists) {
          return { status: "already_awarded", points: 0 };
        }
        tx.set(txRef, {
          userId: userToAward,
          action,
          points: pointsToAward,
          timestamp: FieldValue.serverTimestamp(),
          grantedBy: uid,
        });
      }

      const userRef = db.collection("users").doc(userToAward);
      tx.set(
        userRef,
        { points: FieldValue.increment(pointsToAward) },
        { merge: true }
      );

      let message = `You earned ${pointsToAward} points!`;
      if (action === "referral")
        message = `Someone used your referral code! You earned ${pointsToAward} points.`;
      if (action === "profile_completion")
        message = `Profile completed! You earned ${pointsToAward} points.`;

      const notificationRef = db.collection("notifications").doc();
      tx.set(notificationRef, {
        userId: userToAward,
        title: "Points Earned",
        message,
        type: "system",
        priority: "low",
        category: "social",
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { status: "success", points_awarded: pointsToAward };
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[Gamification API] Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}
