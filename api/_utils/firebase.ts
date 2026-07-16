import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Singleton Firebase Admin initialization
if (!getApps().length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountJson) {
    try {
      initializeApp({
        credential: cert(JSON.parse(serviceAccountJson)),
      });
    } catch (e) {
      console.warn("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY, falling back to projectId");
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "hexaforces",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
  } else {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "hexaforces",
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export const db = getFirestore();
export const auth = getAuth();
export { FieldValue };
