import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import Coupon from "@/models/Coupon"

export async function GET(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectDB()
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json({ coupons })
}

export async function POST(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await connectDB()
  const body = await request.json()
  const coupon = await Coupon.create(body)
  return NextResponse.json(coupon, { status: 201 })
}
