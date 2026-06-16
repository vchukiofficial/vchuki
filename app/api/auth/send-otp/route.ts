import { NextRequest, NextResponse } from "next/server"
import { sendOTPEmail, sendPasswordResetEmail } from "@/lib/email/brevo"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import OTP from "@/models/OTP"
import CommunicationLog from "@/models/CommunicationLog"

function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export async function POST(request: NextRequest) {
  const { email, type } = await request.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  await connectDB()

  if (type === "reset") {
    const user = await User.findOne({ email })
    if (!user) return NextResponse.json({ error: "No account found with this email" }, { status: 404 })
  } else if (type === "register") {
    const existing = await User.findOne({ email })
    if (existing) return NextResponse.json({ error: "Email already registered. Please sign in." }, { status: 400 })
  }

  // Generate random 4-digit OTP
  const otp = generateOTP()

  // Delete any existing OTP for this email+type
  await OTP.deleteMany({ email, type })

  // Store OTP with 10 minute expiry
  await OTP.create({
    email,
    otp,
    type,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  })

  try {
    if (type === "reset") {
      await sendPasswordResetEmail(email, otp)
    } else {
      await sendOTPEmail(email, otp)
    }

    await CommunicationLog.create({
      type: type === "reset" ? "reset" : "otp",
      channel: "email",
      to: email,
      subject: type === "reset" ? "Password Reset OTP" : "Login OTP",
      status: "sent",
      metadata: { otp, type },
    })

    return NextResponse.json({ message: "OTP sent", sent: true })
  } catch (error: any) {
    await CommunicationLog.create({
      type: type === "reset" ? "reset" : "otp",
      channel: "email",
      to: email,
      subject: type === "reset" ? "Password Reset OTP" : "Login OTP",
      status: "failed",
      metadata: { otp, type },
      error: error.message,
    })
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
