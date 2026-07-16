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
async function verifyAuth(
  headers: Record<string, string | string[] | undefined>
): Promise<string | null> {
  const authHeader = headers.authorization as string | undefined;
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

// Point configuration map
const POINT_VALUES: Record<string, number> = {
  profile_completion: 200,
  referral: 100,
  daily_login: 50,
  time_tracking: 100, // Awarded per 30 minutes
  application_submitted: 50,
};

export const handler: Handler = async (event, context) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // 1. Authenticate user
    const uid = await verifyAuth(event.headers);
    if (!uid) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { action, idempotencyKey, targetUid } = body;

    if (!action || !POINT_VALUES[action]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid action type" }),
      };
    }

    const pointsToAward = POINT_VALUES[action];
    const userToAward = targetUid || uid; // Target user (e.g. for referral)

    // 2. Secure Transaction for Idempotency (prevent double awarding)
    const result = await db.runTransaction(async (tx) => {
      if (idempotencyKey) {
        const txRef = db.collection("point_transactions").doc(`${userToAward}_${idempotencyKey}`);
        const txDoc = await tx.get(txRef);
        if (txDoc.exists) {
          // Already awarded points for this specific action instance
          return { status: "already_awarded", points: 0 };
        }
        tx.set(txRef, {
          userId: userToAward,
          action,
          points: pointsToAward,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          grantedBy: uid // who triggered it
        });
      }

      // 3. Update the user's point total securely
      const userRef = db.collection("users").doc(userToAward);
      tx.set(
        userRef,
        { points: admin.firestore.FieldValue.increment(pointsToAward) },
        { merge: true }
      );

      // 4. Send persistent notification
      let message = `You earned ${pointsToAward} points!`;
      if (action === 'referral') message = `Someone used your referral code! You earned ${pointsToAward} points.`;
      if (action === 'profile_completion') message = `Profile completed! You earned ${pointsToAward} points.`;

      const notificationRef = db.collection("notifications").doc();
      tx.set(notificationRef, {
        userId: userToAward,
        title: "Points Earned \u{1F389}",
        message,
        type: "system",
        priority: "low",
        category: "social",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { status: "success", points_awarded: pointsToAward };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (error: any) {
    console.error("[Gamification API] Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
