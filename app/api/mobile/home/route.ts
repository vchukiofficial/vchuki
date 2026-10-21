import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import HeroVideo from "@/models/HeroVideo"
import ComboOffer from "@/models/ComboOffer"
import Blog from "@/models/Blog"
import { ANNOUNCEMENTS, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, COD_FEE, DELIVERY_DAYS, DEFAULT_FABRIC, BUSINESS } from "@/lib/constants"
import { isUpiConfigured } from "@/lib/upi"

export const dynamic = "force-dynamic"

/** Home screen feed + the store rules the app must agree with (fees, thresholds). */
export async function GET() {
  await connectDB()
  const now = new Date()
  const [featured, latest, videos, offers, journal] = await Promise.all([
    Product.find({ isActive: true, isFeatured: true }).sort({ createdAt: -1 }).limit(10).lean(),
    Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(10).lean(),
    HeroVideo.find({
      isActive: true,
      $and: [
        { $or: [{ scheduledStart: { $exists: false } }, { scheduledStart: null }, { scheduledStart: { $lte: now } }] },
        { $or: [{ scheduledEnd: { $exists: false } }, { scheduledEnd: null }, { scheduledEnd: { $gte: now } }] },
      ],
    }).sort({ order: 1 }).lean(),
    ComboOffer.find({ isActive: true, validTo: { $gt: now } }).sort({ createdAt: -1 }).lean(),
    Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(4).select("title slug excerpt coverImage readTime category createdAt").lean(),
  ])

  return NextResponse.json({
    heroVideos: videos.map((v: any) => ({ _id: v._id, title: v.title, url: v.url })),
    featured,
    latest,
    comboOffers: offers.map((o: any) => ({
      _id: o._id, title: o.title, description: o.description, discount: o.discount,
      categories: o.categories, sizeGroup: o.sizeGroup, minQty: o.minQty,
    })),
    journal,
    config: {
      announcements: ANNOUNCEMENTS,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      shippingFee: SHIPPING_FEE,
      codFee: COD_FEE,
      deliveryDays: DELIVERY_DAYS,
      defaultFabric: DEFAULT_FABRIC,
      upiEnabled: isUpiConfigured(),
      supportEmail: BUSINESS.email.support,
      supportPhone: BUSINESS.phone,
      instagram: BUSINESS.social.instagram,
      siteUrl: BUSINESS.domain,
    },
  })
}
