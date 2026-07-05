import type { CartItem } from "@/types"

interface BuildCartItemInput {
  productId: string
  variantId?: string
  name: string
  slug: string
  image?: string
  fallbackImages: string[]
  price: number
  sku?: string
  size: string
  color: string
}

/** Builds a CartItem from a product/variant combo. Composites `_id` as `productId-sku`
 * when a variant is present, otherwise falls back to the plain product id. */
export function buildCartItemFromVariant(input: BuildCartItemInput): CartItem {
  const sku = input.sku || `${input.slug}-default`
  const _id = input.variantId ? `${input.productId}-${sku}` : input.productId

  return {
    _id,
    name: input.name,
    slug: input.slug,
    images: input.image ? [input.image] : input.fallbackImages,
    price: input.price,
    quantity: 1,
    sku,
    variantId: input.variantId || input.productId,
    size: input.size,
    color: input.color,
  }
}
