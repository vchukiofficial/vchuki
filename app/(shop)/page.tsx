import Link from "next/link"
import Image from "next/image"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import { Star, ArrowRight, Sparkles, Truck, RotateCcw, Shield, CheckCircle, Gem, MapPin, ClipboardCheck, Wind } from "lucide-react"
import { HeroSection } from "@/components/home/HeroSection"
import { AnimatedSection } from "@/components/home/AnimatedSection"
import { ProductCarousel } from "@/components/home/ProductCarousel"
import { ProductGrid } from "@/components/home/ProductGrid"

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
      <HeroSection />

      {/* Fabric Story Strip */}
      <section className="border-y border-[#c4956a]/20 bg-[#2a1f14] dark:bg-[#1a1209]">
        <div className="container py-5 md:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Gem, label: "100% Premium Linen", sub: "Finest mills" },
              { icon: MapPin, label: "Crafted in Jodhpur", sub: "Rajasthan heritage" },
              { icon: ClipboardCheck, label: "47 Quality Checks", sub: "Zero compromise" },
              { icon: Wind, label: "Breathable Comfort", sub: "All-day ease" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <item.icon className="h-4 w-4 text-[#c4956a]" />
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] text-[#f5e6d3] font-medium">{item.label}</p>
                <p className="text-[9px] text-[#f5e6d3]/50">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Spotlight */}
      <AnimatedSection className="container py-20 md:py-28">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-2">Explore</p>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">Shop by Collection</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { name: "Linen", slug: "linen", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&q=80", desc: "Breathable luxury" },
            { name: "Formal", slug: "formal", img: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=500&q=80", desc: "Office elegance" },
            { name: "Casual", slug: "casual", img: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=500&q=80", desc: "Weekend ease" },
            { name: "Premium", slug: "premium", img: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=500&q=80", desc: "Exclusive craft" },
          ].map((cat) => (
            <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden border border-border">
              <Image src={cat.img} alt={`${cat.name} Shirts - VCHUKI`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/30" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/30" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <p className="text-white text-sm md:text-base font-medium tracking-wide">{cat.name}</p>
                <p className="text-white/50 text-[10px] md:text-xs mt-0.5 group-hover:text-white/80 transition-colors">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <AnimatedSection className="py-16 md:py-28 bg-card/50 dark:bg-card/30 border-y border-border">
          <div className="container">
            <div className="flex items-end justify-between mb-8 md:mb-12">
              <div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-[#c4956a] font-medium">Most Loved</p>
                <h2 className="text-2xl md:text-4xl font-light tracking-tight mt-1 text-foreground">Bestsellers</h2>
              </div>
              <Link href="/shirts?tag=bestseller" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
          <ProductCarousel products={bestsellers} />
        </AnimatedSection>
      )}

      {/* Brand Story — Heritage Editorial */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-[#2a1f14] dark:bg-[#0f0a06]" />
        <div className="absolute inset-0 heritage-pattern opacity-30" />
        <AnimatedSection className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a]">The VCHUKI Story</p>
              <h2 className="text-3xl md:text-5xl font-light leading-[1.15] tracking-tight text-[#f5e6d3]">
                Born in Jodhpur.<br />
                <span className="font-semibold text-[#c4956a]">Crafted for the world.</span>
              </h2>
              <p className="text-sm md:text-base text-[#f5e6d3]/60 leading-relaxed max-w-md">
                Every VCHUKI shirt carries the heritage of Rajasthan&apos;s finest textile traditions — reimagined for the modern man who values quality, comfort, and understated luxury.
              </p>
              <p className="text-sm text-[#f5e6d3]/40 leading-relaxed max-w-md">
                Our linen is sourced from the finest mills. Each piece passes 47 quality checks. No shortcuts. No compromises.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-[#c4956a] border-b border-[#c4956a]/30 pb-0.5 hover:border-[#c4956a] transition-colors">
                Our Heritage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden">
              <div className="absolute -inset-2 border border-[#c4956a]/20" />
              <Image
                src="https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=85"
                alt="VCHUKI Craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#c4956a]/50" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#c4956a]/50" />
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Color Story Experience */}
      <AnimatedSection className="container py-20 md:py-32">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-2">Every Color Has a Story</p>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">The Color Palette</h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">Each shade is inspired by the landscapes of Rajasthan — from desert sands to royal indigo nights.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: "Desert Sand", color: "#d4a574", mood: "Warm sandstone palace" },
            { name: "Royal Indigo", color: "#3d5a80", mood: "Moonlit blue haveli" },
            { name: "Sage", color: "#6b7c5e", mood: "Botanical calm" },
            { name: "Rust Earth", color: "#8b4513", mood: "Artisan copper" },
            { name: "Ivory Cream", color: "#f5e6d3", mood: "Pure elegance" },
          ].map((item) => (
            <Link key={item.name} href={`/shirts?color=${item.name.toLowerCase().replace(" ", "-")}`} className="group text-center">
              <div className="aspect-square overflow-hidden mb-3 relative border border-border group-hover:border-[#c4956a]/40 transition-colors">
                <div className="absolute inset-0" style={{ backgroundColor: item.color }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center bg-black/20">
                  <Sparkles className="h-5 w-5 text-white/80" />
                </div>
              </div>
              <p className="text-xs font-medium tracking-wide text-foreground">{item.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.mood}</p>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* Linen Collection with Quick Add */}
      {linen.length > 0 && (
        <AnimatedSection className="py-20 md:py-28 bg-card/40 dark:bg-card/20 border-y border-border">
          <div className="container">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] mb-2">Summer Essential</p>
              <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">The Linen Edit</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">Breathable. Elegant. Made for Indian summers.</p>
            </div>
            <ProductGrid products={linen} />
          </div>
        </AnimatedSection>
      )}

      {/* New Arrivals with Quick Add */}
      {newArrivals.length > 0 && (
        <AnimatedSection className="py-16 md:py-28">
          <div className="container">
            <div className="flex items-end justify-between mb-8 md:mb-12">
              <div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-[#c4956a] font-medium">Just Dropped</p>
                <h2 className="text-2xl md:text-4xl font-light tracking-tight mt-1 text-foreground">New Arrivals</h2>
              </div>
              <Link href="/shirts?tag=new-launch" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <ProductGrid products={newArrivals.slice(0, 8)} />
          </div>
        </AnimatedSection>
      )}

      {/* Why VCHUKI — Premium Trust */}
      <section className="border-y border-border">
        <AnimatedSection className="container py-20 md:py-28">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-2">The VCHUKI Promise</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Why Men Choose Us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-center">
            {[
              { num: "47", label: "Quality Checks", sub: "Per shirt crafted" },
              { num: "100%", label: "Premium Fabric", sub: "Finest linen mills" },
              { num: "30", label: "Day Returns", sub: "No questions asked" },
              { num: "50K+", label: "Happy Customers", sub: "And counting" },
            ].map((item) => (
              <div key={item.label} className="group">
                <p className="text-3xl md:text-4xl font-light tracking-tight text-[#c4956a] group-hover:scale-105 transition-transform">{item.num}</p>
                <p className="text-[11px] font-semibold mt-2 tracking-wide uppercase text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Testimonials */}
      <section className="bg-card/50 dark:bg-card/20">
        <AnimatedSection className="container py-16 md:py-24">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4956a] mb-2">Customer Love</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">What They Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { name: "Rahul S.", city: "Delhi", text: "The linen shirt is now my daily wear. Fabric feels incredible — better than brands 3x the price. True Rajasthani craftsmanship." },
              { name: "Vikram M.", city: "Mumbai", text: "Finally a brand that understands Indian body types. Perfect fit, premium feel. The Desert Sand color is absolutely stunning." },
              { name: "Arjun K.", city: "Bangalore", text: "Breathable, stylish, and the color hasn't faded after 20 washes. VCHUKI has replaced all my other shirt brands." },
            ].map((t, i) => (
              <div key={i} className="p-6 md:p-8 bg-background border border-border hover:border-[#c4956a]/30 transition-colors">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }, (_, j) => <Star key={j} className="h-3.5 w-3.5 fill-[#c4956a] text-[#c4956a]" />)}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#c4956a]/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#c4956a]">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Newsletter */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#2a1f14] dark:bg-[#0f0a06]" />
        <div className="absolute inset-0 heritage-pattern opacity-20" />
        <div className="container relative z-10 py-16 md:py-24 text-center max-w-lg mx-auto">
          <div className="w-10 h-10 mx-auto mb-4 border border-[#c4956a]/40 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#c4956a]" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] mb-3">Exclusive Access</p>
          <h2 className="text-xl md:text-3xl font-light tracking-tight text-[#f5e6d3]">Join the VCHUKI Club</h2>
          <p className="text-sm text-[#f5e6d3]/50 mt-3">Get 10% off your first order. Early access to drops. Style tips from our team.</p>
          <form className="flex mt-8 border border-[#c4956a]/30 overflow-hidden max-w-sm mx-auto">
            <input type="email" placeholder="Your email" className="flex-1 px-4 py-3.5 bg-transparent text-sm text-[#f5e6d3] placeholder:text-[#f5e6d3]/30 outline-none" />
            <button type="submit" className="px-6 py-3.5 bg-[#c4956a] text-[#2a1f14] text-xs font-bold tracking-wider hover:bg-[#d4a574] transition-colors">
              JOIN
            </button>
          </form>
          <p className="text-[10px] text-[#f5e6d3]/30 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-t border-border">
        <div className="container py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Truck, label: "Free Shipping", sub: "Orders above ₹999" },
            { icon: RotateCcw, label: "30-Day Returns", sub: "Hassle-free" },
            { icon: Shield, label: "Secure Checkout", sub: "256-bit SSL" },
            { icon: CheckCircle, label: "Premium Quality", sub: "47 quality checks" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <item.icon className="h-4 w-4 text-[#c4956a]" />
              <p className="text-[11px] md:text-xs font-medium tracking-wide text-foreground">{item.label}</p>
              <p className="text-[9px] md:text-[10px] text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
