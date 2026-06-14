import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Review from "@/models/Review"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()
  const body = await request.json()
  const review = await Review.findByIdAndUpdate(params.id, body, { new: true })
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(review)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()
  await Review.findByIdAndDelete(params.id)
  return NextResponse.json({ message: "Deleted" })
}
