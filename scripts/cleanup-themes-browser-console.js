/**
 * Browser Console Cleanup Script
 * 
 * Copy and paste this entire code into your browser's developer console
 * (Press F12, go to Console tab, paste this, and press Enter)
 * 
 * This will fix corrupted theme values in Firestore for your logged-in user
 */

(async function cleanupThemeForCurrentUser() {
  const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
  
  const auth = getAuth();
  const db = getFirestore();
  
  if (!auth.currentUser) {
    console.log(' Not logged in. Please log in first.');
    return;
  }

  const userId = auth.currentUser.uid;
  console.log(' Cleaning up theme for user:', userId);

  try {
    // Fix userPreferences
    const userPrefsRef = doc(db, 'userPreferences', userId);
    const updatedPrefs = {
      theme: 'dark',
      colorTheme: 'blue'
    };
    await updateDoc(userPrefsRef, updatedPrefs);
    console.log(' Fixed userPreferences');

    // Fix profile
    const profileRef = doc(db, 'profiles', userId);
    const updatedProfile = {
      theme: 'dark',
      colorTheme: 'blue'
    };
    await updateDoc(profileRef, updatedProfile);
    console.log(' Fixed profile');

    // Clear corrupted localStorage
    localStorage.removeItem('theme');
    localStorage.removeItem('colorTheme');
    console.log(' Cleared localStorage');

    console.log('\n Cleanup complete! Reloading page...');
    setTimeout(() => window.location.reload(), 1000);

  } catch (error) {
    console.error(' Error during cleanup:', error);
  }
})();
