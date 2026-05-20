import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import { Star } from "lucide-react"

async function getProducts() {
  await connectDB()
  const featured = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean()
  const all = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(8).lean()
  return { featured: JSON.parse(JSON.stringify(featured)), all: JSON.parse(JSON.stringify(all)) }
}

export default async function HomePage() {
  const { featured, all } = await getProducts()

  const testimonials = [
    { name: "Rahul S.", city: "Delhi", text: "Best quality shirts I've found online. The Oxford shirt is now my go-to for office.", rating: 5 },
    { name: "Priya P.", city: "Bangalore", text: "Bought for my husband. He loves the fit and fabric. Will order more!", rating: 5 },
    { name: "Amit K.", city: "Mumbai", text: "Premium quality at reasonable prices. The linen shirt is perfect for summers.", rating: 4 },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="container py-16 md:py-28 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary font-medium mb-3">India&apos;s Premium Shirt Brand</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Premium Shirts for Men
          </h1>
          <p className="mt-4 md:mt-6 text-sm md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
            Handcrafted shirts in formal, casual & linen. Designed for the Indian man who demands excellence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link href="/shirts">
              <Button size="lg" className="w-full sm:w-auto px-8">Shop Collection</Button>
            </Link>
            <Link href="/shirts/formal">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">Formal Shirts</Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span>✓ Free Shipping above ₹999</span>
            <span>✓ 30-Day Returns</span>
            <span className="hidden md:inline">✓ Premium Quality</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-10 md:py-16">
        <h2 className="text-lg md:text-2xl font-bold mb-4 text-center">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {[
            { name: "Formal", href: "/shirts/formal" },
            { name: "Casual", href: "/shirts/casual" },
            { name: "Linen", href: "/shirts/linen" },
            { name: "Cotton", href: "/shirts/cotton" },
            { name: "Oversized", href: "/shirts/oversized" },
            { name: "Premium", href: "/shirts/premium" },
          ].map((cat) => (
            <Link key={cat.name} href={cat.href} className="group p-3 md:p-4 rounded-xl border bg-card text-center hover:border-primary/50 transition-all">
              <p className="text-xs md:text-sm font-medium group-hover:text-primary transition-colors">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Bestsellers */}
      <section className="container py-10 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg md:text-2xl font-bold">Bestsellers</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Most loved by our customers</p>
          </div>
          <Link href="/shirts"><Button variant="ghost" size="sm" className="text-primary text-xs">View All →</Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
          {featured.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container py-10 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-2xl font-bold">New Arrivals</h2>
          <Link href="/shirts"><Button variant="ghost" size="sm" className="text-primary text-xs">Shop All →</Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
          {all.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-muted/30 border-y">
        <div className="container py-12 md:py-20 text-center max-w-2xl mx-auto">
          <h2 className="text-lg md:text-2xl font-bold mb-4">Crafted with Purpose</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every VCHUKI shirt is designed in India, crafted from premium fabrics, and built to last.
            We believe in quality over quantity — fewer, better shirts that make you feel confident every day.
          </p>
          <Link href="/about" className="inline-block mt-4 text-sm text-primary hover:underline">Our Story →</Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-10 md:py-16">
        <h2 className="text-lg md:text-2xl font-bold mb-6 text-center">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div key={i} className="p-4 md:p-5 rounded-xl border bg-card">
              <div className="flex mb-2">
                {Array.from({ length: 5 }, (_, j) => (
                  <Star key={j} className={`h-3.5 w-3.5 ${j < t.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
              <p className="text-xs font-medium mt-3">{t.name} <span className="text-muted-foreground">— {t.city}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* USP */}
      <section className="border-y bg-card/50">
        <div className="container py-8 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          {[
            { label: "Free Shipping", sub: "Above ₹999" },
            { label: "Easy Returns", sub: "30-day policy" },
            { label: "Secure Payment", sub: "100% protected" },
            { label: "Premium Quality", sub: "47 quality checks" },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-semibold text-xs md:text-sm">{item.label}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="container py-10 md:py-16 text-center max-w-lg mx-auto">
        <h2 className="text-lg md:text-xl font-bold">Join the VCHUKI Club</h2>
        <p className="text-sm text-muted-foreground mt-1">Get 10% off your first order + exclusive access to new drops.</p>
        <form className="flex gap-2 mt-4">
          <input type="email" placeholder="Your email" className="flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm" />
          <button type="submit" className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium whitespace-nowrap">Subscribe</button>
        </form>
      </section>

      {/* Blog Preview */}
      <section className="container py-10 md:py-16 border-t">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-2xl font-bold">From Our Blog</h2>
          <Link href="/blog"><Button variant="ghost" size="sm" className="text-primary text-xs">Read More →</Button></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { slug: "best-formal-shirts-for-men", title: "10 Best Formal Shirts for Men in 2026" },
            { slug: "linen-vs-cotton-shirts", title: "Linen vs Cotton: Which is Better?" },
            { slug: "how-to-style-premium-shirts", title: "How to Style Premium Shirts" },
          ].map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="p-4 rounded-xl border bg-card hover:border-primary/30 transition-all group">
              <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{post.title}</h3>
              <span className="text-xs text-primary mt-2 inline-block">Read →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO Footer Content */}
      <section className="container py-8 border-t">
        <div className="text-xs text-muted-foreground max-w-3xl space-y-2">
          <h2 className="text-sm font-bold text-foreground">VCHUKI — Premium Shirts Online India</h2>
          <p>
            VCHUKI is India&apos;s leading premium shirt brand offering formal shirts, casual shirts, linen shirts,
            cotton shirts, and oversized shirts for men. Shop online with free shipping above ₹999, easy 30-day returns,
            and secure payments. Our shirts are crafted from premium fabrics with perfect fits designed for the Indian body type.
          </p>
          <p>
            Popular searches: vchuki shirts, premium shirts india, formal shirts for men, linen shirts online,
            casual shirts men, buy shirts online india, best cotton shirts, designer shirts india.
          </p>
        </div>
      </section>
    </>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <Image
          src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
          alt={`${product.name} - Buy online at VCHUKI`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-2.5 md:p-3">
        <h3 className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-sm md:text-base font-bold text-primary mt-0.5">₹{product.basePrice?.toLocaleString()}</p>
      </div>
    </Link>
  )
}
