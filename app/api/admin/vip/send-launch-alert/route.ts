import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Waitlist from "@/models/Waitlist"
import Coupon from "@/models/Coupon"
import { sendVIPLaunchAlert } from "@/lib/email/brevo"
import { buildProductCarouselHtml } from "@/lib/email/productCarousel"
import { getRandomCarouselProducts } from "@/lib/email/carouselProducts"
import { LAUNCH_DAY_END } from "@/lib/launchSchedule"

const VIP_LAUNCH_CODE = "VIPACCESS10"

async function ensureLaunchCoupon() {
  const existing = await Coupon.findOne({ code: VIP_LAUNCH_CODE })
  if (existing) return
  await Coupon.create({
    code: VIP_LAUNCH_CODE,
    type: "percentage",
    value: 10,
    maxValue: 300,
    validFrom: new Date(),
    validTo: LAUNCH_DAY_END,
    usageLimit: 1000,
    isActive: true,
  })
}

// Admin-triggered replacement for the old Vercel Cron job — Hobby plan crons only run once a
// day with ±59min precision, too imprecise for a fixed 9AM launch moment. The admin clicks this
// button when they're ready; each waitlist entry is still only ever emailed once (launchEmailSentAt).
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  await ensureLaunchCoupon()

  const pending = await Waitlist.find({ earlyAccess: true, launchEmailSentAt: { $exists: false } }).lean()
  const alreadySent = await Waitlist.countDocuments({ earlyAccess: true, launchEmailSentAt: { $exists: true } })

  if (pending.length === 0) {
    return NextResponse.json({ status: "done", sent: 0, alreadySent })
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
      // leave launchEmailSentAt unset so the admin can retry by clicking again
    }
  }

  return NextResponse.json({ status: "sent", sent, total: pending.length, alreadySent })
}
