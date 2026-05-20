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
  if (body.shippingStatus) {
    update.shippingStatus = body.shippingStatus
    update.$push = { timeline: { event: `Status: ${body.shippingStatus}`, timestamp: new Date() } }
  }
  if (body.paymentStatus) update.paymentStatus = body.paymentStatus

  const order = await Order.findByIdAndUpdate(params.id, update, { new: true })
  return NextResponse.json(order)
}
