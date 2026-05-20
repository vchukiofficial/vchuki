import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  discount: number
  couponCode: string | null
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity: number }) => void
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
      totalAmount: 0,
      discount: 0,
      couponCode: null,
      addItem: (newItem) => {
        const { items } = get()
        const existing = items.find(item => item._id === newItem._id && item.sku === newItem.sku)
        
        if (existing) {
          set({
            items: items.map(item =>
              item._id === newItem._id && item.sku === newItem.sku
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            )
          })
        } else {
          set({ items: [...items, newItem] })
        }
      },
      updateQuantity: (id, quantity) => {
        set(state => ({
          items: state.items.map(item =>
            item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        }))
      },
      removeItem: (id) => set(state => ({ items: state.items.filter(item => item._id !== id) })),
      clearCart: () => set({ items: [], totalItems: 0, totalAmount: 0, discount: 0, couponCode: null }),
      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      clearCoupon: () => set({ couponCode: null, discount: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
)

export const useCartTotal = () => {
  const { items, discount } = useCartStore()
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return {
    subtotal,
    discount,
    total: subtotal - discount,
    shipping: 50,
    finalTotal: subtotal - discount + 50
  }
}
