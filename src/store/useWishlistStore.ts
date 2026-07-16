import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import UserPreferencesService from '@/services/userPreferencesService';

interface WishlistState {
  wishlist: string[];
  
  addToWishlist: (id: string, userId?: string) => void;
  removeFromWishlist: (id: string, userId?: string) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
  setWishlist: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],

      addToWishlist: (id: string, userId?: string) => {
        const { wishlist } = get();
        if (!wishlist.includes(id)) {
          const newIds = [...wishlist, id];
          set({ wishlist: newIds });
          
          if (userId) {
            UserPreferencesService.addToWishlist(userId, id).catch(console.error);
          }
        }
      },

      removeFromWishlist: (id: string, userId?: string) => {
        const { wishlist } = get();
        if (wishlist.includes(id)) {
          const newIds = wishlist.filter((itemId) => itemId !== id);
          set({ wishlist: newIds });
          
          if (userId) {
            UserPreferencesService.removeFromWishlist(userId, id).catch(console.error);
          }
        }
      },

      isWishlisted: (id: string) => {
        return get().wishlist.includes(id);
      },

      clearWishlist: () => set({ wishlist: [] }),
      
      setWishlist: (ids: string[]) => set({ wishlist: ids }),
    }),
    {
      name: 'wishlist', // name of the item in the storage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
