import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import ProductVariant from "@/models/ProductVariant"
import { setStock } from "@/lib/inventory"

export async function PATCH(request: NextRequest, { params }: { params: { id: string; variantId: string } }) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectDB()
  const { stock, ...body } = await request.json()
  // Stock goes through the ledger so every change has a reason on record
  if (stock !== undefined) {
    await setStock(params.variantId, Number(stock) || 0, { reason: "correction", note: "Edited on product page", by: session.user.email || undefined })
  }
  const variant = await ProductVariant.findByIdAndUpdate(params.variantId, body, { new: true })
  if (!variant) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(variant)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; variantId: string } }) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectDB()
  await ProductVariant.findByIdAndDelete(params.variantId)
  return NextResponse.json({ message: "Deleted" })
}
