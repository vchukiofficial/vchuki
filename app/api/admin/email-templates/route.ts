import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import EmailTemplate from "@/models/EmailTemplate"

// Default templates seeded on first GET if none exist
const DEFAULT_TEMPLATES = [
  {
    slug: "otp-verification",
    name: "OTP Verification",
    subject: "Your VCHUKI Verification Code",
    body: `<h2 style="color:#2a1f14;">Verification Code</h2>
<p style="color:#666;font-size:14px;">Hi {{name}}, use this code to verify your identity:</p>
<div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">
  <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">{{otp}}</span>
</div>
<p style="color:#999;font-size:12px;">This code expires in 10 minutes. Do not share it with anyone.</p>`,
    variables: ["name", "otp"],
  },
  {
    slug: "password-reset",
    name: "Password Reset",
    subject: "Reset Your VCHUKI Password",
    body: `<h2 style="color:#2a1f14;">Password Reset</h2>
<p style="color:#666;font-size:14px;">Hi {{name}}, use this code to reset your password:</p>
<div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">
  <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">{{otp}}</span>
</div>
<p style="color:#999;font-size:12px;">If you didn't request this, please ignore this email.</p>`,
    variables: ["name", "otp"],
  },
  {
    slug: "welcome",
    name: "Welcome Email",
    subject: "Welcome to VCHUKI — Premium Linen for Modern Men",
    body: `<h2 style="color:#2a1f14;">Welcome, {{name}}!</h2>
<p style="color:#666;font-size:14px;">Thank you for joining VCHUKI. You now have access to our premium linen collection crafted in Jodhpur.</p>
<div style="margin:24px 0;">
  <a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Shop Collection</a>
</div>
<p style="color:#999;font-size:12px;">Use code <strong>WELCOME10</strong> for 10% off your first order.</p>`,
    variables: ["name"],
  },
  {
    slug: "order-confirmation",
    name: "Order Confirmation",
    subject: "Order Confirmed — #{{orderId}}",
    body: `<h2 style="color:#2a1f14;">Order Confirmed! 🎉</h2>
<p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #{{orderId}}</p>
{{itemsTable}}
{{discountLine}}
<p style="font-size:16px;font-weight:bold;color:#2a1f14;">Total: ₹{{finalAmount}}</p>
<p style="color:#666;font-size:12px;">Payment: {{paymentMethod}}</p>
<div style="background:#f9f9f9;padding:12px;margin:16px 0;border-left:3px solid #c4956a;">
  <p style="font-size:11px;color:#c4956a;margin-bottom:4px;">DELIVERING TO</p>
  <p style="font-size:13px;color:#333;margin:0;">{{shippingAddress}}</p>
</div>
<a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;">Track Order</a>`,
    variables: ["orderId", "itemsTable", "discountLine", "finalAmount", "paymentMethod", "shippingAddress"],
  },
  {
    slug: "shipping-update",
    name: "Shipping Update",
    subject: "Order Update — #{{orderId}}",
    body: `<h2 style="color:#2a1f14;">Shipping Update</h2>
<p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #{{orderId}}</p>
<div style="background:#f5e6d3;padding:16px;margin:16px 0;border-left:4px solid #c4956a;">
  <p style="font-size:14px;color:#2a1f14;margin:0;">{{statusMessage}}</p>
</div>
{{trackingInfo}}
<a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;margin-top:12px;">Track Order</a>`,
    variables: ["orderId", "statusMessage", "trackingInfo"],
  },
  {
    slug: "abandoned-cart",
    name: "Abandoned Cart",
    subject: "You Left Something Behind — VCHUKI",
    body: `<h2 style="color:#2a1f14;">Your bag is waiting</h2>
<p style="color:#666;font-size:14px;">Hi {{name}}, you have items in your cart:</p>
{{itemsList}}
<a href="https://vchuki.com/cart" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;margin-top:16px;">Complete Purchase</a>
<p style="color:#999;font-size:11px;margin-top:16px;">Free shipping on orders above ₹1,599</p>`,
    variables: ["name", "itemsList"],
  },
]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()

  // Seed defaults if empty
  const count = await EmailTemplate.countDocuments()
  if (count === 0) {
    await EmailTemplate.insertMany(DEFAULT_TEMPLATES)
  }

  const templates = await EmailTemplate.find().sort({ createdAt: 1 }).lean()
  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const body = await request.json()
  const template = await EmailTemplate.create(body)
  return NextResponse.json(template, { status: 201 })
}
