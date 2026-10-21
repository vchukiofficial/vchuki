import type { Category } from './types';

export const CATEGORIES: { slug: Category; name: string; short: string; tagline: string }[] = [
  { slug: 'linen-full-sleeve', name: 'Linen Full Sleeve', short: 'Full Sleeve', tagline: 'Timeless, all-day ease' },
  { slug: 'linen-half-sleeve', name: 'Linen Half Sleeve', short: 'Half Sleeve', tagline: 'Built for Indian summers' },
  { slug: 'kurta-full-sleeve', name: 'Short Kurta Full Sleeve', short: 'Kurta · Full', tagline: 'Festive, quietly' },
  { slug: 'kurta-half-sleeve', name: 'Short Kurta Half Sleeve', short: 'Kurta · Half', tagline: 'Ethnic, everyday' },
];

export const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name || 'Shirts';

export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
export const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

/** Finished-garment measurements (inches) — same table as the website's size guide. */
export const SIZE_CHART = [
  { size: 'S', shoulder: '16.5"', chest: '41.5"', length: '29"' },
  { size: 'M', shoulder: '17.25"', chest: '43.5"', length: '29.5"' },
  { size: 'L', shoulder: '18"', chest: '45.5"', length: '30"' },
  { size: 'XL', shoulder: '19"', chest: '48.5"', length: '31"' },
  { size: 'XXL', shoulder: '20"', chest: '51.5"', length: '32"' },
];

export const POLICY_PAGES = [
  { title: 'Shipping policy', path: '/shipping-policy' },
  { title: 'Returns & refunds', path: '/refund-policy' },
  { title: 'Privacy policy', path: '/privacy-policy' },
  { title: 'Terms & conditions', path: '/terms-and-conditions' },
  { title: 'FAQ', path: '/faq' },
  { title: 'Our story', path: '/about' },
];
