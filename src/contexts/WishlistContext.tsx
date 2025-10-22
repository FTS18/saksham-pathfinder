import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (id: string) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  isWishlisted: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser: user } = useSafeAuth();
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log('📂 Loading wishlist from Firestore for user:', user.uid);
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data();
        if (profile?.wishlist && Array.isArray(profile.wishlist)) {
          console.log('✅ Wishlist loaded from Firestore:', profile.wishlist);
          setWishlist(profile.wishlist);
          localStorage.setItem('wishlist', JSON.stringify(profile.wishlist));
        } else {
          console.log('ℹ️ No wishlist in Firestore, keeping localStorage');
        }
      } else {
        console.log('ℹ️ Profile document not found in Firestore');
      }
    } catch (error) {
      console.error('❌ Error loading wishlist from Firestore:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveWishlist = async (newWishlist: string[]) => {
    console.log('💾 Saving wishlist to localStorage and Firestore:', newWishlist);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    if (user) {
      try {
        const docRef = doc(db, 'profiles', user.uid);
        await updateDoc(docRef, { wishlist: newWishlist });
        console.log('✅ Wishlist saved to Firestore');
      } catch (error) {
        console.error('❌ Error saving wishlist to Firestore:', error);
        // Still consider it saved in localStorage so user doesn't lose data
      }
    } else {
      console.log('ℹ️ User not logged in, saved to localStorage only');
    }
  };

  const addToWishlist = async (id: string) => {
    const newWishlist = [...wishlist, id];
    setWishlist(newWishlist);
    await saveWishlist(newWishlist);
  };

  const removeFromWishlist = async (id: string) => {
    const newWishlist = wishlist.filter(itemId => itemId !== id);
    setWishlist(newWishlist);
    await saveWishlist(newWishlist);
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};
