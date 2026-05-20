import { useCartStore } from '@/store/cartStore'
import type { CartItem } from '@/types'

export function useCart() {
  const { items, addItem, updateQuantity, removeItem, clearCart } = useCartStore()

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity: number }) => {
    addItem(item)
  }

  return {
    items,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  }
}
