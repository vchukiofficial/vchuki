import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import OTP from "@/models/OTP"
import { sendOTPEmail } from "@/lib/email/brevo"

/**
 * Step 1 of app sign-in: check the password, then email a 4-digit code.
 * Same two-step flow as /auth/login on the website, except here no token is issued until
 * the code is verified (on the website the OTP step is cosmetic — the session already exists).
 */
export async function POST(req: NextRequest) {
  const { email: rawEmail, password } = await req.json().catch(() => ({}))
  const typed = String(rawEmail || "").trim()
  if (!typed || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 })

  await connectDB()
  // Website accounts store email as typed, so match case-insensitively
  const escaped = typed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const user = (await User.findOne({ email: new RegExp(`^${escaped}$`, "i") }).lean()) as any
  if (!user?.password || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const email: string = user.email
  const otp = Math.floor(1000 + Math.random() * 9000).toString()
  await OTP.deleteMany({ email, type: "login" })
  await OTP.create({ email, otp, type: "login", expiresAt: new Date(Date.now() + 10 * 60 * 1000) })
  let sent = true
  try { await sendOTPEmail(email, otp) } catch { sent = false }

  // Short-lived proof that the password step passed, so the app doesn't keep the password around
  const secret = process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET!
  const pendingToken = jwt.sign({ sub: user._id.toString(), email, typ: "mobile_pending" }, secret, { expiresIn: "15m" })

  return NextResponse.json({ otpRequired: true, sent, pendingToken })
}
