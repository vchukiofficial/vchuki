import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()

  const query = session.user.role === "admin" ? {} : { user: session.user.id }
  const orders = await Order.find(query).sort({ createdAt: -1 }).lean()

  return NextResponse.json({ orders })
}

export async function POST(request: NextRequest) {
  await connectDB()
  const body = await request.json()

  // Validate required fields
  if (!body.items?.length || !body.shippingAddress || !body.finalAmount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Check if user is logged in (optional for guest checkout)
  const session = await getServerSession(authOptions)

  const order = await Order.create({
    user: session?.user?.id || undefined,
    guestEmail: body.guestEmail || undefined,
    guestPhone: body.guestPhone || undefined,
    items: body.items,
    totalAmount: body.totalAmount,
    discountAmount: body.discountAmount || 0,
    finalAmount: body.finalAmount,
    couponCode: body.couponCode,
    shippingAddress: body.shippingAddress,
    paymentMethod: body.paymentMethod || "cod",
    paymentStatus: body.paymentMethod === "cod" ? "pending" : "paid",
    shippingStatus: "pending",
    timeline: [{ event: "Order placed", timestamp: new Date() }],
  })

  return NextResponse.json({ orderId: order._id, message: "Order placed successfully" }, { status: 201 })
}
