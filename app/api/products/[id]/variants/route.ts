import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProductVariant from "@/models/ProductVariant"
import StockMovement from "@/models/StockMovement"
import { nextBarcode } from "@/lib/inventory"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const variants = await ProductVariant.find({ product: params.id }).lean()
  return NextResponse.json({ variants })
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()
  const body = await request.json()

  const variant = await ProductVariant.create({
    product: params.id,
    color: body.color,
    size: body.size,
    fabric: body.fabric || "Premium Linen Blend",
    fit: body.fit || "regular",
    stock: body.stock || 0,
    priceAdjustment: body.priceAdjustment || 0,
    sku: body.sku,
    barcode: body.barcode || await nextBarcode(),
    images: body.images || [],
  })

  if (variant.stock > 0) {
    await StockMovement.create({ variant: variant._id, product: variant.product, change: variant.stock, balanceAfter: variant.stock, reason: "restock", note: "Opening stock", by: session.user.email || undefined }).catch(() => {})
  }

  return NextResponse.json(variant, { status: 201 })
}
