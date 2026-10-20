import mongoose from "mongoose"
import Review from "@/models/Review"
import Product from "@/models/Product"

/** Recompute a product's rating and review count from its approved reviews, so listing
 * cards always show the same numbers as the product page. */
export async function recomputeProductRating(productId: string | mongoose.Types.ObjectId | undefined | null) {
  if (!productId) return
  const id = typeof productId === "string" ? new mongoose.Types.ObjectId(productId) : productId
  const [stats] = await Review.aggregate([
    { $match: { product: id, status: "approved" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ])
  await Product.updateOne(
    { _id: id },
    { $set: { rating: stats ? Math.round(stats.avg * 10) / 10 : 0, reviewCount: stats?.count ?? 0 } }
  )
}
