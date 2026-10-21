import type { CartItem, StoreConfig } from './types';

/**
 * Pricing rules ported 1:1 from the website so the app and vchuki.com always show the same
 * total: lib/comboOffers.ts (calculateComboDiscount + COMBO_OFFERS) and
 * app/(shop)/checkout/page.tsx (shipping, COD fee, total).
 */

export const DEFAULT_CONFIG: StoreConfig = {
  announcements: [
    'Free shipping on orders above ₹1,599',
    'Cash on Delivery available across India',
    '7-day easy returns & exchanges',
    'Handcrafted in Jodhpur · Premium cotton-linen',
  ],
  freeShippingThreshold: 1599,
  shippingFee: 50,
  codFee: 50,
  deliveryDays: '3–7',
  defaultFabric: 'Cotton-linen blend',
  upiEnabled: true,
  supportEmail: 'support@vchuki.com',
  supportPhone: '+91 92528 91189',
  instagram: 'https://www.instagram.com/vchukiofficial/',
  siteUrl: 'https://vchuki.com',
};

type SizeGroup = 'S/M/L' | 'XL/XXL' | 'all';
type SleeveType = 'full-sleeve-shirt' | 'half-sleeve-shirt' | 'full-sleeve-kurta';

interface Offer {
  title: string;
  discount: number;
  category: SleeveType[];
  sizeGroup: SizeGroup;
  minQty: number;
}

const OFFERS: Offer[] = [
  { title: '3× Full Sleeve Shirts', discount: 15, category: ['full-sleeve-shirt'], sizeGroup: 'S/M/L', minQty: 3 },
  { title: '3× Full Sleeve Shirts', discount: 15, category: ['full-sleeve-shirt'], sizeGroup: 'XL/XXL', minQty: 3 },
  { title: '3× Half Sleeve Shirts', discount: 15, category: ['half-sleeve-shirt'], sizeGroup: 'S/M/L', minQty: 3 },
  { title: '3× Half Sleeve Shirts', discount: 15, category: ['half-sleeve-shirt'], sizeGroup: 'XL/XXL', minQty: 3 },
  { title: '3× Full Sleeve Kurtas', discount: 20, category: ['full-sleeve-kurta'], sizeGroup: 'S/M/L', minQty: 3 },
  { title: '3× Full Sleeve Kurtas', discount: 20, category: ['full-sleeve-kurta'], sizeGroup: 'XL/XXL', minQty: 3 },
  { title: 'Shirt + Kurta Combo', discount: 15, category: ['full-sleeve-shirt', 'full-sleeve-kurta'], sizeGroup: 'S/M/L', minQty: 2 },
  { title: 'Half Sleeve + Kurta Combo', discount: 15, category: ['half-sleeve-shirt', 'full-sleeve-kurta'], sizeGroup: 'S/M/L', minQty: 2 },
  { title: 'Shirt + Kurta Combo', discount: 20, category: ['full-sleeve-shirt', 'full-sleeve-kurta'], sizeGroup: 'XL/XXL', minQty: 2 },
  { title: 'Half Sleeve + Kurta Combo', discount: 20, category: ['half-sleeve-shirt', 'full-sleeve-kurta'], sizeGroup: 'XL/XXL', minQty: 2 },
];

function sizeGroup(size: string): SizeGroup {
  return ['XL', 'XXL', '2XL'].includes(size.toUpperCase()) ? 'XL/XXL' : 'S/M/L';
}

/**
 * The website's cart passes the product *slug* as "category" (store/cartStore.ts), so detection
 * runs on slug + name. Kept identical so combo discounts match the site exactly.
 */
function detect(slug: string, name: string): SleeveType | null {
  const cat = slug.toLowerCase();
  const n = name.toLowerCase();
  if (cat === 'kurta-full-sleeve' || cat === 'kurta-half-sleeve') return 'full-sleeve-kurta';
  if (cat === 'linen-half-sleeve') return 'half-sleeve-shirt';
  if (cat === 'linen-full-sleeve') return 'full-sleeve-shirt';
  if (n.includes('kurta')) return 'full-sleeve-kurta';
  if (n.includes('half sleeve') || cat.includes('half')) return 'half-sleeve-shirt';
  if (n.includes('full sleeve') || n.includes('shirt') || cat.includes('linen') || cat.includes('full') || cat.includes('shirt'))
    return 'full-sleeve-shirt';
  return null;
}

export function comboDiscount(items: CartItem[]): { discount: number; label: string | null } {
  let best = 0;
  let label: string | null = null;
  for (const o of OFFERS) {
    if (o.category.length === 1) {
      const matching = items.filter((i) => detect(i.slug, i.name) === o.category[0] && sizeGroup(i.size) === o.sizeGroup);
      const qty = matching.reduce((s, i) => s + i.quantity, 0);
      if (qty >= o.minQty) {
        const total = matching.reduce((s, i) => s + i.price * Math.min(i.quantity, o.minQty), 0);
        const d = Math.round((total * o.discount) / 100);
        if (d > best) {
          best = d;
          label = o.title;
        }
      }
    } else {
      const pick = o.category.map((c) => items.find((i) => detect(i.slug, i.name) === c && sizeGroup(i.size) === o.sizeGroup));
      if (pick.every(Boolean)) {
        const total = pick.reduce((s, i) => s + (i as CartItem).price, 0);
        const d = Math.round((total * o.discount) / 100);
        if (d > best) {
          best = d;
          label = o.title;
        }
      }
    }
  }
  return { discount: best, label };
}

export interface Totals {
  subtotal: number;
  combo: number;
  comboLabel: string | null;
  coupon: number;
  shipping: number;
  cod: number;
  total: number;
  toFreeShipping: number;
}

export function totals(items: CartItem[], couponDiscount: number, cfg: StoreConfig, payment?: 'cod' | 'upi'): Totals {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const { discount: combo, label } = comboDiscount(items);
  const shipping = subtotal >= cfg.freeShippingThreshold ? 0 : cfg.shippingFee;
  const cod = payment === 'cod' ? cfg.codFee : 0;
  const total = Math.max(0, subtotal - combo - couponDiscount + shipping + cod);
  return {
    subtotal,
    combo,
    comboLabel: label,
    coupon: couponDiscount,
    shipping,
    cod,
    total,
    toFreeShipping: Math.max(0, cfg.freeShippingThreshold - subtotal),
  };
}

export const rupee = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export const percentOff = (price: number, compare?: number) =>
  compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
