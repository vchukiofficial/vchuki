import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"
import Review from "@/models/Review"
import "@/models/User"

/** Everything the product screen needs in one round-trip — mirrors app/(shop)/product/[slug]/page.tsx. */
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  await connectDB()
  const product = (await Product.findOne({ slug: params.slug, isActive: true }).lean()) as any
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [variants, reviewsRaw, siblings] = await Promise.all([
    ProductVariant.find({ product: product._id }).lean(),
    Review.find({ product: product._id, status: { $ne: "hidden" } })
      .populate("user", "name")
      .sort({ featured: -1, createdAt: -1 })
      .limit(50)
      .lean()
      .catch(() => Review.find({ product: product._id, status: { $ne: "hidden" } }).limit(50).lean()),
    Product.find({ category: product.category, _id: { $ne: product._id }, isActive: true }).select("name slug images basePrice comparePrice").lean(),
  ])

  // Colour swatches link to sibling products (each colour is its own product on VCHUKI)
  const siblingVariants = siblings.length
    ? await ProductVariant.find({ product: { $in: siblings.map((s: any) => s._id) } }).select("product color").lean()
    : []
  const siblingColors = siblings
    .map((s: any) => {
      const v = siblingVariants.find((x: any) => String(x.product) === String(s._id)) as any
      return v?.color ? { name: v.color.name, hex: v.color.hex, slug: s.slug } : null
    })
    .filter(Boolean)

  const reviews = (reviewsRaw as any[]).map((r) => ({
    _id: r._id,
    rating: r.rating,
    comment: r.comment || "",
    images: r.images || [],
    verifiedPurchase: !!r.verifiedPurchase,
    userName: (r.user && typeof r.user === "object" && r.user.name) || "VCHUKI customer",
    createdAt: r.createdAt,
  }))
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0

  return NextResponse.json({
    product,
    variants,
    reviews,
    rating: { average: Math.round(avgRating * 10) / 10, count: reviews.length },
    siblingColors,
    related: siblings.slice(0, 6),
  })
}
