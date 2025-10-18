#!/usr/bin/env node

/**
 * Firestore Theme Cleanup - Fix all corrupted theme values for all users
 * Uses Firebase REST API - no credentials needed if you have Firebase deployed
 * 
 * Usage:
 *   npm run cleanup:themes
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const projectId = 'saksham-ai-81c3a';
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

// Read Firebase config from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

let firebaseConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.includes('VITE_FIREBASE')) {
      const [key, value] = line.split('=');
      firebaseConfig[key.trim()] = value.trim();
    }
  }
}

const apiKey = firebaseConfig.VITE_FIREBASE_API_KEY;

if (!apiKey) {
  console.error('❌ Firebase API key not found in .env.local');
  process.exit(1);
}

async function getAllDocuments(collectionName) {
  try {
    const response = await fetch(
      `${baseUrl}/${collectionName}?key=${apiKey}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error.message);
    return [];
  }
}

async function updateDocument(collectionName, documentId, updates) {
  try {
    const docUrl = `${baseUrl}/${collectionName}/${documentId}`;
    
    // Get current document
    const getResponse = await fetch(`${docUrl}?key=${apiKey}`, { method: 'GET' });
    if (!getResponse.ok) return false;
    
    const currentDoc = await getResponse.json();
    
    // Merge updates
    const fields = currentDoc.fields || {};
    for (const [key, value] of Object.entries(updates)) {
      fields[key] = { stringValue: value };
    }
    
    // Update document
    const updateBody = {
      fields: fields
    };
    
    const updateResponse = await fetch(
      `${docUrl}?key=${apiKey}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody)
      }
    );
    
    return updateResponse.ok;
  } catch (error) {
    console.error(`Error updating ${collectionName}/${documentId}:`, error.message);
    return false;
  }
}

async function cleanupAllUserThemes() {
  console.log('\n' + '='.repeat(50));
  console.log('🔧 FIRESTORE THEME CLEANUP - ALL USERS');
  console.log('='.repeat(50) + '\n');

  try {
    let totalCorrupted = 0;
    let totalFixed = 0;
    const validThemes = ['light', 'dark'];
    const validColors = ['blue', 'grey', 'red', 'yellow', 'green'];

    // ====== Fix userPreferences collection ======
    console.log('📋 Checking userPreferences collection...\n');
    
    const userPrefs = await getAllDocuments('userPreferences');
    let userPrefsUpdateCount = 0;

    for (const doc of userPrefs) {
      const docName = doc.name.split('/').pop();
      const fields = doc.fields || {};
      
      const theme = fields.theme?.stringValue;
      const colorTheme = fields.colorTheme?.stringValue;
      
      const updates = {};
      let needsUpdate = false;

      if (theme && !validThemes.includes(theme)) {
        console.log(`  ⚠️  User ${docName}: Invalid theme "${theme}"`);
        updates.theme = 'dark';
        needsUpdate = true;
        totalCorrupted++;
      }

      if (colorTheme && !validColors.includes(colorTheme)) {
        console.log(`  ⚠️  User ${docName}: Invalid colorTheme "${colorTheme}"`);
        updates.colorTheme = 'blue';
        needsUpdate = true;
        totalCorrupted++;
      }

      if (needsUpdate) {
        const success = await updateDocument('userPreferences', docName, updates);
        if (success) userPrefsUpdateCount++;
      }
    }

    if (userPrefsUpdateCount > 0) {
      console.log(`✅ Fixed ${userPrefsUpdateCount} userPreferences documents\n`);
      totalFixed += userPrefsUpdateCount;
    } else {
      console.log('✅ No corrupted userPreferences found\n');
    }

    // ====== Fix profiles collection ======
    console.log('📋 Checking profiles collection...\n');
    
    const profiles = await getAllDocuments('profiles');
    let profilesUpdateCount = 0;

    for (const doc of profiles) {
      const docName = doc.name.split('/').pop();
      const fields = doc.fields || {};
      
      const theme = fields.theme?.stringValue;
      const colorTheme = fields.colorTheme?.stringValue;
      
      const updates = {};
      let needsUpdate = false;

      if (theme && !validThemes.includes(theme)) {
        console.log(`  ⚠️  Profile ${docName}: Invalid theme "${theme}"`);
        updates.theme = 'dark';
        needsUpdate = true;
        totalCorrupted++;
      }

      if (colorTheme && !validColors.includes(colorTheme)) {
        console.log(`  ⚠️  Profile ${docName}: Invalid colorTheme "${colorTheme}"`);
        updates.colorTheme = 'blue';
        needsUpdate = true;
        totalCorrupted++;
      }

      if (needsUpdate) {
        const success = await updateDocument('profiles', docName, updates);
        if (success) profilesUpdateCount++;
      }
    }

    if (profilesUpdateCount > 0) {
      console.log(`✅ Fixed ${profilesUpdateCount} profile documents\n`);
      totalFixed += profilesUpdateCount;
    } else {
      console.log('✅ No corrupted profiles found\n');
    }

    // ====== Summary ======
    console.log('\n' + '='.repeat(50));
    console.log('✨ CLEANUP SUMMARY');
    console.log('='.repeat(50));
    console.log(`  Total corrupted entries found: ${totalCorrupted}`);
    console.log(`  Total documents fixed: ${totalFixed}`);
    console.log('='.repeat(50) + '\n');

    if (totalFixed > 0) {
      console.log('✅ Cleanup complete!');
      console.log('📱 All users should now see their themes work correctly');
      console.log('🔄 Users may need to refresh their browsers or log out and back in\n');
    } else {
      console.log('✅ No corrupted data found - everything looks good!\n');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run the cleanup
cleanupAllUserThemes().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
