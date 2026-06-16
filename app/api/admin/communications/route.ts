import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import CommunicationLog from "@/models/CommunicationLog"

// GET — fetch all communication logs
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const limit = Number(searchParams.get("limit")) || 50

  const query: any = {}
  if (type && type !== "all") query.type = type

  const logs = await CommunicationLog.find(query).sort({ createdAt: -1 }).limit(limit).lean()
  const counts = {
    total: await CommunicationLog.countDocuments(),
    otp: await CommunicationLog.countDocuments({ type: "otp" }),
    order: await CommunicationLog.countDocuments({ type: "order" }),
    shipping: await CommunicationLog.countDocuments({ type: "shipping" }),
    marketing: await CommunicationLog.countDocuments({ type: "marketing" }),
    reset: await CommunicationLog.countDocuments({ type: "reset" }),
    failed: await CommunicationLog.countDocuments({ status: "failed" }),
  }

  return NextResponse.json({ logs, counts })
}

// POST — send marketing email from admin
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const { to, subject, body: htmlBody } = await request.json()

  if (!to || !subject || !htmlBody) return NextResponse.json({ error: "to, subject, body required" }, { status: 400 })

  const BREVO_API_KEY = process.env.BREVO_API_KEY || ""

  if (!BREVO_API_KEY) {
    return NextResponse.json({ error: "BREVO_API_KEY not configured in environment variables" }, { status: 500 })
  }

  try {
    const emails = to.split(",").map((e: string) => ({ email: e.trim() }))
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "api-key": BREVO_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        sender: { name: "VCHUKI", email: process.env.BREVO_SENDER_EMAIL || "support@vchuki.com" },
        to: emails,
        subject,
        htmlContent: htmlBody,
      }),
    })
    const data = await res.json()

    const status = res.ok ? "sent" : "failed"
    await CommunicationLog.create({
      type: "marketing",
      channel: "email",
      to,
      subject,
      status,
      metadata: { recipients: emails.length, messageId: data.messageId },
      error: res.ok ? undefined : data.message,
    })

    if (!res.ok) return NextResponse.json({ error: data.message }, { status: 400 })
    return NextResponse.json({ success: true, messageId: data.messageId })
  } catch (error: any) {
    await CommunicationLog.create({ type: "marketing", channel: "email", to, subject, status: "failed", error: error.message })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
