import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import OTP from "@/models/OTP"

export async function POST(request: NextRequest) {
  await connectDB()
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  if (String(password).length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
  }

  // Require the reset code to have been verified (via /api/auth/verify-otp) in the last 15 minutes.
  // Previously anyone could reset any account's password knowing only the email address.
  const verifiedOtp = await OTP.findOneAndDelete({
    email,
    type: "reset",
    verified: true,
    updatedAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) },
  })
  if (!verifiedOtp) {
    return NextResponse.json({ error: "Please verify the code sent to your email first" }, { status: 403 })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Assign the plain password: the User pre-save hook hashes it. Hashing here as well stored a
  // hash-of-a-hash, so the new password never worked at sign-in.
  user.password = password
  await user.save()

  return NextResponse.json({ message: "Password reset successful" })
}
