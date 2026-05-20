import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product, { IProduct } from '@/models/Product'

// GET /api/products - List products
export async function GET(request: NextRequest) {
  await connectDB()

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 12
    const featured = searchParams.get('featured') === 'true'

    const query: Record<string, unknown> = {}
    if (category) query.category = category
    if (search) query.name = { $regex: search, $options: 'i' }
    if (featured) query.isFeatured = true

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('variants', 'color size stock priceAdjustment') // Only needed fields
      .lean()

    const total = await Product.countDocuments(query)

    return NextResponse.json({
      products,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/products - Create product (admin)
export async function POST(request: NextRequest) {
  await connectDB()

  try {
    const body = await request.json() as IProduct
    const product = new Product(body)
    await product.save()
    await product.populate('variants')

    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 400 })
  }
}
