import { create } from "zustand"
import type { Product, Order, User, Coupon, Review } from "@/types"

interface AdminState {
  // Data
  products: Product[]
  orders: Order[]
  users: User[]
  coupons: Coupon[]
  reviews: Review[]
  stats: { revenue: number; totalOrders: number; totalProducts: number; totalUsers: number } | null

  // Loading
  loading: { products: boolean; orders: boolean; users: boolean; coupons: boolean; reviews: boolean; stats: boolean }

  // Actions
  fetchProducts: () => Promise<void>
  fetchOrders: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchCoupons: () => Promise<void>
  fetchReviews: () => Promise<void>
  fetchStats: () => Promise<void>

  // Mutations
  deleteProduct: (id: string) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  createProduct: (data: any) => Promise<Product | null>
  updateOrderStatus: (id: string, status: string) => Promise<void>
  updatePaymentStatus: (id: string, status: string) => Promise<void>
  updateUserRole: (id: string, role: string) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  createCoupon: (data: any) => Promise<Coupon | null>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  products: [],
  orders: [],
  users: [],
  coupons: [],
  reviews: [],
  stats: null,
  loading: { products: true, orders: true, users: true, coupons: true, reviews: true, stats: true },

  fetchProducts: async () => {
    set((s) => ({ loading: { ...s.loading, products: true } }))
    const res = await fetch("/api/products?limit=500&admin=true")
    const data = await res.json()
    set((s) => ({ products: data.products || [], loading: { ...s.loading, products: false } }))
  },

  fetchOrders: async () => {
    set((s) => ({ loading: { ...s.loading, orders: true } }))
    const res = await fetch("/api/orders")
    const data = await res.json()
    set((s) => ({ orders: data.orders || [], loading: { ...s.loading, orders: false } }))
  },

  fetchUsers: async () => {
    set((s) => ({ loading: { ...s.loading, users: true } }))
    const res = await fetch("/api/users")
    const data = await res.json()
    set((s) => ({ users: data.users || [], loading: { ...s.loading, users: false } }))
  },

  fetchCoupons: async () => {
    set((s) => ({ loading: { ...s.loading, coupons: true } }))
    const res = await fetch("/api/coupons")
    const data = await res.json()
    set((s) => ({ coupons: data.coupons || [], loading: { ...s.loading, coupons: false } }))
  },

  fetchReviews: async () => {
    set((s) => ({ loading: { ...s.loading, reviews: true } }))
    const res = await fetch("/api/reviews")
    const data = await res.json()
    set((s) => ({ reviews: data.reviews || [], loading: { ...s.loading, reviews: false } }))
  },

  fetchStats: async () => {
    set((s) => ({ loading: { ...s.loading, stats: true } }))
    const res = await fetch("/api/admin/stats")
    const data = await res.json()
    set((s) => ({ stats: data.stats, loading: { ...s.loading, stats: false } }))
  },

  deleteProduct: async (id) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) {
      set((s) => ({ products: s.products.filter((p) => p._id !== id) }))
    }
  },

  updateProduct: async (id, data) => {
    await fetch(`/api/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    set((s) => ({ products: s.products.map((p) => (p._id === id ? { ...p, ...data } : p)) }))
  },

  createProduct: async (data) => {
    const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) return null
    const product = await res.json()
    set((s) => ({ products: [product, ...s.products] }))
    return product
  },

  updateOrderStatus: async (id, status) => {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingStatus: status }) })
    set((s) => ({ orders: s.orders.map((o) => (o._id === id ? { ...o, shippingStatus: status as any } : o)) }))
  },

  updatePaymentStatus: async (id, status) => {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentStatus: status }) })
    set((s) => ({ orders: s.orders.map((o) => (o._id === id ? { ...o, paymentStatus: status as any } : o)) }))
  },

  updateUserRole: async (id, role) => {
    await fetch(`/api/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) })
    set((s) => ({ users: s.users.map((u) => (u._id === id ? { ...u, role: role as any } : u)) }))
  },

  deleteReview: async (id) => {
    await fetch(`/api/reviews/${id}`, { method: "DELETE" })
    set((s) => ({ reviews: s.reviews.filter((r) => r._id !== id) }))
  },

  createCoupon: async (data) => {
    const res = await fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) return null
    const coupon = await res.json()
    set((s) => ({ coupons: [coupon, ...s.coupons] }))
    return coupon
  },
}))
