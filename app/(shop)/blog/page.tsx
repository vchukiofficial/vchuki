import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Fashion Blog — Style Tips, Trends & Guides for Men",
  description: "Read VCHUKI's fashion blog for men's style tips, shirt guides, seasonal trends, and outfit inspiration. Expert advice on formal, casual & linen shirts.",
  alternates: { canonical: "https://vchuki.com/blog" },
}

const posts = [
  {
    slug: "best-formal-shirts-for-men",
    title: "10 Best Formal Shirts for Men in 2026",
    excerpt: "Discover the top formal shirts that every man needs in his wardrobe. From classic Oxford to modern slim-fit designs.",
    date: "2026-05-15",
    category: "Style Guide",
    readTime: "5 min",
  },
  {
    slug: "linen-vs-cotton-shirts",
    title: "Linen vs Cotton Shirts: Which is Better for Indian Summers?",
    excerpt: "A detailed comparison of linen and cotton shirts — breathability, comfort, durability, and when to wear each.",
    date: "2026-05-10",
    category: "Fabric Guide",
    readTime: "4 min",
  },
  {
    slug: "summer-fashion-trends-2026",
    title: "Summer Fashion Trends 2026: What's Hot This Season",
    excerpt: "Stay ahead of the curve with the latest summer fashion trends for men. Colors, patterns, and styles dominating 2026.",
    date: "2026-05-05",
    category: "Trends",
    readTime: "6 min",
  },
  {
    slug: "how-to-style-premium-shirts",
    title: "How to Style Premium Shirts for Every Occasion",
    excerpt: "From boardroom to brunch — learn how to style your premium shirts for different occasions with confidence.",
    date: "2026-04-28",
    category: "Style Tips",
    readTime: "4 min",
  },
  {
    slug: "top-casual-shirts-india",
    title: "Top 8 Casual Shirts Every Indian Man Should Own",
    excerpt: "Build the perfect casual wardrobe with these essential shirt styles that work for every body type and occasion.",
    date: "2026-04-20",
    category: "Essentials",
    readTime: "5 min",
  },
]

export default function BlogPage() {
  return (
    <div className="container py-4 md:py-8 max-w-4xl">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Blog</span>
      </nav>

      <h1 className="text-xl md:text-3xl font-bold mb-2">VCHUKI Fashion Blog</h1>
      <p className="text-sm text-muted-foreground mb-8">Style tips, fabric guides & fashion trends for the modern man.</p>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block p-4 md:p-6 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">{post.category}</span>
              <span>{post.date}</span>
              <span>· {post.readTime} read</span>
            </div>
            <h2 className="text-base md:text-lg font-bold group-hover:text-primary transition-colors">{post.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
