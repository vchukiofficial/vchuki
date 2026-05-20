import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  items: string[] // product IDs
  toggleItem: (id: string) => void
  addItem: (id: string) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (id) => {
        const { items } = get()
        if (items.includes(id)) {
          set({ items: items.filter(itemId => itemId !== id) })
        } else {
          set({ items: [...items, id] })
        }
      },
      addItem: (id) => set(state => ({ items: [...state.items, id] })),
      removeItem: (id) => set(state => ({ items: state.items.filter(itemId => itemId !== id) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
)
