import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import Product from "@/models/Product"
import User from "@/models/User"
import PageView from "@/models/PageView"

// Real-money revenue for a set of orders: paid orders in full, plus live (not
// cancelled/returned) COD orders, which count as revenue on the honor system
// until the courier actually collects it.
function revenueOf(orders: any[]) {
  return orders.reduce((sum, o) => {
    const counts = o.paymentStatus === "paid" || (o.paymentMethod === "cod" && !["cancelled", "returned"].includes(o.shippingStatus))
    return counts ? sum + (o.finalAmount || 0) : sum
  }, 0)
}

function pct(n: number, d: number): number | null {
  return d ? Math.round((n / d) * 1000) / 10 : null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()

  const day = 86400000
  const now = new Date()
  const since30 = new Date(now.getTime() - 30 * day)
  const since60 = new Date(now.getTime() - 60 * day)
  const since24h = new Date(now.getTime() - day)

  const [
    totalOrders,
    totalProducts,
    totalUsers,
    allOrders,
    usersLast30,
    usersPrev30,
    sessionsLast30,
    stalePendingOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments(),
    Order.find().select("finalAmount paymentStatus paymentMethod shippingStatus channel user guestEmail guestPhone createdAt").lean(),
    User.countDocuments({ createdAt: { $gte: since30 } }),
    User.countDocuments({ createdAt: { $gte: since60, $lt: since30 } }),
    PageView.distinct("sessionId", { createdAt: { $gte: since30 } }).then((s) => s.length),
    Order.find({ shippingStatus: { $in: ["pending", "confirmed"] }, createdAt: { $lt: since24h } })
      .sort({ createdAt: 1 })
      .select("createdAt")
      .lean(),
  ])

  const ordersLast30 = allOrders.filter((o: any) => new Date(o.createdAt) >= since30)
  const ordersPrev30 = allOrders.filter((o: any) => new Date(o.createdAt) >= since60 && new Date(o.createdAt) < since30)

  const revenue = revenueOf(allOrders)
  const revenueLast30 = revenueOf(ordersLast30)
  const revenuePrev30 = revenueOf(ordersPrev30)

  // Shop counter sales are "delivered" on the spot and have no web session, so delivery,
  // return and conversion rates only look at website orders.
  const isStore = (o: any) => o.channel === "store"
  const onlineOrders = allOrders.filter((o: any) => !isStore(o))
  const onlineLast30 = ordersLast30.filter((o: any) => !isStore(o))

  const delivered = onlineOrders.filter((o: any) => o.shippingStatus === "delivered").length
  const returned = onlineOrders.filter((o: any) => o.shippingStatus === "returned").length

  const customerKey = (o: any) => String(o.user || o.guestEmail || o.guestPhone || "")
  const byCustomer = new Map<string, number>()
  for (const o of allOrders) {
    const key = customerKey(o)
    if (key) byCustomer.set(key, (byCustomer.get(key) || 0) + 1)
  }
  const repeatCustomers = [...byCustomer.values()].filter((n) => n > 1).length

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean()

  return NextResponse.json({
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      revenue,
      onlineRevenue30: revenueOf(onlineLast30),
      storeRevenue30: revenueOf(ordersLast30.filter(isStore)),
      // Real, computed — not hardcoded. null means "not enough data yet" rather than a fake number.
      revenueChangePct: pct(revenueLast30 - revenuePrev30, revenuePrev30),
      customersChangePct: pct(usersLast30 - usersPrev30, usersPrev30),
      conversionRatePct: pct(onlineLast30.length, sessionsLast30),
      returnRatePct: pct(returned, delivered + returned),
      repeatRatePct: pct(repeatCustomers, byCustomer.size),
      avgOrderValue: ordersLast30.length ? Math.round(revenueLast30 / ordersLast30.length) : 0,
      // Orders that have sat pending/confirmed for more than 24h — the number that
      // actually matters, vs. a raw "pending" count that includes orders placed an hour ago.
      staleOrderCount: stalePendingOrders.length,
      oldestStaleHours: stalePendingOrders.length
        ? Math.round((now.getTime() - new Date((stalePendingOrders[0] as any).createdAt).getTime()) / (60 * 60 * 1000))
        : 0,
    },
    recentOrders,
  })
}
