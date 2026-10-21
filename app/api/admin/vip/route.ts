import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import Waitlist from "@/models/Waitlist"

export async function GET(request: NextRequest) {
  try {
    const session = await sessionFor(request)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized", entries: [] }, { status: 401 })
    }

    await connectDB()
    const entries = await Waitlist.find().sort({ position: 1 }).lean()
    return NextResponse.json({ entries })
  } catch (err: any) {
    return NextResponse.json({ error: err.message, entries: [] }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  await Waitlist.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
