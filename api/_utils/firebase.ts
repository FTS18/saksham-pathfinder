import * as admin from "firebase-admin";

// Singleton Firebase Admin initialization
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
      });
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to projectId");
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "hexaforces",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
  } else {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "hexaforces",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export const db = admin.firestore();
export { admin };
