import connectDB from "@/lib/mongodb"
import ScheduledEmail from "@/models/ScheduledEmail"
import CommunicationLog from "@/models/CommunicationLog"
import Waitlist from "@/models/Waitlist"
import Product from "@/models/Product"
import { sendPromoEmail } from "@/lib/email/brevo"
import { buildProductCarouselHtml, type CarouselProduct } from "@/lib/email/productCarousel"

async function getCarouselProducts(productIds: string[]): Promise<CarouselProduct[]> {
  if (productIds.length === 0) return []
  await connectDB()
  const products = await Product.find({ _id: { $in: productIds } }).select("name slug basePrice images").lean()
  const bySlug = new Map(products.map((p: any) => [String(p._id), p]))
  return productIds
    .map((id) => bySlug.get(id))
    .filter(Boolean)
    .map((p: any) => ({ name: p.name, price: p.basePrice, image: p.images?.[0] || "", slug: p.slug }))
}

async function resolveRecipients(job: { recipientType: string; to: string }): Promise<string[]> {
  if (job.recipientType === "waitlist") {
    const entries = await Waitlist.find().select("email").lean()
    return entries.map((e: any) => e.email)
  }
  return job.to.split(",").map((e) => e.trim()).filter(Boolean)
}

/** Sends one scheduled email job now, updates its status, and logs each send. */
export async function dispatchScheduledEmail(jobId: string) {
  await connectDB()
  const job = await ScheduledEmail.findById(jobId)
  if (!job || job.status !== "pending") return

  const productCarousel = buildProductCarouselHtml(await getCarouselProducts(job.productIds))
  const recipients = await resolveRecipients(job)

  let sent = 0
  let lastError = ""
  for (const email of recipients) {
    try {
      await sendPromoEmail(email, {
        subject: job.subject,
        heading: job.heading,
        content: job.content,
        productCarousel,
        ctaText: job.ctaText,
        ctaLink: job.ctaLink,
      })
      await CommunicationLog.create({ type: "marketing", channel: "email", to: email, subject: job.subject, status: "sent", metadata: { scheduledEmailId: String(job._id) } })
      sent++
    } catch (err: any) {
      lastError = err.message
      await CommunicationLog.create({ type: "marketing", channel: "email", to: email, subject: job.subject, status: "failed", error: err.message, metadata: { scheduledEmailId: String(job._id) } })
    }
  }

  job.status = sent > 0 ? "sent" : "failed"
  job.sentCount = sent
  if (lastError && sent === 0) job.error = lastError
  await job.save()
}

/** Finds all due, pending scheduled emails and sends them. */
export async function processDueScheduledEmails() {
  await connectDB()
  const due = await ScheduledEmail.find({ status: "pending", scheduledAt: { $lte: new Date() } }).select("_id").lean()
  for (const job of due) {
    await dispatchScheduledEmail(String(job._id))
  }
  return due.length
}

// ============================================
// IN-PROCESS POLLING LOOP
// Vercel Cron isn't used here — this app polls its own DB for due sends
// on a timer as long as the Node process serving admin traffic is alive
// (works for `next dev`/`next start`; won't fire during serverless idle).
// ============================================
const POLL_INTERVAL_MS = 60_000
const globalForScheduler = globalThis as unknown as { __vchukiSchedulerStarted?: boolean }

export function startScheduler() {
  if (globalForScheduler.__vchukiSchedulerStarted) return
  globalForScheduler.__vchukiSchedulerStarted = true
  setInterval(() => {
    processDueScheduledEmails().catch((err) => console.error("[scheduler] poll failed:", err.message))
  }, POLL_INTERVAL_MS)
}
