import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';

export const deleteUserAccount = async (userId: string) => {
  try {
    const batch = writeBatch(db);
    
    // Delete user profile
    const profileRef = doc(db, 'profiles', userId);
    batch.delete(profileRef);
    
    // Delete recruiter profile if exists
    const recruiterRef = doc(db, 'recruiters', userId);
    batch.delete(recruiterRef);
    
    // Delete user's applications
    const applicationsQuery = query(collection(db, 'applications'), where('userId', '==', userId));
    const applicationsSnapshot = await getDocs(applicationsQuery);
    applicationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete user's referrals
    const referralsQuery = query(collection(db, 'referrals'), where('referrerId', '==', userId));
    const referralsSnapshot = await getDocs(referralsQuery);
    referralsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete user's notifications
    const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    notificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete user's feedback/reviews
    const feedbackQuery = query(collection(db, 'feedback'), where('userId', '==', userId));
    const feedbackSnapshot = await getDocs(feedbackQuery);
    feedbackSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Commit all deletions
    await batch.commit();
    
    // Delete user's files from storage
    try {
      const userStorageRef = ref(storage, `users/${userId}`);
      const filesList = await listAll(userStorageRef);
      
      const deletePromises = filesList.items.map(fileRef => deleteObject(fileRef));
      await Promise.all(deletePromises);
    } catch (storageError) {
      console.warn('Storage deletion failed:', storageError);
    }
    
    // Finally delete the user account
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await deleteUser(auth.currentUser);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Account deletion failed:', error);
    throw error;
  }
};