import mongoose from "mongoose"
import ProductVariant from "@/models/ProductVariant"
import Counter from "@/models/Counter"
import StockMovement, { type StockReason } from "@/models/StockMovement"

/** Next shop barcode, e.g. "VC000123". Short and all-caps so cheap scanners read it reliably. */
export async function nextBarcode(): Promise<string> {
  const counter = await Counter.findByIdAndUpdate("barcode", { $inc: { seq: 1 } }, { new: true, upsert: true })
  return `VC${String(counter.seq).padStart(6, "0")}`
}

/** Gives every variant without a barcode a fresh one. Returns how many were assigned. */
export async function assignMissingBarcodes(): Promise<number> {
  const missing = await ProductVariant.find({ $or: [{ barcode: { $exists: false } }, { barcode: null }, { barcode: "" }] }).select("_id").lean()
  for (const v of missing) {
    await ProductVariant.updateOne({ _id: v._id }, { barcode: await nextBarcode() })
  }
  return missing.length
}

/** Flattens a variant (with `product` populated) into the shape the admin stock, label and POS screens use. */
export function toStockItem(v: any) {
  return {
    _id: String(v._id),
    productId: String(v.product?._id || ""),
    product: v.product?.name || "Unknown",
    productSlug: v.product?.slug || "",
    color: v.color?.name || "Default",
    size: v.size || "",
    stock: v.stock || 0,
    sku: v.sku || "",
    barcode: v.barcode || "",
    price: (v.product?.basePrice || 0) + (v.priceAdjustment || 0),
    mrp: v.product?.comparePrice || 0,
  }
}

export type StockItem = ReturnType<typeof toStockItem>

interface Line { variant?: unknown; quantity?: number }
interface MoveContext { reason: StockReason; order?: mongoose.Types.ObjectId | string; note?: string; by?: string }

async function log(variant: any, change: number, ctx: MoveContext) {
  await StockMovement.create({
    variant: variant._id,
    product: variant.product,
    change,
    balanceAfter: variant.stock,
    reason: ctx.reason,
    order: ctx.order,
    note: ctx.note,
    by: ctx.by,
  }).catch(() => { /* the ledger must never block a sale */ })
}

/** Adds (or with a negative delta, removes) stock on one variant. Refuses to go below zero. */
export async function adjustStock(variantId: string, delta: number, ctx: MoveContext) {
  const filter: any = { _id: variantId }
  if (delta < 0) filter.stock = { $gte: -delta }
  const variant = await ProductVariant.findOneAndUpdate(filter, { $inc: { stock: delta } }, { new: true })
  if (variant) await log(variant, delta, ctx)
  return variant
}

/** Sets a variant's stock to an exact count (e.g. after a physical count). */
export async function setStock(variantId: string, stock: number, ctx: MoveContext) {
  const before = await ProductVariant.findById(variantId).select("stock").lean() as any
  if (!before) return null
  const delta = Math.max(0, stock) - (before.stock || 0)
  if (delta === 0) return ProductVariant.findById(variantId)
  return adjustStock(variantId, delta, ctx)
}

function validVariantId(line: Line): string | null {
  const id = String(line.variant || "")
  return mongoose.isValidObjectId(id) ? id : null
}

/**
 * Takes stock for every line, all-or-nothing. Lines whose `variant` is not a real
 * ProductVariant (the cart falls back to the product id for variant-less products) are skipped.
 * Returns the first line that could not be filled, after rolling back any already taken.
 */
export async function takeStock(lines: Line[], ctx: MoveContext): Promise<{ ok: true } | { ok: false; line: Line; available: number }> {
  const taken: { id: string; qty: number }[] = []
  for (const line of lines) {
    const id = validVariantId(line)
    if (!id) continue
    const qty = Math.max(1, Number(line.quantity) || 1)
    const exists = await ProductVariant.exists({ _id: id })
    if (!exists) continue
    const variant = await adjustStock(id, -qty, ctx)
    if (!variant) {
      for (const t of taken) await adjustStock(t.id, t.qty, { ...ctx, reason: "order_restored", note: "Rolled back: another item was out of stock" })
      const current = await ProductVariant.findById(id).select("stock").lean() as any
      return { ok: false, line, available: current?.stock || 0 }
    }
    taken.push({ id, qty })
  }
  return { ok: true }
}

/** Puts stock back for every line (cancelled, returned or deleted orders). */
export async function returnStock(lines: Line[], ctx: MoveContext) {
  for (const line of lines) {
    const id = validVariantId(line)
    if (!id) continue
    await adjustStock(id, Math.max(1, Number(line.quantity) || 1), ctx)
  }
}
