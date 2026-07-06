import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import type { CarouselProduct } from "./productCarousel"

/** Picks a fresh random set of in-stock, ideally-featured products for email/site carousels. Server-only. */
export async function getRandomCarouselProducts(count = 4): Promise<CarouselProduct[]> {
  await connectDB()
  let pool = await Product.find({ isActive: true, isFeatured: true, "images.0": { $exists: true } })
    .select("name slug basePrice images")
    .lean()
  if (pool.length === 0) {
    pool = await Product.find({ isActive: true, "images.0": { $exists: true } })
      .select("name slug basePrice images")
      .lean()
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((p: any) => ({
    name: p.name,
    price: p.basePrice,
    image: p.images[0],
    slug: p.slug,
  }))
}
