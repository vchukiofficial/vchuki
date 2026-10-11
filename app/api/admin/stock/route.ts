import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProductVariant from "@/models/ProductVariant"
import "@/models/Product"
import { adjustStock, setStock, assignMissingBarcodes, toStockItem } from "@/lib/inventory"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return session && session.user.role === "admin" ? session : null
}

// GET            → stats + every variant (the shop holds a few hundred at most)
// GET ?code=XYZ  → the single variant with that barcode or SKU (scanner lookup)
export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()

  const code = request.nextUrl.searchParams.get("code")?.trim()
  if (code) {
    const v = await ProductVariant.findOne({ $or: [{ barcode: code.toUpperCase() }, { sku: code }] })
      .populate("product", "name slug basePrice comparePrice").lean()
    if (!v) return NextResponse.json({ error: `No item with barcode ${code}` }, { status: 404 })
    return NextResponse.json({ item: toStockItem(v) })
  }

  const variants = await ProductVariant.find().populate("product", "name slug basePrice comparePrice").lean()
  const items = variants.map(toStockItem).sort((a, b) => a.product.localeCompare(b.product) || a.color.localeCompare(b.color) || String(a.size).localeCompare(String(b.size)))

  const soldOut = items.filter(i => i.stock === 0).length
  const lowStock = items.filter(i => i.stock > 0 && i.stock <= 5).length
  return NextResponse.json({
    stats: {
      totalVariants: items.length,
      totalStock: items.reduce((s, i) => s + i.stock, 0),
      soldOut,
      lowStock,
      healthy: items.length - soldOut - lowStock,
      missingBarcodes: items.filter(i => !i.barcode).length,
    },
    items,
  })
}

// PATCH { variantId, mode: "add" | "remove" | "set", quantity, reason?, note? }
export async function PATCH(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()

  const { variantId, mode, quantity, note } = await request.json()
  const qty = Math.floor(Number(quantity))
  if (!variantId || !Number.isFinite(qty) || qty < 0) return NextResponse.json({ error: "Enter a valid quantity" }, { status: 400 })

  const by = session.user.email || undefined
  let variant
  if (mode === "set") variant = await setStock(variantId, qty, { reason: "correction", note, by })
  else if (mode === "remove") variant = await adjustStock(variantId, -qty, { reason: "damaged", note, by })
  else variant = await adjustStock(variantId, qty, { reason: "restock", note, by })

  if (!variant) return NextResponse.json({ error: mode === "remove" ? "Not enough stock to remove" : "Item not found" }, { status: 400 })
  return NextResponse.json({ stock: variant.stock })
}

// POST → assign barcodes to every variant that doesn't have one yet
export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()
  const assigned = await assignMissingBarcodes()
  return NextResponse.json({ assigned })
}
