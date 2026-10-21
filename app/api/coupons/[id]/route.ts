import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import Coupon from "@/models/Coupon"

// The admin coupons page already calls PATCH/DELETE here; the route was missing, so toggling or
// deleting a coupon silently did nothing.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()
  const body = await request.json()
  const allowed = ["code", "type", "value", "maxValue", "minAmount", "validFrom", "validTo", "usageLimit", "categories", "isActive"]
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const coupon = await Coupon.findByIdAndUpdate(params.id, update, { new: true, runValidators: true })
  if (!coupon) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(coupon)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()
  await Coupon.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
