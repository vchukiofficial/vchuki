export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  basePrice: number
  images: string[]
  category: string
  tags: string[]
  rating: number
  reviewsCount: number
  isBestSeller?: boolean
  variants?: ProductVariant[]
}

export interface ProductVariant {
  _id: string
  productId: string
  color: {
    name: string
    hex: string
  }
  size: string
  fabric: string
  fit: string
  stock: number
  priceAdjustment: number
}

export type CartItem = Product & {
  quantity: number
  price: number
  sku: string
  variantId: string
  variant: ProductVariant
}
