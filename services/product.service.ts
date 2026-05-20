import { apiClient } from '@/lib/api-client'

export interface Product {
  _id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
  colors: string[]
  sizes: string[]
  stock: number
}

export async function getProducts(filters: {
  category?: string
  color?: string
  size?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}) {
  return apiClient<Product[]>('/products', {
    method: 'POST',
    body: JSON.stringify(filters),
  })
}

export async function getProductBySlug(slug: string) {
  return apiClient<Product>(`/products/slug/${slug}`)
}

export async function getFeaturedProducts(limit = 8) {
  return apiClient<Product[]>(`/products/featured?limit=${limit}`)
}

export async function getBestSellers() {
  return apiClient<Product[]>('/products/bestsellers')
}

export async function searchProducts(query: string, options: { page?: number; limit?: number } = {}) {
  return apiClient<Product[]>(`/products/search?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  })
}
