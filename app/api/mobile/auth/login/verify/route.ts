import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import OTP from "@/models/OTP"
import { signMobileToken, publicUser } from "@/lib/mobileAuth"

/** Step 2 of app sign-in: exchange the pending token + emailed code for a session token. */
export async function POST(req: NextRequest) {
  const { pendingToken, otp } = await req.json().catch(() => ({}))
  if (!pendingToken || !otp) return NextResponse.json({ error: "Code required" }, { status: 400 })

  let payload: jwt.JwtPayload
  try {
    payload = jwt.verify(pendingToken, process.env.MOBILE_JWT_SECRET || process.env.NEXTAUTH_SECRET!) as jwt.JwtPayload
    if (payload.typ !== "mobile_pending") throw new Error("bad token")
  } catch {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 })
  }

  await connectDB()
  const record = await OTP.findOneAndDelete({
    email: payload.email,
    type: "login",
    otp: String(otp),
    expiresAt: { $gt: new Date() },
  })
  if (!record) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 })

  const user = await User.findById(payload.sub).lean()
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 })
  return NextResponse.json({ token: signMobileToken(user as any), user: publicUser(user) })
}
