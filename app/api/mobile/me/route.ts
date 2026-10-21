import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import { getRequestUser, publicUser } from "@/lib/mobileAuth"

export async function GET(req: NextRequest) {
  const me = await getRequestUser(req)
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await connectDB()
  const user = await User.findById(me.id).lean()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ user: publicUser(user) })
}

export async function PATCH(req: NextRequest) {
  const me = await getRequestUser(req)
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name } = await req.json().catch(() => ({}))
  const clean = String(name || "").trim()
  if (clean.length < 2 || clean.length > 80) return NextResponse.json({ error: "Enter a valid name" }, { status: 400 })
  await connectDB()
  const user = await User.findByIdAndUpdate(me.id, { name: clean }, { new: true }).lean()
  return NextResponse.json({ user: publicUser(user) })
}
