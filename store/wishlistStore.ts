import { create } from "zustand"

interface WishlistState {
  items: string[]
  loaded: boolean
  toggle: (productId: string) => Promise<void>
  load: () => Promise<void>
  has: (productId: string) => boolean
}

function getLocalWishlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("vchuki_wishlist") || "[]")
  } catch {
    return []
  }
}

function setLocalWishlist(items: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("vchuki_wishlist", JSON.stringify(items))
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
      if (data.wishlist && data.wishlist.length > 0) {
        set({ items: data.wishlist, loaded: true })
        return
      }
    } catch { /* silent */ }
    // Fallback to localStorage for non-logged-in users
    set({ items: getLocalWishlist(), loaded: true })
  },
  toggle: async (productId: string) => {
    const current = get().items
    const isInList = current.includes(productId)
    const newItems = isInList ? current.filter((id) => id !== productId) : [...current, productId]

    // Optimistic update
    set({ items: newItems })
    // Always save to localStorage (works without login)
    setLocalWishlist(newItems)

    // Try to sync with server
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      })
      if (!res.ok) {
        // Server rejected (401 not logged in) — keep localStorage version, don't revert
        // Wishlist still works locally
      }
    } catch {
      // Network error — keep localStorage version
    }
  },
}))
