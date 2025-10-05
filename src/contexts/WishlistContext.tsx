import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSafeAuth } from '@/hooks/useSafeAuth';
import UserPreferencesService from '@/services/userPreferencesService';
import { doc, updateDoc } from 'firebase/firestore';
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
      await UserPreferencesService.syncLocalToFirebase(user.uid);
      const preferences = await UserPreferencesService.getUserPreferences(user.uid);
      setWishlist(preferences.wishlist || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    }
  };

  const saveWishlist = async (newWishlist: string[]) => {
    if (user) {
      try {
        const preferences = await UserPreferencesService.getUserPreferences(user.uid);
        const docRef = doc(db, 'userPreferences', user.uid);
        await updateDoc(docRef, { wishlist: newWishlist });
      } catch (error) {
        console.error('Error saving wishlist:', error);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      }
    } else {
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };

  const addToWishlist = async (id: string) => {
    if (user) {
      try {
        await UserPreferencesService.addToWishlist(user.uid, id);
        setWishlist(prev => [...prev, id]);
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        setWishlist(prev => {
          const newWishlist = [...prev, id];
          localStorage.setItem('wishlist', JSON.stringify(newWishlist));
          return newWishlist;
        });
      }
    } else {
      setWishlist(prev => {
        const newWishlist = [...prev, id];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      });
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (user) {
      try {
        await UserPreferencesService.removeFromWishlist(user.uid, id);
        setWishlist(prev => prev.filter(itemId => itemId !== id));
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        setWishlist(prev => {
          const newWishlist = prev.filter(itemId => itemId !== id);
          localStorage.setItem('wishlist', JSON.stringify(newWishlist));
          return newWishlist;
        });
      }
    } else {
      setWishlist(prev => {
        const newWishlist = prev.filter(itemId => itemId !== id);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      });
    }
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
};
