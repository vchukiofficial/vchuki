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

// PUT — edit a pending scheduled campaign's content/recipients/send time
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()
  const job = await ScheduledEmail.findById(params.id)
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (job.status !== "pending") return NextResponse.json({ error: "Only pending campaigns can be edited" }, { status: 400 })

  const { recipientType, to, subject, heading, content, bannerImageUrl, productIds, ctaText, ctaLink, scheduledAt } = await request.json()

  if (!subject || !heading || !content) return NextResponse.json({ error: "subject, heading, content required" }, { status: 400 })
  if (recipientType === "custom" && !to) return NextResponse.json({ error: "to is required for custom recipients" }, { status: 400 })

  job.recipientType = recipientType === "waitlist" ? "waitlist" : "custom"
  job.to = to || ""
  job.subject = subject
  job.heading = heading
  job.content = content
  job.bannerImageUrl = bannerImageUrl || ""
  job.productIds = productIds || []
  job.ctaText = ctaText || "Shop Now"
  job.ctaLink = ctaLink || "https://vchuki.com/shirts"
  if (scheduledAt) job.scheduledAt = new Date(scheduledAt)

  await job.save()
  return NextResponse.json({ success: true, job })
}
