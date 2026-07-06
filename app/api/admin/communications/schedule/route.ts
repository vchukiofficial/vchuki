import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ScheduledEmail from "@/models/ScheduledEmail"
import { dispatchScheduledEmail, startScheduler } from "@/lib/email/scheduler"

// GET — list scheduled/sent campaigns
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  startScheduler()
  await connectDB()
  const jobs = await ScheduledEmail.find().sort({ scheduledAt: -1 }).limit(100).lean()
  return NextResponse.json({ jobs })
}

// POST — create a campaign; sends immediately if scheduledAt is now/past, otherwise queues it
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  startScheduler()
  await connectDB()
  const { recipientType, to, subject, heading, content, bannerImageUrl, productIds, ctaText, ctaLink, scheduledAt } = await request.json()

  if (!subject || !heading || !content) return NextResponse.json({ error: "subject, heading, content required" }, { status: 400 })
  if (recipientType === "custom" && !to) return NextResponse.json({ error: "to is required for custom recipients" }, { status: 400 })

  const when = scheduledAt ? new Date(scheduledAt) : new Date()

  const job = await ScheduledEmail.create({
    recipientType: recipientType === "waitlist" ? "waitlist" : "custom",
    to: to || "",
    subject,
    heading,
    content,
    bannerImageUrl: bannerImageUrl || "",
    productIds: productIds || [],
    ctaText: ctaText || "Shop Now",
    ctaLink: ctaLink || "https://vchuki.com/shirts",
    scheduledAt: when,
    createdBy: session.user.email || "",
  })

  if (when.getTime() <= Date.now()) {
    await dispatchScheduledEmail(String(job._id))
    const fresh = await ScheduledEmail.findById(job._id).lean()
    return NextResponse.json({ success: true, job: fresh })
  }

  return NextResponse.json({ success: true, job })
}
