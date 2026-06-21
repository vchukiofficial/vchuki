import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Waitlist from "@/models/Waitlist"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const entries = await Waitlist.find().sort({ position: 1 }).lean()
  return NextResponse.json({ entries })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  await Waitlist.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
