import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Waitlist from "@/models/Waitlist"

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const { email, phone, source } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if already registered
    const existing = await Waitlist.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({
        message: "You're already on the list!",
        position: existing.position,
        earlyAccess: existing.earlyAccess,
      })
    }

    // Get current count to determine position
    const count = await Waitlist.countDocuments()
    const position = count + 1
    const earlyAccess = position <= 100 // First 100 get perks

    const entry = await Waitlist.create({
      email: email.toLowerCase(),
      phone,
      source: source || "website",
      position,
      earlyAccess,
    })

    // Send confirmation email
    try {
      const { sendWaitlistConfirmation } = await import("@/lib/email/brevo")
      await sendWaitlistConfirmation(email.toLowerCase(), position, earlyAccess)
    } catch { /* non-blocking */ }

    return NextResponse.json({
      message: earlyAccess
        ? `You're #${position}! You've unlocked 10% off + free shipping — check your email for your code.`
        : `You're #${position} on the list. We'll email you with VIP perks and updates.`,
      position: entry.position,
      earlyAccess: entry.earlyAccess,
      spotsLeft: Math.max(0, 100 - position),
    })
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "You're already on the list!" })
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const count = await Waitlist.countDocuments()
    return NextResponse.json({
      totalSignups: count,
      earlyAccessSpotsLeft: Math.max(0, 100 - count),
    })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
