import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Review from "@/models/Review"
import { recomputeProductRating } from "@/lib/reviewStats"

// Full list (including pending/hidden reviews) is for the admin panel only;
// product pages load their approved reviews server-side.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectDB()
  const reviews = await Review.find().populate("user", "name").populate("product", "name slug").sort({ createdAt: -1 }).lean()
  return NextResponse.json({ reviews })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const body = await request.json()

  if (!body.images || body.images.length === 0) {
    return NextResponse.json({ error: "At least one photo is required for reviews" }, { status: 400 })
  }

  // Only accept the fields a customer may set — verification and moderation status are
  // decided server-side, not by the request body.
  const review = await Review.create({
    product: body.product,
    rating: body.rating,
    comment: body.comment,
    images: body.images,
    user: session.user.id,
  })
  await recomputeProductRating(review.product)
  return NextResponse.json(review, { status: 201 })
}
