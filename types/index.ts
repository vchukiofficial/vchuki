export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  basePrice: number
  comparePrice?: number
  images: string[]
  category: string
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  rating?: number
  reviewsCount?: number
  isBestSeller?: boolean
  variants?: ProductVariant[]
  createdAt?: string
}

export interface ProductVariant {
  _id: string
  product: string
  color: { name: string; hex: string }
  size: string
  fabric: string
  fit: 'slim' | 'regular' | 'relaxed'
  stock: number
  priceAdjustment: number
  sku: string
  images: string[]
}

export type CartItem = {
  _id: string
  name: string
  slug: string
  images: string[]
  price: number
  quantity: number
  sku: string
  variantId: string
  size: string
  color: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  addresses: Address[]
  wishlist: string[]
  createdAt?: string
}

export interface Address {
  _id?: string
  name: string
  street: string
  city: string
  state: string
  zip: string
  phone: string
}

export interface Order {
  _id: string
  user: string | User
  items: OrderItem[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  couponCode?: string
  shippingAddress: Address
  paymentMethod: 'razorpay' | 'stripe' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed'
  paymentId?: string
  shippingStatus: 'pending' | 'confirmed' | 'packaging' | 'dispatched' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled'
  timeline: { event: string; timestamp: string }[]
  createdAt: string
}

export interface OrderItem {
  product: string
  variant: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
}

export interface Coupon {
  _id: string
  code: string
  type: 'flat' | 'percentage' | 'bxgy' | 'free_shipping' | 'first_order' | 'category' | 'festival'
  value: number
  maxValue?: number
  minAmount?: number
  validFrom: string
  validTo: string
  usageLimit: number
  usedBy: string[]
  categories?: string[]
  isActive: boolean
}

export interface Review {
  _id: string
  product: string | Product
  user: string | User
  rating: number
  comment?: string
  images?: string[]
  verifiedPurchase: boolean
  createdAt: string
}
