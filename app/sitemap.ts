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

  const categories = ["linen-full-sleeve", "linen-half-sleeve", "kurta-full-sleeve", "kurta-half-sleeve"]
  const categoryUrls = categories.map((cat) => ({
    url: `${BASE_URL}/shirts/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }))

  let blogUrls: MetadataRoute.Sitemap = []
  try {
    const Blog = (await import("@/models/Blog")).default
    const dbBlogs = await Blog.find({ isPublished: true }).select("slug updatedAt").lean()
    blogUrls = dbBlogs.map((b: any) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch { /* fallback */ }

  // Fallback static blog slugs if DB is empty
  if (blogUrls.length === 0) {
    const staticSlugs = [
      "best-linen-shirts-for-indian-summers",
      "linen-vs-cotton-shirts",
      "how-to-style-short-kurta",
      "jodhpur-textile-heritage",
      "summer-fashion-trends-2026",
    ]
    blogUrls = staticSlugs.map((slug) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  }

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/shirts`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/vip`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms-and-conditions`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/refund-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/shipping-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    ...categoryUrls,
    ...productUrls,
    ...blogUrls,
  ]
}
