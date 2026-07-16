import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Ensure you have FIREBASE_SERVICE_ACCOUNT_KEY in your .env file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountPath) {
  console.error("Error: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
  process.exit(1);
}

let serviceAccount;
try {
  // If it's a JSON string in the env var
  if (serviceAccountPath.startsWith('{')) {
    serviceAccount = JSON.parse(serviceAccountPath);
  } else {
    // If it's a path to a file
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }
} catch (error) {
  console.error("Error parsing service account key:", error);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const uid = process.argv[2];
const role = process.argv[3] || 'admin';

if (!uid) {
  console.error("Usage: node make-admin.mjs <uid> [role]");
  console.error("Example: node make-admin.mjs user123 admin");
  process.exit(1);
}

const setAdmin = async () => {
  try {
    const user = await getAuth().getUser(uid);
    const existingClaims = user.customClaims || {};
    
    await getAuth().setCustomUserClaims(uid, {
      ...existingClaims,
      [role]: true
    });
    
    console.log(`Success! Granted ${role} role to user ${uid} (${user.email})`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
};

setAdmin();
