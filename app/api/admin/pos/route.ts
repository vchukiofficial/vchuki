import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import ProductVariant from "@/models/ProductVariant"
import "@/models/Product"
import { takeStock, returnStock, toStockItem } from "@/lib/inventory"

// POST { items: [{ variantId, quantity }], discount, paymentMethod: "cash" | "upi" | "card", customerName?, customerPhone? }
// Records a walk-in sale as a paid, already-delivered "store" order and takes the stock.
// Prices are always read from the database — the counter screen only says what was scanned.
export async function POST(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await connectDB()

  const body = await request.json()
  const paymentMethod = ["cash", "upi", "card"].includes(body.paymentMethod) ? body.paymentMethod : null
  if (!paymentMethod) return NextResponse.json({ error: "Choose cash, UPI or card" }, { status: 400 })

  const wanted = (body.items || []).filter((i: any) => mongoose.isValidObjectId(i.variantId) && Number(i.quantity) > 0)
  if (!wanted.length) return NextResponse.json({ error: "The bill is empty" }, { status: 400 })

  const variants = await ProductVariant.find({ _id: { $in: wanted.map((i: any) => i.variantId) } })
    .populate("product", "name slug basePrice comparePrice images").lean()
  const byId = new Map(variants.map((v: any) => [String(v._id), v]))

  const items: { product: unknown; variant: unknown; name: string; image: string; price: number; quantity: number; size: string; color: string }[] = []
  for (const w of wanted) {
    const v: any = byId.get(String(w.variantId))
    if (!v) return NextResponse.json({ error: "One of the scanned items no longer exists" }, { status: 400 })
    const s = toStockItem(v)
    items.push({
      product: v.product?._id,
      variant: v._id,
      name: s.product,
      image: v.images?.[0] || v.product?.images?.[0] || "",
      price: s.price,
      quantity: Math.floor(Number(w.quantity)),
      size: s.size,
      color: s.color,
    })
  }

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const discountAmount = Math.min(totalAmount, Math.max(0, Math.round(Number(body.discount) || 0)))
  const finalAmount = totalAmount - discountAmount

  const orderId = new mongoose.Types.ObjectId()
  const by = session.user.email || undefined
  const stock = await takeStock(items, { reason: "store_sale", order: orderId, by })
  if (!stock.ok) {
    const line: any = stock.line
    return NextResponse.json({ error: `${line.name} (${line.size}): only ${stock.available} in stock` }, { status: 409 })
  }

  const now = new Date()
  const order = await Order.create({
    _id: orderId,
    channel: "store",
    guestPhone: body.customerPhone || undefined,
    items,
    totalAmount,
    discountAmount,
    finalAmount,
    shippingAddress: { name: body.customerName || "Walk-in customer", street: "", city: "", state: "", zip: "", phone: body.customerPhone || "" },
    paymentMethod,
    paymentStatus: "paid",
    shippingStatus: "delivered",
    timeline: [{ event: `Sold at store (${paymentMethod.toUpperCase()}) by ${by || "admin"}`, timestamp: now }],
  }).catch(async (err: unknown) => {
    await returnStock(items, { reason: "order_restored", order: orderId, note: "Store sale could not be saved", by })
    throw err
  })

  return NextResponse.json({
    receipt: {
      orderId: String(order._id),
      billNo: String(order._id).slice(-8).toUpperCase(),
      date: now,
      items: items.map(i => ({ name: i.name, size: i.size, color: i.color, quantity: i.quantity, price: i.price })),
      totalAmount,
      discountAmount,
      finalAmount,
      paymentMethod,
      customerName: body.customerName || "",
    },
  }, { status: 201 })
}
