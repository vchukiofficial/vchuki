import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Blog from "@/models/Blog"

// GET single blog
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const blog = await Blog.findById(params.id).lean()
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(blog)
}

// PUT update blog
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const blog = await Blog.findByIdAndUpdate(params.id, body, { new: true })
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(blog)
}

// DELETE blog
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  await Blog.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
