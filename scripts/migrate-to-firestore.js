import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Firebase config - replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyDNsLEbkPhxOj7d255npjF_9qJ6ddsH-HQ",
  authDomain: "saksham-ai-81c3a.firebaseapp.com",
  projectId: "saksham-ai-81c3a",
  storageBucket: "saksham-ai-81c3a.firebasestorage.app",
  messagingSenderId: "915586746274",
  appId: "1:915586746274:web:274b9bfc0a07961fd9d4fb",
  measurementId: "G-CTR1NLXF77"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateInternships() {
  try {
    console.log('Starting migration...');
    
    // Read internships.json
    const dataPath = path.join(process.cwd(), 'public', 'internships.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log(`Found ${data.length} internships to migrate`);
    
    // Batch write to Firestore (max 500 per batch)
    const batchSize = 500;
    const batches = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = data.slice(i, i + batchSize);
      
      chunk.forEach((item) => {
        const docRef = doc(collection(db, 'internships'));
        batch.set(docRef, {
          ...item,
          id: docRef.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true
        });
      });
      
      batches.push(batch);
    }
    
    // Execute all batches
    for (let i = 0; i < batches.length; i++) {
      console.log(`Executing batch ${i + 1}/${batches.length}...`);
      await batches[i].commit();
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateInternships();