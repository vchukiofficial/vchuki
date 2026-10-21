# VCHUKI mobile app

React Native (Expo SDK 58, Expo Router) storefront for vchuki.com. It talks to the **same live
Next.js API** as the website (the parent folder), so products, stock, prices, orders, coupons,
addresses, wishlist and reviews are shared between web and app.

## Run it

```bash
cd mobile
npm install
npx expo start            # scan the QR with a development build, or press a / i
```

Native modules used (expo-video, expo-secure-store, expo-image-picker, expo-blur…) mean you need a
**development build**, not Expo Go:

```bash
npx eas-cli@latest build --profile development --platform android   # or ios
```

### Pointing at a local backend

The app calls `https://vchuki.com` by default. To use `next dev` on your laptop:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npx expo start
```

(use your laptop's LAN IP — `localhost` on the phone is the phone).

## Before the app works against production

The app needs the new `/api/mobile/*` routes from the parent project deployed to Vercel first.
`MOBILE_JWT_SECRET` is optional (falls back to `NEXTAUTH_SECRET`); set it if you want to be able
to sign every app user out without touching web sessions.

## Screens

| Tab / route | What it does | API |
|---|---|---|
| Home | Hero video, announcements, categories, bestsellers, bundle offers, new arrivals, journal | `GET /api/mobile/home` |
| Shop | Category chips, search, sort, infinite scroll | `GET /api/products` |
| Product | Gallery + zoom, colour siblings, sizes with live stock, size guide, pincode check, bundle hint, reviews with photos, related | `GET /api/mobile/products/:slug`, `/api/location/pincode/:code` |
| Saved | Wishlist (local when signed out, synced when signed in) | `/api/wishlist` |
| Bag | Qty, bundle discount (same rules as web), free-shipping meter | — |
| Checkout | Saved/new address with pincode autofill, coupon, UPI / COD | `/api/users/me/addresses`, `/api/coupons/validate`, `POST /api/orders` |
| Order success | UPI deep link opens GPay/PhonePe with the amount filled in | `GET /api/mobile/orders/:id` |
| Account | Orders + tracking + returns, addresses, profile, journal, policies, support | `/api/orders`, `/api/orders/return`, `/api/mobile/me` |
| Auth | Password + email OTP sign-in, OTP sign-up, password reset | `/api/mobile/auth/*`, `/api/auth/send-otp` … |
| Review | Star rating + up to 4 photos (camera or gallery) | `POST /api/mobile/upload`, `POST /api/reviews` |

Pricing rules (bundles, shipping, COD fee) live in `src/lib/pricing.ts` and mirror
`lib/comboOffers.ts` and the checkout page on the website — change both together.

## Design — "Quiet Luxury" dark

Tokens in `src/theme.ts`: obsidian `#0B0A09`, bone white `#EDE6DA`, champagne gold `#C9A96E`,
Playfair Display for headlines, Inter for UI, ultra-thin icons. Animated splash: `src/components/AnimatedSplash.tsx`.

## Security — MPIN & fingerprint / Face ID

After signing in, people create a 4-digit MPIN (hashed, kept in the phone's Keychain/Keystore) and can
turn on fingerprint / Face ID. The app locks on every launch and after 1 minute in the background.
Admins must have an MPIN, and Studio asks again after 5 minutes away. 5 wrong MPINs signs the person out.
Account → Security to change it.

## Sharing & links

Long-press any product (or tap Share on a product) → share the photo with caption + link, share the link,
save all photos to the gallery (album "VCHUKI") for posting a carousel, or copy the link.
vchuki.com/product/…, /products/…, /shirts/… and /blog/… links open inside the app once the
`.well-known` files on the website are filled in (see `public/.well-known/` in the website).
Android back never closes the app from a product opened by link — it goes Home; on Home it asks
"Press back again to exit".

## VCHUKI Studio (admin)

Anyone whose account has role `admin` sees **VCHUKI Studio** at the top of the Account tab.
Make an employee admin from Studio → Customers (or the website admin). Every admin has full access.

| Module | What staff can do | API |
|---|---|---|
| Dashboard | Today's sales (online + shop), orders to ship, stuck orders, stock alerts, 30-day KPIs | `/api/admin/stats` |
| Orders | Tabs (new / to ship / in transit / UPI unpaid / returns…), search, confirm → pack → dispatch → deliver, courier + AWB, mark paid / refunded, notes, call/WhatsApp customer, cancel, delete | `/api/mobile/admin/orders`, `/api/orders/:id` |
| Products | Show/hide, feature, edit name/price/MRP/description/category, upload & reorder photos, add colours & sizes, edit stock/price per size | `/api/products…`, `/api/upload` |
| Stock | Sold-out/low lists, camera barcode scan, restock / remove / set count, full ledger | `/api/admin/stock…` |
| Shop counter | Scan tags into a bill, discount, UPI/cash/card, share bill on WhatsApp | `/api/admin/pos` |
| Coupons, Bundles | Create, switch on/off, delete | `/api/coupons…`, `/api/combo-offers…` |
| Reviews | Hide/show, feature, delete | `/api/reviews…` |
| Customers | Orders & spend per customer, contact, make/remove admin, delete | `/api/users…` |
| Analytics | Views, visitors, hourly traffic, devices, top pages, referrers | `/api/analytics` |
| Email, VIP list | Campaigns now/scheduled, sent log, VIP emails, launch alert | `/api/admin/communications…`, `/api/admin/vip…` |
| Hero videos, Journal | Upload/paste videos, reorder, on/off; write, publish, edit blog posts | `/api/admin/hero-videos`, `/api/admin/blogs…` |
| WhatsApp, Email templates | Connection settings & automation switches; template subjects + test send | `/api/admin/whatsapp`, `/api/admin/email-templates…` |

Razorpay, shipping, email-provider, Meta Pixel and push settings are **not** in the app: on the
website those pages only pretend to save (no backend), so they were left out rather than copied.
