import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Waitlist from "@/models/Waitlist"
import { sendPromoEmail } from "@/lib/email/brevo"
import { buildProductCarouselHtml } from "@/lib/email/productCarousel"
import { getRandomCarouselProducts } from "@/lib/email/carouselProducts"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { email, bulk, subject, message, includeCarousel } = await request.json()

  const productCarousel = includeCarousel ? buildProductCarouselHtml(await getRandomCarouselProducts()) : ""
  const content = `<p style="color:#666;font-size:14px;">${message}</p>`

  if (bulk) {
    const entries = await Waitlist.find().lean()
    let sent = 0
    for (const entry of entries) {
      try {
        await sendPromoEmail((entry as any).email, {
          subject,
          heading: subject,
          content,
          productCarousel,
          ctaText: "Shop Now",
          ctaLink: "https://vchuki.com/shirts",
        })
        sent++
      } catch { /* continue */ }
    }
    return NextResponse.json({ success: true, sent })
  }

  // Single email
  try {
    await sendPromoEmail(email, {
      subject,
      heading: subject,
      content,
      productCarousel,
      ctaText: "Shop Now",
      ctaLink: "https://vchuki.com/shirts",
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
