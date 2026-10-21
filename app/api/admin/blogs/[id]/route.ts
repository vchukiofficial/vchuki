import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import Blog from "@/models/Blog"

// GET single blog
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const blog = (await Blog.findById(params.id).lean()) as any
  const viewer = await sessionFor(req)
  if (blog && !blog.isPublished && viewer?.user.role !== "admin") return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(blog)
}

// PUT update blog
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await sessionFor(req)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()
  const body = await req.json()
  const blog = await Blog.findByIdAndUpdate(params.id, body, { new: true })
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(blog)
}

// DELETE blog
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await sessionFor(req)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()
  await Blog.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
