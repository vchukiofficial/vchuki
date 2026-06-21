import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProductVariant from "@/models/ProductVariant"

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
    images: body.images || [],
  })

  return NextResponse.json(variant, { status: 201 })
}
