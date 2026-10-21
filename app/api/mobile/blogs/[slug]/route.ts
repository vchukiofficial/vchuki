import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Blog from "@/models/Blog"
import Product from "@/models/Product"

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB()
  const blog = (await Blog.findOne({ slug: params.slug, isPublished: true }).lean()) as any
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const relatedProducts = blog.relatedProducts?.length
    ? await Product.find({ _id: { $in: blog.relatedProducts }, isActive: true }).lean()
    : []
  return NextResponse.json({ blog, relatedProducts })
}
