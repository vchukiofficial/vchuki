import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import OTP from "@/models/OTP"

export async function POST(request: NextRequest) {
  const { email, otp, type } = await request.json()
  if (!email || !otp) return NextResponse.json({ error: "Email and OTP required" }, { status: 400 })

  await connectDB()

  const record = await OTP.findOne({
    email,
    type: type || "login",
    otp,
    expiresAt: { $gt: new Date() },
    verified: false,
  })

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
  }

  // Mark as verified
  record.verified = true
  await record.save()

  return NextResponse.json({ verified: true })
}
