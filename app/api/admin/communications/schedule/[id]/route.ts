import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ScheduledEmail from "@/models/ScheduledEmail"

// PATCH — cancel a pending scheduled campaign
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const job = await ScheduledEmail.findById(params.id)
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (job.status !== "pending") return NextResponse.json({ error: "Only pending campaigns can be cancelled" }, { status: 400 })

  job.status = "cancelled"
  await job.save()
  return NextResponse.json({ success: true })
}
