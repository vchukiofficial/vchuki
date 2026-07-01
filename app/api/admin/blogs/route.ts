import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Blog from "@/models/Blog"

// GET all blogs (admin)
export async function GET(req: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page")) || 1
  const limit = Number(searchParams.get("limit")) || 20
  const category = searchParams.get("category")

  const query: any = {}
  if (category) query.category = category

  const [blogs, total] = await Promise.all([
    Blog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Blog.countDocuments(query),
  ])

  return NextResponse.json({ blogs, total, pages: Math.ceil(total / limit) })
}

// POST create blog
export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()

  // Auto-generate slug if not provided
  if (!body.slug) {
    body.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  // Auto-generate SEO fields if not provided
  if (!body.seoTitle) body.seoTitle = body.title
  if (!body.seoDescription) body.seoDescription = body.excerpt

  const blog = await Blog.create(body)
  return NextResponse.json(blog, { status: 201 })
}
