import { MetadataRoute } from "next"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"

const BASE_URL = "https://vchuki.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB()
  const products = await Product.find({ isActive: true }).select("slug updatedAt").lean()

  const productUrls = products.map((p: any) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  const categories = ["formal", "casual", "linen", "cotton", "oversized", "premium"]
  const categoryUrls = categories.map((cat) => ({
    url: `${BASE_URL}/shirts/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }))

  const blogSlugs = [
    "best-formal-shirts-for-men",
    "linen-vs-cotton-shirts",
    "summer-fashion-trends-2026",
    "how-to-style-premium-shirts",
    "top-casual-shirts-india",
  ]
  const blogUrls = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/shirts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...categoryUrls,
    ...productUrls,
    ...blogUrls,
  ]
}
