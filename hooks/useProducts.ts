import type { Product } from '@/types'

// Placeholder for product query hook
// Will use SWR or TanStack Query later
export const useProducts = (_type?: string): { products: Product[]; isLoading: boolean; error: null } => {
  // Fetch from /api/products
  return {
    products: [],
    isLoading: false,
    error: null,
  }
}

export const useProduct = (slug: string) => {
  // Fetch from /api/products/[slug]
  return {
    product: null,
    variants: [],
    isLoading: false,
  }
}
