export type Category = 'linen-full-sleeve' | 'linen-half-sleeve' | 'kurta-full-sleeve' | 'kurta-half-sleeve';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  comparePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
}

export interface Variant {
  _id: string;
  product: string;
  color: { name: string; hex: string };
  size: string;
  fabric?: string;
  fit?: 'slim' | 'regular' | 'relaxed';
  stock: number;
  priceAdjustment: number;
  sku?: string;
  barcode?: string;
  images: string[];
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  images: string[];
  verifiedPurchase: boolean;
  userName: string;
  createdAt: string;
}

export interface ProductDetail {
  product: Product;
  variants: Variant[];
  reviews: Review[];
  rating: { average: number; count: number };
  siblingColors: { name: string; hex: string; slug: string }[];
  related: Product[];
}

export interface Address {
  _id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  country?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  addresses: Address[];
  wishlist: string[];
}

export type ShippingStatus =
  | 'pending'
  | 'confirmed'
  | 'packaging'
  | 'dispatched'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export interface OrderItem {
  product: string;
  variant: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  codCharge?: number;
  finalAmount: number;
  couponCode?: string;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'upi' | 'razorpay' | 'stripe' | 'cash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingStatus: ShippingStatus;
  courier?: string;
  awb?: string;
  timeline: { event: string; timestamp: string }[];
  returnRequest?: { reason: string; status: string; requestedAt: string };
  createdAt: string;
}

export interface CartItem {
  key: string; // productId-variantId
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  category: string;
  maxStock: number;
}

export interface StoreConfig {
  announcements: string[];
  freeShippingThreshold: number;
  shippingFee: number;
  codFee: number;
  deliveryDays: string;
  defaultFabric: string;
  upiEnabled: boolean;
  supportEmail: string;
  supportPhone: string;
  instagram: string;
  siteUrl: string;
}

export interface ComboOfferDTO {
  _id: string;
  title: string;
  description: string;
  discount: number;
  categories: string[];
  sizeGroup: string;
  minQty: number;
}

export interface BlogSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  readTime: string;
  category: string;
  author?: string;
  createdAt: string;
}

export interface HomeFeed {
  heroVideos: { _id: string; title: string; url: string }[];
  featured: Product[];
  latest: Product[];
  comboOffers: ComboOfferDTO[];
  journal: BlogSummary[];
  config: StoreConfig;
}
