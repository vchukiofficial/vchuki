import type { Order, ShippingStatus } from './types';

export const STATUS_LABEL: Record<ShippingStatus, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  packaging: 'Being packed',
  dispatched: 'Dispatched',
  shipped: 'In transit',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  returned: 'Return requested',
  cancelled: 'Cancelled',
};

export const STATUS_TONE: Record<ShippingStatus, 'accent' | 'success' | 'warning' | 'danger' | 'dark'> = {
  pending: 'warning',
  confirmed: 'accent',
  packaging: 'accent',
  dispatched: 'accent',
  shipped: 'accent',
  out_for_delivery: 'accent',
  delivered: 'success',
  returned: 'dark',
  cancelled: 'danger',
};

/** Progress track shown on the order screen. */
export const TRACK: { key: ShippingStatus; label: string }[] = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'dispatched', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const RANK: Record<ShippingStatus, number> = {
  pending: 0,
  confirmed: 1,
  packaging: 1,
  dispatched: 2,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  returned: 4,
  cancelled: -1,
};
export const trackIndex = (s: ShippingStatus) => RANK[s] ?? 0;

export const orderRef = (o: Pick<Order, '_id'>) => o._id.slice(-8).toUpperCase();

/** Returns are open for 7 days after delivery — same rule as /api/orders/return. */
export function returnWindowOpen(o: Order): boolean {
  if (o.shippingStatus !== 'delivered') return false;
  const d = o.timeline?.find((t) => t.event?.toLowerCase().includes('delivered'))?.timestamp;
  if (!d) return true;
  return (Date.now() - new Date(d).getTime()) / 86400000 <= 7;
}

export const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
