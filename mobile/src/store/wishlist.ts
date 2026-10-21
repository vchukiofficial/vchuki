import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { api } from '@/lib/api';

/**
 * Same behaviour as the website: works signed-out (stored on the phone),
 * and syncs to the account (/api/wishlist) once signed in.
 */
interface WishlistState {
  ids: string[];
  toggle: (productId: string, signedIn: boolean) => Promise<boolean>;
  syncFromServer: () => Promise<void>;
  has: (id: string) => boolean;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      has: (id) => get().ids.includes(id),

      toggle: async (productId, signedIn) => {
        const was = get().ids.includes(productId);
        set({ ids: was ? get().ids.filter((i) => i !== productId) : [productId, ...get().ids] });
        if (signedIn) {
          try {
            const res = await api<{ wishlist: string[] }>('/api/wishlist', { method: 'POST', body: { productId } });
            set({ ids: res.wishlist.map(String) });
          } catch {
            /* keep the local change */
          }
        }
        return !was;
      },

      // After sign-in: push anything saved while signed out, then adopt the account's list
      syncFromServer: async () => {
        try {
          const local = get().ids;
          const { wishlist } = await api<{ wishlist: string[] }>('/api/wishlist');
          const server = wishlist.map(String);
          const missing = local.filter((id) => !server.includes(id));
          let final = server;
          for (const productId of missing) {
            const r = await api<{ wishlist: string[] }>('/api/wishlist', { method: 'POST', body: { productId } });
            final = r.wishlist.map(String);
          }
          set({ ids: final });
        } catch {
          /* offline */
        }
      },
    }),
    { name: 'vchuki-wishlist', storage: createJSONStorage(() => AsyncStorage), partialize: (s) => ({ ids: s.ids }) as any },
  ),
);
