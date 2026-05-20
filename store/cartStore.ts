import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@/types"

interface CartState {
  items: CartItem[]
  totalItems: number
  discount: number
  couponCode: string | null
  addItem: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number) => void
  clearCoupon: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      discount: 0,
      couponCode: null,
      addItem: (newItem) => {
        const { items } = get()
        const key = newItem._id + newItem.sku
        const existing = items.find((i) => i._id + i.sku === key)
        if (existing) {
          set({ items: items.map((i) => (i._id + i.sku === key ? { ...i, quantity: i.quantity + newItem.quantity } : i)) })
        } else {
          set({ items: [...items, newItem] })
        }
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return
        set((s) => ({ items: s.items.map((i) => (i._id === id ? { ...i, quantity } : i)) }))
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i._id !== id) })),
      clearCart: () => set({ items: [], discount: 0, couponCode: null }),
      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      clearCoupon: () => set({ couponCode: null, discount: 0 }),
    }),
    { name: "vchuki-cart" }
  )
)
