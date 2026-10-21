import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import { getRequestUser } from "@/lib/mobileAuth"
import { buildUpiLink, isUpiConfigured } from "@/lib/upi"

/** One order for its owner, plus a UPI deep link built from the stored amount when payment is pending. */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getRequestUser(req)
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const order = (await Order.findById(params.id).lean().catch(() => null)) as any
  if (!order || (String(order.user) !== me.id && me.role !== "admin")) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  const ref = order._id.toString().slice(-8).toUpperCase()
  const upiLink =
    order.paymentMethod === "upi" && order.paymentStatus === "pending" && isUpiConfigured()
      ? buildUpiLink({ amount: order.finalAmount, note: `VCHUKI Order ${ref}` })
      : null
  return NextResponse.json({ order, ref, upiLink })
}
