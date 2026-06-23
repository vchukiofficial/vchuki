import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import User from "@/models/User"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()

  const [totalOrders, totalProducts, totalUsers, revenueAgg, codRevenueAgg] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { paymentMethod: "cod", shippingStatus: { $nin: ["cancelled", "returned"] } } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]),
  ])

  const paidRevenue = revenueAgg[0]?.total || 0
  const codRevenue = codRevenueAgg[0]?.total || 0
  const revenue = paidRevenue + codRevenue
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean()

  return NextResponse.json({
    stats: { totalOrders, totalProducts, totalUsers, revenue },
    recentOrders,
  })
}
