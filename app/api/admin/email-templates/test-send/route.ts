import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import { brevoSend } from "@/lib/email/brevo"

export async function POST(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { to, subject, html } = await request.json()
  if (!to || !subject || !html) return NextResponse.json({ error: "Missing to, subject, or html" }, { status: 400 })

  try {
    await brevoSend(to, `[TEST] ${subject}`, html)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Send failed" }, { status: 500 })
  }
}
