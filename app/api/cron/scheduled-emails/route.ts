import { NextRequest, NextResponse } from "next/server"
import { processDueScheduledEmails } from "@/lib/email/scheduler"

// Triggered by Vercel Cron (see vercel.json) — picks up any ScheduledEmail campaigns
// from the Communications compose flow that are pending and due.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sent = await processDueScheduledEmails()
  return NextResponse.json({ status: "ok", processed: sent })
}
