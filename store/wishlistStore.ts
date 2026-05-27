import { create } from "zustand"

interface WishlistState {
  items: string[]
  loaded: boolean
  toggle: (productId: string) => Promise<void>
  load: () => Promise<void>
  has: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loaded: false,
  has: (productId: string) => get().items.includes(productId),
  load: async () => {
    if (get().loaded) return
    try {
      const res = await fetch("/api/wishlist")
      const data = await res.json()
      set({ items: data.wishlist || [], loaded: true })
    } catch {
      set({ loaded: true })
    }
  },
  toggle: async (productId: string) => {
    // Optimistic update
    const current = get().items
    const isInList = current.includes(productId)
    set({ items: isInList ? current.filter((id) => id !== productId) : [...current, productId] })

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) {
        // Revert on error
        set({ items: current })
      }
    } catch {
      set({ items: current })
    }
  },
}))
