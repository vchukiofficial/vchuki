import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(request: NextRequest) {
  await connectDB()
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  user.password = hashedPassword
  await user.save()

  return NextResponse.json({ message: "Password reset successful" })
}
