import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Order from "@/models/Order"
import ProductVariant from "@/models/ProductVariant"
import User from "@/models/User"

function isSameAddress(a: any, b: any) {
  const norm = (v: string) => (v || "").trim().toLowerCase()
  return norm(a.street) === norm(b.street) && norm(a.city) === norm(b.city) && norm(a.state) === norm(b.state) && norm(a.zip) === norm(b.zip)
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()

  const query = session.user.role === "admin" ? {} : { user: session.user.id }
  const orders = await Order.find(query).sort({ createdAt: -1 }).populate("user", "name email").lean()

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

  // Deduct stock for each item
  for (const item of body.items) {
    if (item.variant) {
      await ProductVariant.findByIdAndUpdate(item.variant, { $inc: { stock: -(item.quantity || 1) } })
    }
  }

  const order = await Order.create({
    user: session?.user?.id || undefined,
    guestEmail: body.guestEmail || undefined,
    guestPhone: body.guestPhone || undefined,
    items: body.items,
    totalAmount: body.totalAmount,
    discountAmount: body.discountAmount || 0,
    codCharge: body.paymentMethod === "cod" ? 50 : 0,
    finalAmount: body.finalAmount,
    couponCode: body.couponCode,
    shippingAddress: body.shippingAddress,
    paymentMethod: body.paymentMethod || "cod",
    // Nothing is auto-confirmed as paid — COD is collected on delivery, UPI/other online methods
    // require manual admin confirmation (or, in the future, a verified gateway webhook) before "paid".
    paymentStatus: "pending",
    shippingStatus: "pending",
    timeline: [{ event: "Order placed", timestamp: new Date() }],
  })

  // Send order confirmation email (async, non-blocking)
  const customerEmail = session?.user?.email || body.guestEmail
  const customerPhone = body.shippingAddress?.phone || body.guestPhone

  // Auto-create user account for guest orders
  let autoCreatedUser = false
  if (!session && customerEmail) {
    try {
      const existingUser = await User.findOne({ email: customerEmail })
      if (!existingUser) {
        const bcrypt = await import("bcryptjs")
        const tempPassword = customerPhone || Math.random().toString(36).slice(-8)
        const hashedPassword = await bcrypt.hash(tempPassword, 10)
        const newUser = await User.create({
          name: body.shippingAddress?.name || customerEmail.split("@")[0],
          email: customerEmail,
          phone: customerPhone,
          password: hashedPassword,
          addresses: body.shippingAddress ? [{ ...body.shippingAddress, isDefault: true }] : [],
        })
        // Link order to new user
        await Order.findByIdAndUpdate(order._id, { user: newUser._id })
        autoCreatedUser = true
        // Send account created email
        import("@/lib/email/brevo").then(({ sendAccountCreatedEmail }) => {
          sendAccountCreatedEmail(customerEmail, body.shippingAddress?.name || "", tempPassword).catch(() => {})
        })
      } else {
        // Link order to existing user
        await Order.findByIdAndUpdate(order._id, { user: existingUser._id })
        if (body.shippingAddress && !existingUser.addresses.some((a: any) => isSameAddress(a, body.shippingAddress))) {
          existingUser.addresses.push({ ...body.shippingAddress, isDefault: existingUser.addresses.length === 0 })
          await existingUser.save()
        }
      }
    } catch { /* silent */ }
  }

  // Save the shipping address to the logged-in user's profile if it's new
  if (session?.user?.id && body.shippingAddress) {
    try {
      const user = await User.findById(session.user.id)
      if (user && !user.addresses.some((a: any) => isSameAddress(a, body.shippingAddress))) {
        user.addresses.push({ ...body.shippingAddress, isDefault: user.addresses.length === 0 })
        await user.save()
      }
    } catch { /* non-critical, don't fail the order */ }
  }

  if (customerEmail) {
    import("@/lib/email/brevo").then(({ sendOrderConfirmationEmail }) => {
      sendOrderConfirmationEmail(customerEmail, {
        orderId: order._id.toString().slice(-8).toUpperCase(),
        items: body.items.map((i: any) => ({ name: i.name, size: i.size, color: i.color, quantity: i.quantity, price: i.price })),
        finalAmount: body.finalAmount,
        discountAmount: body.discountAmount || 0,
        paymentMethod: body.paymentMethod || "cod",
        shippingAddress: body.shippingAddress,
      }).then(() => {
        import("@/models/CommunicationLog").then(({ default: CL }) => {
          CL.create({ type: "order", channel: "email", to: customerEmail, subject: `Order Confirmed #${order._id.toString().slice(-8).toUpperCase()}`, status: "sent", metadata: { orderId: order._id.toString(), amount: body.finalAmount } }).catch(() => {})
        })
      }).catch(() => {})
    }).catch(() => {})
  }

  return NextResponse.json({ orderId: order._id, message: "Order placed successfully", autoCreatedUser }, { status: 201 })
}
