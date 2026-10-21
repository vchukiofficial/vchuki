import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function POST(req: NextRequest) {
  const session = await sessionFor(req)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { orderId, reason, items, pickupAddress } = await req.json()

  if (!orderId || !reason) {
    return NextResponse.json({ error: "Order ID and reason are required" }, { status: 400 })
  }

  const order = await Order.findById(orderId)
  // Only the customer who placed the order (or an admin) may request its return
  if (!order || (String(order.user) !== session.user.id && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  // Check if order is eligible for return (delivered within 7 days)
  if (order.shippingStatus !== "delivered") {
    return NextResponse.json({ error: "Only delivered orders can be returned" }, { status: 400 })
  }

  const deliveredDate = order.timeline?.find((t: any) => t.event?.toLowerCase().includes("delivered"))?.timestamp
  if (deliveredDate) {
    const daysSinceDelivery = Math.floor((Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceDelivery > 7) {
      return NextResponse.json({ error: "Return window has expired (7 days from delivery)" }, { status: 400 })
    }
  }

  // Update order with return request
  order.shippingStatus = "returned"
  order.returnRequest = {
    reason,
    items: items || order.items.map((i: any) => i.name),
    pickupAddress: pickupAddress || order.shippingAddress,
    status: "requested",
    requestedAt: new Date(),
  }
  order.timeline.push({ event: `Return requested: ${reason}`, timestamp: new Date() })
  await order.save()

  // Notify admin
  try {
    const { sendPromoEmail } = await import("@/lib/email/brevo")
    await sendPromoEmail("akshayneriya2001@gmail.com", {
      subject: `Return Request - Order #${order._id.toString().slice(-8).toUpperCase()}`,
      heading: "New Return Request",
      content: `<p>Order: #${order._id.toString().slice(-8).toUpperCase()}</p><p>Reason: ${reason}</p><p>Customer: ${order.shippingAddress?.name} (${session.user?.email})</p>`,
      ctaText: "View in Admin",
      ctaLink: "https://vchuki.com/admin/returns",
    })
  } catch { /* non-blocking */ }

  return NextResponse.json({
    success: true,
    message: "Return request submitted. We'll arrange pickup within 2-3 business days.",
  })
}
