import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import "@/models/User"
import { sessionFor } from "@/lib/mobileAuth"

/**
 * Paged, filtered order list for the app's admin screens.
 * (GET /api/orders returns every order at once, which is fine on a laptop but heavy on a phone.)
 *
 * ?tab=new|to_ship|in_transit|delivered|returns|cancelled|store|upi_pending|all  &q=  &page=
 */
const TABS: Record<string, Record<string, unknown>> = {
  all: {},
  new: { shippingStatus: "pending", channel: { $ne: "store" } },
  to_ship: { shippingStatus: { $in: ["confirmed", "packaging"] }, channel: { $ne: "store" } },
  in_transit: { shippingStatus: { $in: ["dispatched", "shipped", "out_for_delivery"] } },
  delivered: { shippingStatus: "delivered", channel: { $ne: "store" } },
  returns: { $or: [{ shippingStatus: "returned" }, { "returnRequest.status": { $exists: true } }] },
  cancelled: { shippingStatus: "cancelled" },
  store: { channel: "store" },
  upi_pending: { paymentMethod: "upi", paymentStatus: "pending", shippingStatus: { $nin: ["cancelled", "returned"] } },
}

export async function GET(req: NextRequest) {
  const session = await sessionFor(req)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()

  const sp = req.nextUrl.searchParams
  const tab = TABS[sp.get("tab") || "all"] ? sp.get("tab") || "all" : "all"
  const q = (sp.get("q") || "").trim()
  const page = Math.max(1, Number(sp.get("page")) || 1)
  const limit = 20

  const filter: Record<string, unknown> = { ...TABS[tab] }
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
    const or: Record<string, unknown>[] = [
      { "shippingAddress.name": rx },
      { "shippingAddress.phone": rx },
      { guestEmail: rx },
      { awb: rx },
    ]
    // Order refs are the last 8 hex chars of the id
    if (/^[0-9a-f]{4,8}$/i.test(q)) {
      or.push({ $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: `${q.toLowerCase()}$` } } })
    }
    filter.$and = [...((filter.$and as unknown[]) || []), { $or: or }]
  }

  const [orders, total, counts] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "name email").lean(),
    Order.countDocuments(filter),
    Promise.all(Object.entries(TABS).map(async ([k, f]) => [k, await Order.countDocuments(f)] as const)).then(Object.fromEntries),
  ])

  return NextResponse.json({ orders, counts, pagination: { page, pages: Math.ceil(total / limit), total } })
}
