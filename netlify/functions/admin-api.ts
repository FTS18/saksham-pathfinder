import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Singleton)
if (!admin.apps.length) {
  try {
    // Attempt to initialize using standard environment variables (e.g. set in Netlify UI)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountJson) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccountJson))
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Attempting default application credentials.");
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

export const handler: Handler = async (event) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the caller's token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // ONLY existing admins can assign the recruiter role!
    // In production, the very first admin needs to be set manually via a script
    if (decodedToken.admin !== true) {
      return { 
        statusCode: 403, 
        headers, 
        body: JSON.stringify({ error: 'Forbidden. Only admins can assign roles.' }) 
      };
    }

    const { targetUid, role, assign = true } = JSON.parse(event.body || '{}');

    if (!targetUid || !role) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing targetUid or role' }) };
    }

    if (role !== 'recruiter' && role !== 'admin') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid role' }) };
    }

    // Get existing claims to avoid overwriting them
    const userRecord = await admin.auth().getUser(targetUid);
    const existingClaims = userRecord.customClaims || {};
    
    const newClaims = {
      ...existingClaims,
      [role]: assign
    };

    // Set the new claims
    await admin.auth().setCustomUserClaims(targetUid, newClaims);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `Successfully set ${role} claim to ${assign} for user ${targetUid}` 
      })
    };
  } catch (error: any) {
    console.error('Admin API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
