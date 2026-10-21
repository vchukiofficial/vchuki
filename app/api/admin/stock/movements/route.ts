import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import StockMovement from "@/models/StockMovement"
import "@/models/ProductVariant"
import "@/models/Product"

// GET ?variantId=… → that variant's history; otherwise the latest 200 movements across the store
export async function GET(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()

  const variantId = request.nextUrl.searchParams.get("variantId")
  const movements = await StockMovement.find(variantId ? { variant: variantId } : {})
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("product", "name")
    .populate("variant", "size color barcode")
    .lean()

  return NextResponse.json({
    movements: movements.map((m: any) => ({
      _id: String(m._id),
      product: m.product?.name || "Unknown",
      size: m.variant?.size || "",
      color: m.variant?.color?.name || "",
      barcode: m.variant?.barcode || "",
      change: m.change,
      balanceAfter: m.balanceAfter,
      reason: m.reason,
      order: m.order ? String(m.order) : "",
      note: m.note || "",
      by: m.by || "",
      createdAt: m.createdAt,
    })),
  })
}
