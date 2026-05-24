import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import PageView from "@/models/PageView"

// POST — Record a page view (called from client tracker)
export async function POST(request: NextRequest) {
  await connectDB()
  const body = await request.json()
  const ua = request.headers.get("user-agent") || ""
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

  // Detect device
  const device = /mobile|android|iphone/i.test(ua) ? "mobile" : /tablet|ipad/i.test(ua) ? "tablet" : "desktop"

  await PageView.create({
    path: body.path,
    referrer: body.referrer || "",
    userAgent: ua.substring(0, 200),
    device,
    sessionId: body.sessionId,
    userId: body.userId || undefined,
    ip,
    duration: body.duration || 0,
  })

  return NextResponse.json({ ok: true })
}

// GET — Fetch analytics (admin only)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()
  const { searchParams } = new URL(request.url)
  const days = Number(searchParams.get("days")) || 7

  const since = new Date(Date.now() - days * 86400000)

  const [
    totalViews,
    uniqueSessions,
    pageBreakdown,
    deviceBreakdown,
    hourlyBreakdown,
    topReferrers,
    recentViews,
  ] = await Promise.all([
    // Total page views
    PageView.countDocuments({ createdAt: { $gte: since } }),
    // Unique sessions
    PageView.distinct("sessionId", { createdAt: { $gte: since } }).then(s => s.length),
    // Views per page
    PageView.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$path", views: { $sum: 1 }, avgDuration: { $avg: "$duration" } } },
      { $sort: { views: -1 } },
      { $limit: 20 },
    ]),
    // Device breakdown
    PageView.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]),
    // Hourly breakdown (last 24h)
    PageView.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 86400000) } } },
      { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    // Top referrers
    PageView.aggregate([
      { $match: { createdAt: { $gte: since }, referrer: { $ne: "" } } },
      { $group: { _id: "$referrer", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    // Recent views
    PageView.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(20).lean(),
  ])

  // Today's views
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const todayViews = await PageView.countDocuments({ createdAt: { $gte: todayStart } })

  return NextResponse.json({
    totalViews,
    uniqueSessions,
    todayViews,
    pageBreakdown,
    deviceBreakdown,
    hourlyBreakdown,
    topReferrers,
    recentViews: recentViews.map((v: any) => ({ path: v.path, device: v.device, createdAt: v.createdAt })),
  })
}
