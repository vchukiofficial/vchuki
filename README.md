# Shirt Store 🧥

## Premium Next.js 14 eCommerce Platform

Production-ready shirt store with:

## 🚀 Features Implemented

### Core Shopping Flow
- [x] Home (Hero, Categories, Best Sellers, Trending)
- [x] Product Listing (Filters, Sort, Grid)
- [x] Product Detail (Variants, Gallery, Sticky CTA)
- [x] Cart (Drawer, Coupon, Savings)
- [x] Checkout (One-page, Razorpay/Stripe)
- [x] Orders (Timeline, Tracking)
- [x] Admin Dashboard (CRUD)

### UI/UX Premium
- [x] Mobile-first (Bottom Nav, Thumb-friendly)
- [x] Skeleton Loading (Shimmer animation)
- [x] Dark Mode (ShadCN theme)
- [x] Micro-interactions (Framer Motion)
- [x] Responsive (2-col mobile grid)

### Tech Stack
```
Frontend: Next.js 14 App Router + TypeScript + Tailwind + ShadCN
State: Zustand (cart, wishlist, UI)
DB: MongoDB + Mongoose
Auth: NextAuth (Credentials)
Payments: Razorpay + Stripe
UI: Radix UI + Framer Motion + Lucide Icons
Forms: React Hook Form + Zod
```

### Performance
- [x] Skeleton loaders
- [x] Lazy images
- [x] Code splitting
- [x] Vercel optimized

## 📱 Quick Start

```bash
cd shirt-store
npm install
cp .env.local.example .env.local
# Fill MongoDB URI + payment keys
npm run dev
```

Visit `http://localhost:3000`

## 🛒 Demo Flow

1. Browse Home → Best Sellers
2. Tap product → PDP → Select color/size
3. Add to Cart → Cart Drawer
4. Checkout → Razorpay
5. Track Order

## 🔧 Admin

`/admin` - Add products, view orders, manage coupons

## 🚀 Deploy

```
npm run build
vercel --prod
```

## 📄 License

MIT

