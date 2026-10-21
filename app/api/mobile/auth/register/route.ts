import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import OTP from "@/models/OTP"
import { signMobileToken, publicUser } from "@/lib/mobileAuth"

const Body = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(128),
  otp: z.string().regex(/^\d{4}$/),
})

/**
 * App sign-up. The app first calls the existing /api/auth/send-otp with type "register";
 * this route checks that code itself, so an account can't be created for an email the
 * person doesn't control.
 */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: "Please check your details" }, { status: 400 })
  const { name, email, password, otp } = parsed.data

  await connectDB()
  const record = await OTP.findOneAndDelete({ email, type: "register", otp, expiresAt: { $gt: new Date() } })
  if (!record) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })

  if (await User.findOne({ email })) {
    return NextResponse.json({ error: "Email already registered. Please sign in." }, { status: 400 })
  }

  // Plain password — the User pre-save hook hashes it
  const user = await User.create({ name, email, password })
  import("@/lib/email/brevo").then(({ sendWelcomeEmail }) => sendWelcomeEmail(email, name).catch(() => {})).catch(() => {})

  return NextResponse.json({ token: signMobileToken(user), user: publicUser(user) }, { status: 201 })
}
