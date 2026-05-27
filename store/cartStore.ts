import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@/types"
import { calculateComboDiscount, type CartItemForCombo } from "@/lib/comboOffers"

interface CartState {
  items: CartItem[]
  totalItems: number
  discount: number
  comboDiscount: number
  comboLabel: string | null
  couponCode: string | null
  addItem: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  applyCoupon: (code: string, discount: number) => void
  clearCoupon: () => void
}

function recalcCombo(items: CartItem[]) {
  const comboItems: CartItemForCombo[] = items.map((i) => ({
    _id: i._id,
    name: i.name,
    price: i.price,
    quantity: i.quantity,
    size: i.size,
    category: i.slug,
  }))
  return calculateComboDiscount(comboItems)
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      discount: 0,
      comboDiscount: 0,
      comboLabel: null,
      couponCode: null,
      addItem: (newItem) => {
        const { items } = get()
        const key = newItem._id + newItem.sku
        const existing = items.find((i) => i._id + i.sku === key)
        let updated: CartItem[]
        if (existing) {
          updated = items.map((i) => (i._id + i.sku === key ? { ...i, quantity: i.quantity + newItem.quantity } : i))
        } else {
          updated = [...items, newItem]
        }
        const combo = recalcCombo(updated)
        set({ items: updated, comboDiscount: combo.discount, comboLabel: combo.appliedOffer })
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return
        const updated = get().items.map((i) => (i._id === id ? { ...i, quantity } : i))
        const combo = recalcCombo(updated)
        set({ items: updated, comboDiscount: combo.discount, comboLabel: combo.appliedOffer })
      },
      removeItem: (id) => {
        const updated = get().items.filter((i) => i._id !== id)
        const combo = recalcCombo(updated)
        set({ items: updated, comboDiscount: combo.discount, comboLabel: combo.appliedOffer })
      },
      clearCart: () => set({ items: [], discount: 0, comboDiscount: 0, comboLabel: null, couponCode: null }),
      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      clearCoupon: () => set({ couponCode: null, discount: 0 }),
    }),
    { name: "vchuki-cart" }
  )
)
