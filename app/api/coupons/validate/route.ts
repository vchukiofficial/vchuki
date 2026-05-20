import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Coupon from "@/models/Coupon"

export async function GET(request: NextRequest) {
  await connectDB()
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")?.toUpperCase()
  const amount = Number(searchParams.get("amount")) || 0

  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 })

  const coupon = await Coupon.findOne({ code, isActive: true })
  if (!coupon) return NextResponse.json({ error: "Invalid coupon" }, { status: 400 })

  const now = new Date()
  if (now < coupon.validFrom || now > coupon.validTo) {
    return NextResponse.json({ error: "Coupon expired" }, { status: 400 })
  }
  if (coupon.minAmount && amount < coupon.minAmount) {
    return NextResponse.json({ error: `Minimum order ₹${coupon.minAmount}` }, { status: 400 })
  }
  if (coupon.usedBy.length >= coupon.usageLimit) {
    return NextResponse.json({ error: "Coupon limit reached" }, { status: 400 })
  }

  let discount = 0
  if (coupon.type === "flat") discount = coupon.value
  else if (coupon.type === "percentage") discount = Math.min(Math.round(amount * coupon.value / 100), coupon.maxValue || Infinity)
  else if (coupon.type === "first_order") discount = Math.min(Math.round(amount * coupon.value / 100), coupon.maxValue || Infinity)

  return NextResponse.json({ discount, type: coupon.type, code: coupon.code })
}
