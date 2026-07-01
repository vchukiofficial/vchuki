import { Metadata } from "next"
import Link from "next/link"

import connectDB from "@/lib/mongodb"
import Blog from "@/models/Blog"
import { ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "VCHUKI Journal — Men's Fashion, Style Tips & Linen Guides",
  description: "Read VCHUKI's journal for men's style tips, linen shirt guides, seasonal trends, and outfit inspiration. Expert advice on premium menswear.",
  alternates: { canonical: "https://vchuki.com/blog" },
}

export const revalidate = 60

// Fallback static posts (used if DB is empty)
const STATIC_POSTS = [
  { slug: "best-linen-shirts-for-indian-summers", title: "Best Linen Shirts for Indian Summers 2026", excerpt: "Discover why linen is the ultimate fabric for Indian heat. Our guide to choosing, styling, and caring for linen shirts.", date: "2026-06-15", category: "Fabric Guide", readTime: "5 min" },
  { slug: "linen-vs-cotton-shirts", title: "Linen vs Cotton: Which Fabric Wins for Summer?", excerpt: "A detailed comparison of linen and cotton shirts — breathability, comfort, durability, and when to wear each.", date: "2026-06-10", category: "Fabric Guide", readTime: "4 min" },
  { slug: "how-to-style-short-kurta", title: "How to Style a Short Kurta for Every Occasion", excerpt: "From festivals to office Fridays — learn how to style your linen short kurta with confidence.", date: "2026-06-05", category: "Style Tips", readTime: "4 min" },
  { slug: "jodhpur-textile-heritage", title: "The Textile Heritage of Jodhpur: Why We Craft Here", excerpt: "Explore Jodhpur's rich textile history and why VCHUKI chose this city as our home for handcrafted menswear.", date: "2026-05-28", category: "Heritage", readTime: "6 min" },
  { slug: "summer-fashion-trends-2026", title: "Summer Fashion Trends 2026: What's Hot This Season", excerpt: "Stay ahead with the latest summer fashion trends for men. Colors, patterns, and styles dominating 2026.", date: "2026-05-20", category: "Trends", readTime: "5 min" },
]

export default async function BlogPage() {
  await connectDB()
  let posts: any[] = []

  try {
    const dbPosts = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(20).lean()
    posts = dbPosts.map((p: any) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: new Date(p.createdAt).toISOString().split("T")[0],
      category: p.category,
      readTime: p.readTime,
      coverImage: p.coverImage,
    }))
  } catch { /* fallback */ }

  // Use static posts if DB is empty
  if (posts.length === 0) posts = STATIC_POSTS

  return (
    <>
      {/* Hero */}
      <section className="relative py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#2a1f14]" />
        <div className="absolute inset-0 heritage-pattern opacity-20" />
        <div className="container relative z-10 text-center px-5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-[#c4956a] font-medium mb-3">The Journal</p>
          <h1 className="text-2xl md:text-4xl font-light text-[#f5e6d3] tracking-tight">
            Style, Fabric & <span className="font-semibold text-[#c4956a]">Heritage</span>
          </h1>
          <p className="text-xs md:text-sm text-[#f5e6d3]/50 mt-3 max-w-md mx-auto">
            Expert guides on linen shirts, styling tips, and the craft behind VCHUKI.
          </p>
        </div>
      </section>

      <div className="container py-8 md:py-12 px-5 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-1.5 text-border">/</span>
          <span className="text-foreground">Journal</span>
        </nav>

        {/* Posts */}
        <div className="space-y-4 md:space-y-6">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-5 md:p-6 border border-border hover:border-[#c4956a]/30 transition-all"
            >
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2.5">
                <span className="px-2 py-0.5 bg-[#c4956a]/10 text-[#c4956a] font-medium uppercase tracking-wider">{post.category}</span>
                <span>{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{post.readTime} read</span>
              </div>
              <h2 className="text-base md:text-lg font-light tracking-tight text-foreground group-hover:text-[#c4956a] transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">{post.excerpt}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-[#c4956a] font-medium mt-3 uppercase tracking-wider group-hover:gap-2 transition-all">
                Read More <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
