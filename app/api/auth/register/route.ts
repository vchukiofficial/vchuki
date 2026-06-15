import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: NextRequest) {
  await connectDB()
  const { name, email, password } = await req.json()

  const exists = await User.findOne({ email })
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 })
  }

  const user = new User({ name, email, password })
  await user.save()

  // Send welcome email (async, non-blocking)
  import("@/lib/email/brevo").then(({ sendWelcomeEmail }) => {
    sendWelcomeEmail(email, name).catch(() => {})
  }).catch(() => {})

  return NextResponse.json({ message: "Account created" }, { status: 201 })
}
