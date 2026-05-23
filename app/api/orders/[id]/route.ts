import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()
  const body = await request.json()

  const update: any = {}
  const pushOps: any[] = []

  if (body.shippingStatus) {
    update.shippingStatus = body.shippingStatus
    const statusLabels: Record<string, string> = {
      pending: "Order pending",
      confirmed: "Order confirmed",
      packaging: "Packaging started",
      dispatched: "Order dispatched",
      shipped: "Shipment in transit",
      out_for_delivery: "Out for delivery",
      delivered: "Order delivered",
      returned: "Return initiated",
      cancelled: "Order cancelled",
    }
    pushOps.push({ event: statusLabels[body.shippingStatus] || `Status: ${body.shippingStatus}`, timestamp: new Date() })
  }

  if (body.courier) {
    update.courier = body.courier
  }

  if (body.awb) {
    update.awb = body.awb
  }

  if (body.paymentStatus) {
    update.paymentStatus = body.paymentStatus
  }

  // Custom timeline event
  if (body.timeline) {
    pushOps.push(body.timeline)
  }

  if (pushOps.length > 0) {
    update.$push = { timeline: { $each: pushOps } }
  }

  const order = await Order.findByIdAndUpdate(params.id, update, { new: true })
  return NextResponse.json(order)
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const order = await Order.findById(params.id).lean()
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ order })
}
