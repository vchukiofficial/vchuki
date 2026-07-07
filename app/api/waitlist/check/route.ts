import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Waitlist from "@/models/Waitlist"

// Used by checkout to silently decide which discount to auto-apply — deliberately returns
// nothing beyond the one boolean it needs, not the full waitlist entry.
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase()
  if (!email) return NextResponse.json({ earlyAccess: false })

  await connectDB()
  const entry = await Waitlist.findOne({ email, earlyAccess: true }).select("_id").lean()
  return NextResponse.json({ earlyAccess: !!entry })
}
