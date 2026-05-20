import Link from "next/link"
import Image from "next/image"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import { Star } from "lucide-react"

async function getProducts() {
  await connectDB()
  const featured = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean()
  const newArrivals = await Product.find({ isActive: true, tags: { $in: ["new-launch"] } }).sort({ createdAt: -1 }).limit(4).lean()
  return { featured: JSON.parse(JSON.stringify(featured)), newArrivals: JSON.parse(JSON.stringify(newArrivals)) }
}

export default async function HomePage() {
  const { featured, newArrivals } = await getProducts()

  return (
    <>
      {/* Hero — Full screen cinematic */}
      <section className="relative h-[85vh] md:h-[90vh] flex items-end overflow-hidden bg-[#f5f0eb] dark:bg-[#0a0a0a]">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1400&q=90"
            alt="VCHUKI Premium Shirts Collection"
            fill
            className="object-cover object-center opacity-90 dark:opacity-60"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        <div className="relative container pb-16 md:pb-24">
          <div className="max-w-lg animate-fade-up">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">New Collection 2026</p>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight">
              Crafted for<br />
              <span className="font-semibold">Confidence</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-sm leading-relaxed">
              Premium shirts designed for the modern Indian man. Exceptional fabrics, perfect fits, honest prices.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/shirts" className="px-6 md:px-8 py-3 bg-foreground text-background text-xs md:text-sm font-medium tracking-wide hover:opacity-90 transition-opacity">
                SHOP NOW
              </Link>
              <Link href="/shirts/premium" className="px-6 md:px-8 py-3 border border-foreground/20 text-xs md:text-sm font-medium tracking-wide hover:border-foreground/50 transition-colors">
                PREMIUM
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories — Clean grid */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 stagger">
          {[
            { name: "Formal", slug: "formal", img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&q=80" },
            { name: "Casual", slug: "casual", img: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500&q=80" },
            { name: "Linen", slug: "linen", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80" },
            { name: "Premium", slug: "premium", img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80" },
          ].map((cat) => (
            <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden img-zoom">
              <Image src={cat.img} alt={`${cat.name} Shirts`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <p className="text-white text-sm md:text-base font-medium tracking-wide">{cat.name}</p>
                <p className="text-white/60 text-[10px] md:text-xs mt-0.5 group-hover:text-white/90 transition-colors">Explore →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Curated Selection</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">Bestsellers</h2>
          </div>
          <Link href="/shirts?tag=bestseller" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 stagger">
          {featured.slice(0, 8).map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Story Banner */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-secondary/50">
        <div className="container text-center max-w-2xl mx-auto">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">The VCHUKI Promise</p>
          <h2 className="text-2xl md:text-4xl font-light leading-snug tracking-tight">
            47 quality checks. Premium fabrics.<br className="hidden md:block" /> Designed for the Indian climate.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Every shirt is pre-washed, pre-shrunk, and color-tested. We obsess over details so you don&apos;t have to.
          </p>
          <Link href="/about" className="inline-block mt-8 text-xs tracking-[0.15em] uppercase border-b border-foreground/30 pb-0.5 hover:border-foreground transition-colors">
            Our Story
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container py-16 md:py-24">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Just Dropped</p>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight">New Arrivals</h2>
            </div>
            <Link href="/shirts?tag=new-launch" className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 stagger">
            {newArrivals.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Trust Strip */}
      <section className="border-y">
        <div className="container py-8 md:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Free Shipping", sub: "Orders above ₹999" },
            { label: "30-Day Returns", sub: "No questions asked" },
            { label: "Secure Checkout", sub: "SSL encrypted" },
            { label: "Premium Quality", sub: "47 quality checks" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs md:text-sm font-medium tracking-wide">{item.label}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16 md:py-24">
        <div className="text-center mb-10">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Customer Love</p>
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">What They Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 stagger">
          {[
            { name: "Rahul S.", city: "Delhi", text: "The best quality shirts I've found online. The Oxford is now my daily office wear. Fabric feels incredible.", rating: 5 },
            { name: "Vikram M.", city: "Mumbai", text: "Finally a brand that understands Indian body types. Perfect fit, premium feel. Ordered 5 more.", rating: 5 },
            { name: "Arjun K.", city: "Bangalore", text: "The linen shirt is a game-changer for Bangalore summers. Breathable, stylish, and the color hasn't faded.", rating: 5 },
          ].map((t, i) => (
            <div key={i} className="p-5 md:p-6 border bg-card/50 rounded-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }, (_, j) => (
                  <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
              <p className="text-xs font-medium mt-4">{t.name} <span className="text-muted-foreground font-normal">— {t.city}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-foreground text-background">
        <div className="container py-14 md:py-20 text-center max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-light tracking-tight">Join the Club</h2>
          <p className="text-sm text-background/60 mt-2">Get 10% off your first order + early access to new drops.</p>
          <form className="flex mt-6 border border-background/20 overflow-hidden">
            <input type="email" placeholder="Your email" className="flex-1 px-4 py-3 bg-transparent text-sm placeholder:text-background/40 outline-none" />
            <button type="submit" className="px-5 py-3 bg-background text-foreground text-xs font-medium tracking-wide hover:bg-background/90 transition-colors">
              JOIN
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block hover-lift">
      <div className="relative aspect-[3/4] bg-secondary overflow-hidden img-zoom mb-3">
        <Image
          src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
          loading="lazy"
        />
        {product.tags?.includes("new-launch") && (
          <span className="absolute top-2.5 left-2.5 text-[9px] uppercase tracking-[0.1em] bg-foreground text-background px-2 py-0.5 font-medium">
            New
          </span>
        )}
        {/* Quick add overlay on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
          <div className="bg-background/95 backdrop-blur-sm text-center py-2.5 text-xs font-medium tracking-wide">
            Quick View
          </div>
        </div>
      </div>
      <div className="space-y-0.5">
        <h3 className="text-xs md:text-sm font-normal leading-tight line-clamp-1 group-hover:underline underline-offset-2 decoration-muted-foreground/40">{product.name}</h3>
        <p className="text-xs md:text-sm font-medium">₹{product.basePrice?.toLocaleString()}</p>
      </div>
    </Link>
  )
}
