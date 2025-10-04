// Migration script to move internships from JSON to Firebase
// Run this script: node scripts/migrate-internships.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.projectId) {
  console.error('❌ Firebase configuration missing. Please check your .env file.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateInternships() {
  try {
    console.log('🚀 Starting internship migration...');
    
    const ADMIN_USER_ID = 'admin@gmail.com';
    
    // Ensure admin user document exists
    const adminUserRef = doc(db, 'users', ADMIN_USER_ID);
    await setDoc(adminUserRef, {
      email: ADMIN_USER_ID,
      displayName: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    console.log('✅ Admin user document ensured');
    
    // Read the JSON file
    const jsonPath = path.join(__dirname, '../public/internships.json');
    const internshipsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📊 Found ${internshipsData.length} internships to migrate`);
    
    const batch = writeBatch(db);
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < internshipsData.length; i++) {
      const internship = internshipsData[i];
      
      // Transform data for Firebase
      const firestoreInternship = {
        pmis_id: internship.pmis_id,
        title: internship.title,
        role: internship.role,
        company: internship.company,
        location: internship.location,
        stipend: internship.stipend,
        duration: internship.duration,
        sector_tags: internship.sector_tags || [],
        required_skills: internship.required_skills || [],
        preferred_education_levels: internship.preferred_education_levels || [],
        work_mode: internship.work_mode,
        type: internship.type || 'Internship',
        openings: internship.openings || 1,
        featured: internship.featured || false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        applicationCount: 0,
        viewCount: 0
      };

      // Only add fields that are not undefined
      if (internship.description) firestoreInternship.description = internship.description;
      if (internship.responsibilities) firestoreInternship.responsibilities = internship.responsibilities;
      if (internship.perks) firestoreInternship.perks = internship.perks;
      if (internship.application_deadline) firestoreInternship.application_deadline = internship.application_deadline;
      if (internship.posted_date) firestoreInternship.posted_date = internship.posted_date;
      if (internship.apply_link) firestoreInternship.apply_link = internship.apply_link;
      if (internship.logo) firestoreInternship.logo = internship.logo;
      
      const docRef = doc(collection(db, 'users', ADMIN_USER_ID, 'internships'));
      batch.set(docRef, firestoreInternship);
      batchCount++;
      
      // Commit batch when it reaches the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`✅ Migrated batch: ${i + 1}/${internshipsData.length}`);
        batchCount = 0;
      }
    }
    
    // Commit remaining items
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log(`📈 Total internships migrated: ${internshipsData.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateInternships();