import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  add: (item: Omit<CartItem, 'key' | 'quantity'>, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      add: (item, qty = 1) => {
        const key = `${item.productId}-${item.variantId}`;
        const items = get().items;
        const existing = items.find((i) => i.key === key);
        const next = existing
          ? items.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + qty, i.maxStock || 99) } : i))
          : [...items, { ...item, key, quantity: qty }];
        // The coupon was validated against the old subtotal; ask again at checkout.
        set({ items: next, couponCode: null, couponDiscount: 0 });
      },
      setQty: (key, qty) => {
        if (qty < 1) return;
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity: Math.min(qty, i.maxStock || 99) } : i)),
          couponCode: null,
          couponDiscount: 0,
        });
      },
      remove: (key) => set({ items: get().items.filter((i) => i.key !== key), couponCode: null, couponDiscount: 0 }),
      clear: () => set({ items: [], couponCode: null, couponDiscount: 0 }),
      applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
    }),
    { name: 'vchuki-cart', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const useCartCount = () => useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
