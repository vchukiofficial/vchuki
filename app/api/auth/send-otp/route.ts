import { NextRequest, NextResponse } from "next/server"
import { sendOTPEmail, sendPasswordResetEmail } from "@/lib/email/brevo"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import CommunicationLog from "@/models/CommunicationLog"

export async function POST(request: NextRequest) {
  const { email, type } = await request.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  await connectDB()

  if (type === "reset") {
    const user = await User.findOne({ email })
    if (!user) return NextResponse.json({ error: "No account found with this email" }, { status: 404 })
  }

  const otp = "1111"

  try {
    if (type === "reset") {
      await sendPasswordResetEmail(email, otp)
    } else {
      await sendOTPEmail(email, otp)
    }

    // Log to database
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
