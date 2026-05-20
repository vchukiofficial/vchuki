import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")
  const featured = searchParams.get("featured")
  const ids = searchParams.get("ids")
  const page = Number(searchParams.get("page")) || 1
  const limit = Number(searchParams.get("limit")) || 12

  const query: Record<string, any> = { isActive: true }
  if (category) query.category = category
  if (search) query.name = { $regex: search, $options: "i" }
  if (featured === "true") query.isFeatured = true
  if (ids) query._id = { $in: ids.split(",").map((id) => new mongoose.Types.ObjectId(id)) }

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(query),
  ])

  return NextResponse.json({ products, pagination: { page, pages: Math.ceil(total / limit), total } })
}

export async function POST(request: NextRequest) {
  await connectDB()
  const body = await request.json()
  const product = await Product.create(body)
  return NextResponse.json(product, { status: 201 })
}
