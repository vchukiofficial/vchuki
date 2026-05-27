// Combo Offer & Dynamic Bundling System for VCHUKI
// Offers are managed from Admin Panel → stored in MongoDB
// This file provides client-side calculation logic

export type SizeGroup = "S/M/L" | "XL/XXL" | "all"
export type SleeveType = "full-sleeve-shirt" | "half-sleeve-shirt" | "full-sleeve-kurta"

export interface ComboOffer {
  id: string
  _id?: string
  title: string
  description: string
  discount: number
  conditions: {
    category: string[]
    sizeGroup: SizeGroup
    minQty: number
  }
  savedAmount?: number
  finalPrice?: number
  isActive?: boolean
}

// Price map
const PRICES: Record<SleeveType, Record<string, number>> = {
  "full-sleeve-shirt": { "S/M/L": 799, "XL/XXL": 899 },
  "half-sleeve-shirt": { "S/M/L": 699, "XL/XXL": 799 },
  "full-sleeve-kurta": { "S/M/L": 899, "XL/XXL": 999 },
}

// Fetch active offers from API (client-side)
let _cachedOffers: ComboOffer[] | null = null
let _cacheTime = 0

export async function fetchComboOffers(): Promise<ComboOffer[]> {
  if (_cachedOffers && Date.now() - _cacheTime < 60000) return _cachedOffers
  try {
    const res = await fetch("/api/combo-offers")
    const data = await res.json()
    const offers: ComboOffer[] = (data.offers || []).filter((o: any) => o.isActive && new Date(o.validTo) > new Date()).map((o: any) => ({
      id: o._id,
      _id: o._id,
      title: o.title,
      description: o.description,
      discount: o.discount,
      isActive: o.isActive,
      conditions: { category: o.categories, sizeGroup: o.sizeGroup, minQty: o.minQty },
    }))
    _cachedOffers = offers
    _cacheTime = Date.now()
    return offers
  } catch {
    return COMBO_OFFERS
  }
}

// All available combo offers (fallback defaults)
export const COMBO_OFFERS: ComboOffer[] = [
  {
    id: "3pack-full-shirt-sml",
    title: "3× Full Sleeve Shirts",
    description: "Buy 3 Full Sleeve Shirts (S/M/L) & save 15%",
    discount: 15,
    conditions: { category: ["full-sleeve-shirt"], sizeGroup: "S/M/L", minQty: 3 },
  },
  {
    id: "3pack-full-shirt-xl",
    title: "3× Full Sleeve Shirts",
    description: "Buy 3 Full Sleeve Shirts (XL/XXL) & save 15%",
    discount: 15,
    conditions: { category: ["full-sleeve-shirt"], sizeGroup: "XL/XXL", minQty: 3 },
  },
  {
    id: "3pack-half-shirt-sml",
    title: "3× Half Sleeve Shirts",
    description: "Buy 3 Half Sleeve Shirts (S/M/L) & save 15%",
    discount: 15,
    conditions: { category: ["half-sleeve-shirt"], sizeGroup: "S/M/L", minQty: 3 },
  },
  {
    id: "3pack-half-shirt-xl",
    title: "3× Half Sleeve Shirts",
    description: "Buy 3 Half Sleeve Shirts (XL/XXL) & save 15%",
    discount: 15,
    conditions: { category: ["half-sleeve-shirt"], sizeGroup: "XL/XXL", minQty: 3 },
  },
  {
    id: "3pack-kurta-sml",
    title: "3× Full Sleeve Kurtas",
    description: "Buy 3 Full Sleeve Kurtas (S/M/L) & save 20%",
    discount: 20,
    conditions: { category: ["full-sleeve-kurta"], sizeGroup: "S/M/L", minQty: 3 },
  },
  {
    id: "3pack-kurta-xl",
    title: "3× Full Sleeve Kurtas",
    description: "Buy 3 Full Sleeve Kurtas (XL/XXL) & save 20%",
    discount: 20,
    conditions: { category: ["full-sleeve-kurta"], sizeGroup: "XL/XXL", minQty: 3 },
  },
  {
    id: "combo-shirt-kurta-sml",
    title: "Shirt + Kurta Combo",
    description: "1 Full Sleeve Shirt + 1 Kurta (S/M/L) — 15% off",
    discount: 15,
    conditions: { category: ["full-sleeve-shirt", "full-sleeve-kurta"], sizeGroup: "S/M/L", minQty: 2 },
  },
  {
    id: "combo-half-kurta-sml",
    title: "Half Sleeve + Kurta Combo",
    description: "1 Half Sleeve Shirt + 1 Kurta (S/M/L) — 15% off",
    discount: 15,
    conditions: { category: ["half-sleeve-shirt", "full-sleeve-kurta"], sizeGroup: "S/M/L", minQty: 2 },
  },
  {
    id: "combo-shirt-kurta-xl",
    title: "Shirt + Kurta Combo",
    description: "1 Full Sleeve Shirt + 1 Kurta (XL/XXL) — 20% off",
    discount: 20,
    conditions: { category: ["full-sleeve-shirt", "full-sleeve-kurta"], sizeGroup: "XL/XXL", minQty: 2 },
  },
  {
    id: "combo-half-kurta-xl",
    title: "Half Sleeve + Kurta Combo",
    description: "1 Half Sleeve Shirt + 1 Kurta (XL/XXL) — 20% off",
    discount: 20,
    conditions: { category: ["half-sleeve-shirt", "full-sleeve-kurta"], sizeGroup: "XL/XXL", minQty: 2 },
  },
]

