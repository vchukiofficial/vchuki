/**
 * Funnel events sent to both Google Analytics 4 (gtag) and the Meta Pixel (fbq), so you can see
 * where shoppers drop off and Instagram/Facebook can learn who buys.
 *
 * The Meta Pixel only loads when NEXT_PUBLIC_META_PIXEL_ID is set (see app/layout.tsx).
 * Every call is a safe no-op on the server or when a script is blocked.
 */

type Item = { id: string; name: string; price: number; quantity?: number; size?: string; color?: string }

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

function send(gaEvent: string, metaEvent: string | null, value: number, items: Item[], extra: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return
  try {
    window.gtag?.("event", gaEvent, {
      currency: "INR",
      value,
      items: items.map((i) => ({
        item_id: i.id,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
        item_variant: [i.color, i.size].filter(Boolean).join(" / ") || undefined,
      })),
      ...extra,
    })
  } catch { /* analytics must never break the shop */ }
  try {
    if (metaEvent) {
      window.fbq?.("track", metaEvent, {
        currency: "INR",
        value,
        content_type: "product",
        content_ids: items.map((i) => i.id),
        num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
        ...extra,
      })
    }
  } catch { /* ignore */ }
}

const total = (items: Item[]) => items.reduce((sum, i) => sum + i.price * (i.quantity ?? 1), 0)

export const track = {
  viewItem: (item: Item) => send("view_item", "ViewContent", item.price, [item]),
  addToCart: (item: Item) => send("add_to_cart", "AddToCart", item.price * (item.quantity ?? 1), [item]),
  beginCheckout: (items: Item[]) => send("begin_checkout", "InitiateCheckout", total(items), items),
  addPaymentInfo: (items: Item[], method: string) => send("add_payment_info", "AddPaymentInfo", total(items), items, { payment_type: method }),
  purchase: (orderId: string, value: number, items: Item[], method: string) =>
    send("purchase", "Purchase", value, items, { transaction_id: orderId, payment_type: method }),
}
