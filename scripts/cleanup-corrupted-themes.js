#!/usr/bin/env node

/**
 * Cleanup script to fix corrupted theme values in Firestore
 * Run this once to clean up all user preferences with invalid theme data
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../firebase-key.json');
let serviceAccount;

try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('❌ Firebase service account key not found at:', serviceAccountPath);
  console.log('📝 To use this script:');
  console.log('1. Download your Firebase service account key from Firebase Console');
  console.log('2. Save it as firebase-key.json in the project root');
  console.log('3. Run this script again');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function cleanupCorruptedThemes() {
  console.log('🔍 Scanning userPreferences collection for corrupted theme values...\n');

  try {
    const userPrefsRef = db.collection('userPreferences');
    const snapshot = await userPrefsRef.get();

    let corruptedCount = 0;
    let fixedCount = 0;
    const validThemes = ['light', 'dark'];
    const validColors = ['blue', 'grey', 'red', 'yellow', 'green'];

    // Process each user preference document
    for (const doc of snapshot.docs) {
      const data = doc.data();
      let needsUpdate = false;
      const updates = {};

      // Check theme field
      if (data.theme && !validThemes.includes(data.theme)) {
        console.log(`⚠️  User ${doc.id}: Invalid theme "${data.theme}"`);
        updates.theme = 'dark'; // Reset to default
        needsUpdate = true;
        corruptedCount++;
      }

      // Check colorTheme field
      if (data.colorTheme && !validColors.includes(data.colorTheme)) {
        console.log(`⚠️  User ${doc.id}: Invalid colorTheme "${data.colorTheme}"`);
        updates.colorTheme = 'blue'; // Reset to default
        needsUpdate = true;
        corruptedCount++;
      }

      // Apply updates if needed
      if (needsUpdate) {
        await userPrefsRef.doc(doc.id).update(updates);
        console.log(`✅ Fixed user ${doc.id}\n`);
        fixedCount++;
      }
    }

    // Also check profiles collection for corrupted theme values
    console.log('\n📋 Checking profiles collection...\n');
    const profilesRef = db.collection('profiles');
    const profileSnapshot = await profilesRef.get();

    for (const doc of profileSnapshot.docs) {
      const data = doc.data();
      let needsUpdate = false;
      const updates = {};

      if (data.theme && !validThemes.includes(data.theme)) {
        console.log(`⚠️  Profile ${doc.id}: Invalid theme "${data.theme}"`);
        updates.theme = 'dark';
        needsUpdate = true;
        corruptedCount++;
      }

      if (data.colorTheme && !validColors.includes(data.colorTheme)) {
        console.log(`⚠️  Profile ${doc.id}: Invalid colorTheme "${data.colorTheme}"`);
        updates.colorTheme = 'blue';
        needsUpdate = true;
        corruptedCount++;
      }

      if (needsUpdate) {
        await profilesRef.doc(doc.id).update(updates);
        console.log(`✅ Fixed profile ${doc.id}\n`);
        fixedCount++;
      }
    }

    console.log('\n✨ Cleanup Summary:');
    console.log(`   Found: ${corruptedCount} corrupted entries`);
    console.log(`   Fixed: ${fixedCount} entries`);
    console.log('\n✅ Cleanup complete! Users can now log in and their themes will display correctly.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

// Run the cleanup
cleanupCorruptedThemes().catch(console.error);