export function getSizeGroup(size: string): SizeGroup {
  return ["XL", "XXL", "2XL"].includes(size.toUpperCase()) ? "XL/XXL" : "S/M/L"
}

export function detectCategory(productCategory: string, productName: string): SleeveType | null {
  const cat = productCategory.toLowerCase()
  const name = productName.toLowerCase()
  // Kurta detection first (highest priority)
  if (name.includes("kurta") || cat.includes("kurta")) return "full-sleeve-kurta"
  // Half sleeve shirt
  if (name.includes("half sleeve") || cat.includes("half")) return "half-sleeve-shirt"
  // Full sleeve shirt (includes linen shirts)
  if (name.includes("full sleeve") || name.includes("shirt") || cat.includes("linen") || cat.includes("full") || cat.includes("shirt")) return "full-sleeve-shirt"
  return null
}

// Get applicable offers for a product
export function getOffersForProduct(category: string, name: string): ComboOffer[] {
  const type = detectCategory(category, name)
  if (!type) return []
  return COMBO_OFFERS.filter((o) => o.conditions.category.includes(type)).map((o) => {
    const sizeGroup = o.conditions.sizeGroup
    const priceKey = sizeGroup === "all" ? "S/M/L" : sizeGroup
    const totalOriginal = o.conditions.category.reduce((sum, cat) => {
      const catKey = cat as SleeveType
      return sum + (PRICES[catKey]?.[priceKey] || 799)
    }, 0) * (o.conditions.minQty / o.conditions.category.length)
    const saved = Math.round(totalOriginal * o.discount / 100)
    return { ...o, savedAmount: saved, finalPrice: totalOriginal - saved }
  })
}

// Calculate combo discount for cart items
export interface CartItemForCombo {
  _id: string
  name: string
  price: number
  quantity: number
  size: string
  category?: string
}

export function calculateComboDiscount(items: CartItemForCombo[]): { discount: number; appliedOffer: string | null } {
  let bestDiscount = 0
  let bestOffer: string | null = null

  for (const offer of COMBO_OFFERS) {
    const { category, sizeGroup, minQty } = offer.conditions

    if (category.length === 1) {
      // Bulk 3-pack: all items same category
      const matchingItems = items.filter((item) => {
        const itemType = detectCategory(item.category || "", item.name)
        const itemSizeGroup = getSizeGroup(item.size)
        return itemType === category[0] && itemSizeGroup === sizeGroup
      })
      const totalQty = matchingItems.reduce((sum, i) => sum + i.quantity, 0)
      if (totalQty >= minQty) {
        const totalPrice = matchingItems.reduce((sum, i) => sum + i.price * Math.min(i.quantity, minQty), 0)
        const disc = Math.round(totalPrice * offer.discount / 100)
        if (disc > bestDiscount) {
          bestDiscount = disc
          bestOffer = offer.title
        }
      }
    } else {
      // Cross-category combo
      const matched = category.every((cat) =>
        items.some((item) => {
          const itemType = detectCategory(item.category || "", item.name)
          const itemSizeGroup = getSizeGroup(item.size)
          return itemType === cat && itemSizeGroup === sizeGroup
        })
      )
      if (matched) {
        const comboItems = category.map((cat) =>
          items.find((item) => {
            const itemType = detectCategory(item.category || "", item.name)
            const itemSizeGroup = getSizeGroup(item.size)
            return itemType === cat && itemSizeGroup === sizeGroup
          })
        ).filter(Boolean) as CartItemForCombo[]
        const totalPrice = comboItems.reduce((sum, i) => sum + i.price, 0)
        const disc = Math.round(totalPrice * offer.discount / 100)
        if (disc > bestDiscount) {
          bestDiscount = disc
          bestOffer = offer.title
        }
      }
    }
  }

  return { discount: bestDiscount, appliedOffer: bestOffer }
}
