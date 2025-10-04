import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
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
  const { user } = useSafeAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadWishlist();
    } else {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setWishlist(userData.wishlist || []);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const saveWishlist = async (newWishlist: string[]) => {
    if (user) {
      try {
        const docRef = doc(db, 'profiles', user.uid);
        await updateDoc(docRef, { wishlist: newWishlist });
      } catch (error) {
        console.error('Error saving wishlist:', error);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      }
    } else {
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };

  const addToWishlist = (id: string) => {
    setWishlist(prev => {
      const newWishlist = [...prev, id];
      saveWishlist(newWishlist);
      return newWishlist;
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => {
      const newWishlist = prev.filter(itemId => itemId !== id);
      saveWishlist(newWishlist);
      return newWishlist;
    });
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};
