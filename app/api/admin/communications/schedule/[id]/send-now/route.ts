import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ScheduledEmail from "@/models/ScheduledEmail"
import { dispatchScheduledEmail } from "@/lib/email/scheduler"

// POST — dispatch a pending scheduled campaign immediately, bypassing its scheduledAt
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const job = await ScheduledEmail.findById(params.id)
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (job.status !== "pending") return NextResponse.json({ error: "Only pending campaigns can be sent now" }, { status: 400 })

  await dispatchScheduledEmail(params.id)
  const fresh = await ScheduledEmail.findById(params.id).lean()
  return NextResponse.json({ success: true, job: fresh })
}
