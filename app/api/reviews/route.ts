import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Review from "@/models/Review"

export async function GET() {
  await connectDB()
  const reviews = await Review.find().populate("user", "name").populate("product", "name slug").sort({ createdAt: -1 }).lean()
  return NextResponse.json({ reviews })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const body = await request.json()
  const review = await Review.create({ ...body, user: session.user.id })
  return NextResponse.json(review, { status: 201 })
}
