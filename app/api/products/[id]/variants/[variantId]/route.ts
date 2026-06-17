import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProductVariant from "@/models/ProductVariant"

export async function PATCH(request: NextRequest, { params }: { params: { id: string; variantId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectDB()
  const body = await request.json()
  const variant = await ProductVariant.findByIdAndUpdate(params.variantId, body, { new: true })
  if (!variant) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(variant)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; variantId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectDB()
  await ProductVariant.findByIdAndDelete(params.variantId)
  return NextResponse.json({ message: "Deleted" })
}
