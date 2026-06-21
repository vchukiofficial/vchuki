import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import EmailTemplate from "@/models/EmailTemplate"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const templates = await EmailTemplate.find().sort({ createdAt: 1 }).lean()
  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const body = await request.json()

  // Upsert by slug to avoid duplicates
  if (body.slug) {
    const existing = await EmailTemplate.findOne({ slug: body.slug })
    if (existing) {
      const updated = await EmailTemplate.findByIdAndUpdate(existing._id, body, { new: true })
      return NextResponse.json(updated, { status: 200 })
    }
  }

  const template = await EmailTemplate.create(body)
  return NextResponse.json(template, { status: 201 })
}
