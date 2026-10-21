import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Blog from "@/models/Blog"

/** Published journal posts only (the admin blogs endpoint also returns drafts). */
export async function GET(req: NextRequest) {
  await connectDB()
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1)
  const limit = 12
  const query = { isPublished: true }
  const [blogs, total] = await Promise.all([
    Blog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .select("title slug excerpt coverImage readTime category author createdAt").lean(),
    Blog.countDocuments(query),
  ])
  return NextResponse.json({ blogs, pagination: { page, pages: Math.ceil(total / limit), total } })
}
