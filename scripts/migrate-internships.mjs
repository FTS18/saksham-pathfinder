import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instructions for the user
console.log('--- INTERNSHIPS.JSON MIGRATION SCRIPT ---');
console.log('To run this script, you must have a service account key.');
console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
console.log('2. Click "Generate new private key"');
console.log('3. Save it as "serviceAccountKey.json" in the root directory.');
console.log('4. Run: node scripts/migrate-internships.mjs');
console.log('-----------------------------------------');

const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n[ERROR] serviceAccountKey.json not found!');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const internshipsPath = path.resolve(__dirname, '../src/data/internships.json');

async function migrate() {
  if (!fs.existsSync(internshipsPath)) {
    console.error('[ERROR] internships.json not found at', internshipsPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));
  const internships = Array.isArray(data) ? data : data.internships || [];
  
  console.log(Found  internships to migrate.);

  let successCount = 0;
  let errorCount = 0;
  
  const batchSize = 400; // Firestore limit is 500
  let batch = db.batch();
  let currentBatchCount = 0;

  for (const item of internships) {
    try {
      // Create a reference with a new auto-ID or use existing ID if present
      const docRef = item.id ? db.collection('internships').doc(item.id.toString()) : db.collection('internships').doc();
      
      const internshipData = {
        ...item,
        status: item.status || 'active',
        createdAt: FieldValue.serverTimestamp(),
        migratedAt: FieldValue.serverTimestamp(),
        source: 'legacy_json_migration',
      };
      
      batch.set(docRef, internshipData, { merge: true });
      currentBatchCount++;
      successCount++;

      if (currentBatchCount >= batchSize) {
        console.log(Committing batch of ...);
        await batch.commit();
        batch = db.batch();
        currentBatchCount = 0;
      }
    } catch (e) {
      console.error('Error preparing document:', e);
      errorCount++;
    }
  }

  if (currentBatchCount > 0) {
    console.log(Committing final batch of ...);
    await batch.commit();
  }

  console.log('Migration complete!');
  console.log(Successfully migrated: );
  console.log(Failed: );
  process.exit(0);
}

migrate().catch(console.error);
