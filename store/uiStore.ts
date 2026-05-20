import { create } from 'zustand'

interface UIState {
  isCartOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  loading: boolean
  setCartOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  toggleCart: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  loading: false,
  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setLoading: (loading) => set({ loading }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}))
