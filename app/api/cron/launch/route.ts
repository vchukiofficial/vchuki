import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Waitlist from "@/models/Waitlist"
import Coupon from "@/models/Coupon"
import { sendVIPLaunchAlert } from "@/lib/email/brevo"
import { buildProductCarouselHtml } from "@/lib/email/productCarousel"
import { getRandomCarouselProducts } from "@/lib/email/carouselProducts"
import { VIP_EARLY_ACCESS_DATE } from "@/lib/launchSchedule"

const VIP_LAUNCH_CODE = "VIPACCESS10"

async function ensureLaunchCoupon() {
  const existing = await Coupon.findOne({ code: VIP_LAUNCH_CODE })
  if (existing) return
  await Coupon.create({
    code: VIP_LAUNCH_CODE,
    type: "percentage",
    value: 10,
    validFrom: VIP_EARLY_ACCESS_DATE,
    validTo: new Date(VIP_EARLY_ACCESS_DATE.getTime() + 30 * 86400000), // valid for 30 days after launch
    usageLimit: 1000,
    isActive: true,
  })
}

// Triggered by Vercel Cron (see vercel.json) every few minutes — safe to call repeatedly,
// each waitlist entry is only ever emailed once (tracked via launchEmailSentAt).
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const now = new Date()
  if (now < VIP_EARLY_ACCESS_DATE) {
    return NextResponse.json({ status: "waiting", launchesAt: VIP_EARLY_ACCESS_DATE })
  }

  await ensureLaunchCoupon()

  const pending = await Waitlist.find({ launchEmailSentAt: { $exists: false } }).lean()
  if (pending.length === 0) {
    return NextResponse.json({ status: "done", sent: 0 })
  }

  const carousel = buildProductCarouselHtml(await getRandomCarouselProducts())

  let sent = 0
  for (const entry of pending) {
    try {
      await sendVIPLaunchAlert((entry as any).email, {
        name: (entry as any).email.split("@")[0],
        discountCode: VIP_LAUNCH_CODE,
        productCarousel: carousel,
      })
      await Waitlist.updateOne({ _id: (entry as any)._id }, { launchEmailSentAt: new Date() })
      sent++
    } catch {
      // leave launchEmailSentAt unset so the next cron run retries this entry
    }
  }

  return NextResponse.json({ status: "sent", sent, total: pending.length })
}
