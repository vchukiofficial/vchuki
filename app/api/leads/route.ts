import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Lead from "@/models/Lead"

/**
 * POST /api/leads — capture a lead.
 *
 * Called by scripts/daily-pulse.mjs for Instagram comments, and by the site
 * for form captures. Idempotent on commentId, so re-running the pulse does
 * not create duplicates. Requires the `x-leads-key` header to match LEADS_API_KEY.
 */
export async function POST(req: NextRequest) {
  // Write access needs the shared key (set LEADS_API_KEY in Vercel and in the pulse script's env).
  // Without it configured the endpoint stays closed rather than open to the internet.
  const key = process.env.LEADS_API_KEY
  if (!key) return NextResponse.json({ error: "Lead capture is not configured" }, { status: 503 })
  if (req.headers.get("x-leads-key") !== key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await connectDB()
    const body = await req.json()

    const {
      name,
      instagramHandle,
      phone,
      email,
      source,
      sourceDetail,
      permalink,
      commentId,
      commentText,
      commentAt,
      interestedInText,
      notes,
    } = body

    if (!instagramHandle && !phone && !email) {
      return NextResponse.json(
        { error: "Need at least one of instagramHandle, phone or email" },
        { status: 400 }
      )
    }

    // Same comment seen twice — return the existing lead rather than duplicating.
    if (commentId) {
      const existing = await Lead.findOne({ commentId })
      if (existing) {
        return NextResponse.json({ lead: existing, created: false })
      }
    }

    // Same person, still open — attach to the existing record.
    if (!commentId) {
      const match = await Lead.findOne({
        stage: { $nin: ["converted", "lost"] },
        $or: [
          instagramHandle ? { instagramHandle: instagramHandle.toLowerCase() } : null,
          phone ? { phone } : null,
          email ? { email: email.toLowerCase() } : null,
        ].filter(Boolean) as any[],
      })
      if (match) {
        match.lastContactedAt = new Date()
        if (notes) match.notes = [match.notes, notes].filter(Boolean).join("\n")
        await match.save()
        return NextResponse.json({ lead: match, created: false })
      }
    }

    const at = commentAt ? new Date(commentAt) : undefined

    const lead = await Lead.create({
      name,
      instagramHandle,
      phone,
      email,
      source: source || (commentId ? "instagram_comment" : "website"),
      sourceDetail,
      permalink,
      commentId,
      commentText,
      commentAt: at,
      // Meta: one automated DM per comment, within 7 days.
      dmWindowExpiresAt: at ? new Date(at.getTime() + 7 * 24 * 60 * 60 * 1000) : undefined,
      interestedInText,
      notes,
    })

    return NextResponse.json({ lead, created: true }, { status: 201 })
  } catch (err: any) {
    // Unique index on commentId can still race two concurrent writes.
    if (err?.code === 11000 && err?.keyPattern?.commentId) {
      const lead = await Lead.findOne({ commentId: err.keyValue.commentId })
      return NextResponse.json({ lead, created: false })
    }
    console.error("[leads] create failed:", err)
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 })
  }
}
