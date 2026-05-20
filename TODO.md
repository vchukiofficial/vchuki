# Shirt Store Implementation TODO

## Phase 1: Setup & Config [ ]
- [x] Create/update package.json (all deps)
- [x] Update tailwind.config.ts (ShadCN)
- [x] Update next.config.mjs
- [x] Create .env.local.example
- [x] Run `npm install`
- [ ] Test `npm run dev` (basic server starts)

## Phase 2: Lib & Models [x]
- [x] lib/mongodb.ts
- [x] lib/auth.ts
- [x] lib/razorpay.ts, stripe.ts
- [x] lib/coupon-engine.ts
- [x] lib/utils.ts
- [x] models/User.ts, Product.ts, ProductVariant.ts, Order.ts, Coupon.ts, Review.ts

## Phase 3: State & Types [x]
- [x] store/cartStore.ts, wishlistStore.ts, uiStore.ts
- [x] types/index.ts
- [x] hooks/useCart.ts, useProducts.ts, useVariant.ts

## Phase 4: UI Components [x]
- [x] components/ui/ (Button, Card, Input, etc. ~20 files)
- [x] components/layout/ (Navbar, Footer, CartDrawer)
- [x] components/home/ (HeroBanner, BestSellers)
- [x] components/products/ (ProductCard, VariantSelector, etc.)
- [x] components/cart/, checkout/, orders/, admin/

## Phase 5: Pages & API Routes [ ]
- [ ] app/(shop)/page.tsx (home)
- [ ] app/(shop)/products/**, cart/, checkout/
- [ ] app/(auth)/login/, register/
- [ ] app/admin/**
- [ ] Update app/layout.tsx, globals.css, page.tsx
- [ ] app/api/auth/[...nextauth]/route.ts
- [ ] app/api/products/**, cart/, checkout/, payment/, orders/, coupons/, wishlist/

## Phase 6: Polish [ ]
- [ ] public/ images, icons
- [ ] Full test: purchase flow, admin CRUD, coupons, payments
- [ ] `npm run build && npm run lint`
- [ ] Deploy-ready (Vercel)

**Status**: Starting Phase 1...
**Instructions**: Mark [x] as completed. Feedback via chat.
