import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, deleteObject, listAll } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';

export const deleteUserAccount = async (userId: string) => {
  try {
    // Clear all localStorage data first
    localStorage.clear();
    sessionStorage.clear();
    
    // Delete only essential user data
    try {
      const profileRef = doc(db, 'profiles', userId);
      await deleteDoc(profileRef);
    } catch (error) {
      console.warn('Failed to delete profile:', error);
    }
    
    // Delete applications
    try {
      const appsQuery = query(collection(db, 'applications'), where('userId', '==', userId));
      const appsSnapshot = await getDocs(appsQuery);
      const deletePromises = appsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn('Failed to delete applications:', error);
    }
    
    // Delete notifications
    try {
      const notifsQuery = query(collection(db, 'notifications'), where('userId', '==', userId));
      const notifsSnapshot = await getDocs(notifsQuery);
      const deletePromises = notifsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      console.warn('Failed to delete notifications:', error);
    }
    
    // Only delete auth and redirect if data deletion was successful
    if (auth.currentUser && auth.currentUser.uid === userId) {
      await deleteUser(auth.currentUser);
    }
    
    // Clear all storage and redirect to home
    localStorage.clear();
    sessionStorage.clear();
    
    // Force redirect to home page
    window.location.href = '/';
    
    return { success: true };
  } catch (error) {
    console.error('Account deletion failed:', error);
    throw error;
  }
};