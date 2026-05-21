import Link from "next/link"
import Image from "next/image"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import { Star, ArrowRight } from "lucide-react"
import { HeroSection } from "@/components/home/HeroSection"
import { AnimatedSection } from "@/components/home/AnimatedSection"
import { ProductCarousel } from "@/components/home/ProductCarousel"

async function getProducts() {
  await connectDB()
  const bestsellers = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean()
  const newArrivals = await Product.find({ isActive: true, tags: { $in: ["new-launch"] } }).sort({ createdAt: -1 }).limit(8).lean()
  const linen = await Product.find({ isActive: true, tags: { $in: ["linen"] } }).limit(4).lean()
  return {
    bestsellers: JSON.parse(JSON.stringify(bestsellers)),
    newArrivals: JSON.parse(JSON.stringify(newArrivals)),
    linen: JSON.parse(JSON.stringify(linen)),
  }
}

export default async function HomePage() {
  const { bestsellers, newArrivals, linen } = await getProducts()

  return (
    <>
      {/* Cinematic Hero */}
      <HeroSection />

      {/* Collection Spotlight */}
      <AnimatedSection className="container py-20 md:py-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { name: "Linen", slug: "linen", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80", desc: "Breathable luxury" },
            { name: "Formal", slug: "formal", img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&q=80", desc: "Office elegance" },
            { name: "Casual", slug: "casual", img: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500&q=80", desc: "Weekend ease" },
            { name: "Premium", slug: "premium", img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80", desc: "Exclusive craft" },
          ].map((cat) => (
            <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="group relative aspect-[3/4] md:aspect-[2/3] overflow-hidden">
              <Image src={cat.img} alt={`${cat.name} Shirts - VCHUKI`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <p className="text-white text-xs md:text-sm font-medium tracking-wide">{cat.name}</p>
                <p className="text-white/50 text-[10px] md:text-xs mt-0.5 group-hover:text-white/80 transition-colors">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* Bestsellers */}
      <AnimatedSection className="py-16 md:py-28">
        <div className="container">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">Most Loved</p>
              <h2 className="text-2xl md:text-4xl font-light tracking-tight mt-1">Bestsellers</h2>
            </div>
            <Link href="/shirts?tag=bestseller" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
        <ProductCarousel products={bestsellers} />
      </AnimatedSection>

      {/* Brand Story — Editorial */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[#f8f5f0] dark:bg-[#0d0d0d]" />
        <AnimatedSection className="container relative">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">The VCHUKI Story</p>
              <h2 className="text-3xl md:text-5xl font-light leading-[1.15] tracking-tight">
                Born in Jodhpur.<br />
                <span className="font-medium">Crafted for the world.</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                Every VCHUKI shirt carries the heritage of Rajasthan&apos;s finest textile traditions — reimagined for the modern man who values quality, comfort, and understated luxury.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Our linen is sourced from the finest mills. Each piece passes 47 quality checks. No shortcuts. No compromises.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium border-b border-foreground/30 pb-0.5 hover:border-foreground transition-colors">
                Our Heritage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=85"
                alt="VCHUKI Craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Linen Collection Spotlight */}
      {linen.length > 0 && (
        <AnimatedSection className="container py-20 md:py-32">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">Summer Essential</p>
            <h2 className="text-2xl md:text-4xl font-light tracking-tight">The Linen Edit</h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">Breathable. Elegant. Made for Indian summers.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {linen.map((product: any) => (
              <Link key={product._id} href={`/product/${product.slug}`} className="group">
                <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
                  <Image src={product.images?.[0] || "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400"} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
                </div>
                <h3 className="text-xs md:text-sm font-normal line-clamp-1">{product.name}</h3>
                <p className="text-xs md:text-sm font-medium mt-0.5">₹{product.basePrice?.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </AnimatedSection>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <AnimatedSection className="py-16 md:py-28 bg-secondary/30">
          <div className="container">
            <div className="flex items-end justify-between mb-8 md:mb-12">
              <div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-medium">Just Dropped</p>
                <h2 className="text-2xl md:text-4xl font-light tracking-tight mt-1">New Arrivals</h2>
              </div>
              <Link href="/shirts?tag=new-launch" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {newArrivals.slice(0, 8).map((product: any) => (
                <Link key={product._id} href={`/product/${product.slug}`} className="group">
                  <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
                    <Image src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
                    <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-foreground text-background px-2 py-0.5 font-medium">New</span>
                  </div>
                  <h3 className="text-xs md:text-sm font-normal line-clamp-1 group-hover:underline underline-offset-2">{product.name}</h3>
                  <p className="text-xs md:text-sm font-medium mt-0.5">₹{product.basePrice?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Why VCHUKI */}
      <AnimatedSection className="container py-20 md:py-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-light tracking-tight">Why VCHUKI</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {[
            { num: "47", label: "Quality Checks", sub: "Per shirt" },
            { num: "100%", label: "Premium Fabric", sub: "Sourced from finest mills" },
            { num: "30", label: "Day Returns", sub: "No questions asked" },
            { num: "50K+", label: "Happy Customers", sub: "And counting" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-3xl md:text-4xl font-light tracking-tight">{item.num}</p>
              <p className="text-xs font-medium mt-2 tracking-wide">{item.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <section className="border-y bg-[#faf8f5] dark:bg-card/30">
        <AnimatedSection className="container py-16 md:py-24">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Customer Love</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight">What They Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: "Rahul S.", city: "Delhi", text: "The Oxford shirt is now my daily office wear. Fabric feels incredible — better than brands 3x the price." },
              { name: "Vikram M.", city: "Mumbai", text: "Finally a brand that understands Indian body types. Perfect fit, premium feel. Ordered 5 more." },
              { name: "Arjun K.", city: "Bangalore", text: "The linen shirt is a game-changer for summers. Breathable, stylish, and the color hasn't faded after 20 washes." },
            ].map((t, i) => (
              <div key={i} className="p-6 md:p-8 bg-background border rounded-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }, (_, j) => <Star key={j} className="h-3 w-3 fill-foreground/80 text-foreground/80" />)}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                <p className="text-xs font-medium mt-5">{t.name} <span className="text-muted-foreground font-normal">— {t.city}</span></p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Newsletter */}
      <section className="bg-foreground text-background">
        <div className="container py-16 md:py-24 text-center max-w-lg mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-background/50 mb-3">Exclusive Access</p>
          <h2 className="text-xl md:text-3xl font-light tracking-tight">Join the VCHUKI Club</h2>
          <p className="text-sm text-background/50 mt-3">Get 10% off your first order. Early access to drops. Style tips from our team.</p>
          <form className="flex mt-8 border border-background/20 overflow-hidden max-w-sm mx-auto">
            <input type="email" placeholder="Your email" className="flex-1 px-4 py-3.5 bg-transparent text-sm placeholder:text-background/30 outline-none" />
            <button type="submit" className="px-6 py-3.5 bg-background text-foreground text-xs font-medium tracking-wider hover:bg-background/90 transition-colors">
              JOIN
            </button>
          </form>
          <p className="text-[10px] text-background/30 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-t">
        <div className="container py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Free Shipping", sub: "Orders above ₹999" },
            { label: "30-Day Returns", sub: "Hassle-free" },
            { label: "Secure Checkout", sub: "256-bit SSL" },
            { label: "Premium Quality", sub: "47 quality checks" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] md:text-xs font-medium tracking-wide">{item.label}</p>
              <p className="text-[9px] md:text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
