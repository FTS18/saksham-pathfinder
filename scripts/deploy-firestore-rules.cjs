#!/usr/bin/env node

/**
 * Quick script to deploy Firestore security rules
 * Run: node scripts/deploy-firestore-rules.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Deploying Firestore Security Rules...\n');

// Check if Firebase CLI is installed
try {
  execSync('firebase --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Firebase CLI not found. Installing...');
  execSync('npm install -g firebase-tools', { stdio: 'inherit' });
}

// Check if firebase.json exists
const firebaseConfigPath = path.join(process.cwd(), 'firebase.json');
if (!fs.existsSync(firebaseConfigPath)) {
  console.log('❌ firebase.json not found. Please run "firebase init" first.');
  process.exit(1);
}

// Check if firestore.rules exists
const rulesPath = path.join(process.cwd(), 'firestore.rules');
if (!fs.existsSync(rulesPath)) {
  console.log('❌ firestore.rules not found.');
  process.exit(1);
}

try {
  // Deploy only Firestore rules
  console.log('📤 Deploying production-ready Firestore rules...');
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('\n✅ Production-ready Firestore security rules deployed successfully!');
  console.log('🔐 Your app now has proper access controls and admin privileges.');
  
} catch (error) {
  console.error('\n❌ Failed to deploy Firestore rules:');
  console.error(error.message);
  
  console.log('\n🔧 Manual steps:');
  console.log('1. Go to Firebase Console → Firestore Database → Rules');
  console.log('2. Copy the content from firestore.rules file');
  console.log('3. Paste it in the rules editor');
  console.log('4. Click "Publish"');
}