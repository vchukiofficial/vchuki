import Link from "next/link"
import Image from "next/image"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"
import { ArrowRight, Truck, RotateCcw, Shield, CheckCircle, Gem, MapPin, ClipboardCheck, Wind } from "lucide-react"
import { HeroSection } from "@/components/home/HeroSection"
import { AnimatedSection } from "@/components/home/AnimatedSection"
import { ProductCarousel } from "@/components/home/ProductCarousel"
import { RajasthanPalette } from "@/components/home/RajasthanPalette"
import { HomePageWrapper } from "@/components/home/HomePageWrapper"

async function getProducts() {
  await connectDB()
  const bestsellers = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean()
  const newArrivals = await Product.find({ isActive: true, tags: { $in: ["new-launch"] } }).sort({ createdAt: -1 }).limit(8).lean()
  const linen = await Product.find({ isActive: true, tags: { $in: ["linen"] } }).limit(4).lean()

  // For bestsellers, expand each product into variant cards (one per unique color with stock > 0)
  const bestsellersWithVariants = []
  for (const product of bestsellers) {
    const p = product as any
    const variants = await ProductVariant.find({ product: p._id, stock: { $gt: 0 } }).lean()
    if (variants.length === 0) {
      // No variants in stock, skip
      continue
    }
    // Group by color
    const colorMap = new Map<string, any>()
    for (const v of variants) {
      const vAny = v as any
      const colorName = vAny.color?.name || "Default"
      if (!colorMap.has(colorName)) {
        colorMap.set(colorName, {
          ...p,
          _id: `${p._id}-${colorName}`,
          productId: p._id,
          variantColor: vAny.color,
          variantImage: vAny.images?.[0] || p.images?.[0],
          variantPrice: p.basePrice + (vAny.priceAdjustment || 0),
          variantSku: vAny.sku,
          variantId: vAny._id,
          variantStock: vAny.stock,
          availableSizes: [vAny.size],
        })
      } else {
        colorMap.get(colorName).availableSizes.push(vAny.size)
      }
    }
    bestsellersWithVariants.push(...colorMap.values())
  }

  // Expand linen into variant cards
  const linenWithVariants = []
  for (const product of linen) {
    const p = product as any
    const variants = await ProductVariant.find({ product: p._id, stock: { $gt: 0 } }).lean()
    if (variants.length === 0) continue
    const colorMap = new Map<string, any>()
    for (const v of variants) {
      const vAny = v as any
      const colorName = vAny.color?.name || "Default"
      if (!colorMap.has(colorName)) {
        colorMap.set(colorName, {
          ...p, _id: `${p._id}-${colorName}`, productId: p._id,
          variantColor: vAny.color, variantImage: vAny.images?.[0] || p.images?.[0],
          variantPrice: p.basePrice + (vAny.priceAdjustment || 0),
          variantSku: vAny.sku, variantId: vAny._id, availableSizes: [vAny.size],
        })
      } else {
        colorMap.get(colorName).availableSizes.push(vAny.size)
      }
    }
    linenWithVariants.push(...colorMap.values())
  }

  // Expand newArrivals into variant cards
  const newArrivalsWithVariants = []
  for (const product of newArrivals) {
    const p = product as any
    const variants = await ProductVariant.find({ product: p._id, stock: { $gt: 0 } }).lean()
    if (variants.length === 0) continue
    const colorMap = new Map<string, any>()
    for (const v of variants) {
      const vAny = v as any
      const colorName = vAny.color?.name || "Default"
      if (!colorMap.has(colorName)) {
        colorMap.set(colorName, {
          ...p, _id: `${p._id}-${colorName}`, productId: p._id,
          variantColor: vAny.color, variantImage: vAny.images?.[0] || p.images?.[0],
          variantPrice: p.basePrice + (vAny.priceAdjustment || 0),
          variantSku: vAny.sku, variantId: vAny._id, availableSizes: [vAny.size],
        })
      } else {
        colorMap.get(colorName).availableSizes.push(vAny.size)
      }
    }
    newArrivalsWithVariants.push(...colorMap.values())
  }

  return {
    bestsellers: JSON.parse(JSON.stringify(bestsellersWithVariants)),
    newArrivals: JSON.parse(JSON.stringify(newArrivalsWithVariants)),
    linen: JSON.parse(JSON.stringify(linenWithVariants)),
  }
}

export const revalidate = 0

export default async function HomePage() {
  const { bestsellers, newArrivals, linen } = await getProducts()

  return (
    <HomePageWrapper>
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
      <AnimatedSection className="container py-10 md:py-16">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-2">Explore</p>
          <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">Shop by Collection</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { name: "Linen Full Sleeve Shirts", slug: "linen", img: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/skyblue.png", desc: "Breathable luxury" },
            { name: "Linen Half Sleeve Shirts", slug: "linen-half-sleeve", img: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png", desc: "Summer ease" },
            { name: "Linen Short Kurtas Half Sleeve", slug: "kurta-half-sleeve", img: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/shortsleevgoldenduneshortkurta.png", desc: "Ethnic modern" },
            { name: "Linen Short Kurtas Full Sleeve", slug: "kurta-full-sleeve", img: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/fullsleevolivegreenshortshirts.png", desc: "Heritage craft" },
          ].map((cat) => (
            <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden border border-border bg-gradient-to-b from-card/50 to-background">
              <Image src={cat.img} alt={`${cat.name} - VCHUKI`} fill className="object-contain p-4 transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#c4956a]/30" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#c4956a]/30" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <p className="text-white text-xs md:text-sm font-medium tracking-wide leading-tight">{cat.name}</p>
                <p className="text-white/50 text-[10px] md:text-xs mt-0.5 group-hover:text-white/80 transition-colors">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <AnimatedSection className="py-10 md:py-16 bg-card/50 dark:bg-card/30 border-y border-border">
          <div className="container">
            <div className="flex items-end justify-between mb-6 md:mb-8">
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
      <section className="relative py-14 md:py-24 overflow-hidden">
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
                src="https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/linenproductwity6imagelayout.png"
                alt="VCHUKI Premium Linen Shirt Collection - Multiple Views"
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

      {/* Color Story Experience — Luxury Interactive Palette */}
      <RajasthanPalette />

      {/* Linen Collection with Quick Add */}
      {linen.length > 0 && (
        <AnimatedSection className="py-10 md:py-16 bg-card/40 dark:bg-card/20 border-y border-border">
          <div className="container">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] mb-2">Summer Essential</p>
              <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">The Linen Edit</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">Breathable. Elegant. Made for Indian summers.</p>
            </div>
          </div>
          <ProductCarousel products={linen} autoScroll />
        </AnimatedSection>
      )}

      {/* New Arrivals with Quick Add */}
      {newArrivals.length > 0 && (
        <AnimatedSection className="py-10 md:py-16">
          <div className="container">
            <div className="flex items-end justify-between mb-6 md:mb-8">
              <div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-[#c4956a] font-medium">Just Dropped</p>
                <h2 className="text-2xl md:text-4xl font-light tracking-tight mt-1 text-foreground">New Arrivals</h2>
              </div>
              <Link href="/shirts?tag=new-launch" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
          <ProductCarousel products={newArrivals} autoScroll />
        </AnimatedSection>
      )}

      {/* Why VCHUKI — Premium Trust */}
      <section className="border-y border-border">
        <AnimatedSection className="container py-10 md:py-16">
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-2">The VCHUKI Promise</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Why Men Choose Us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-center">
            {[
              { num: "47", label: "Quality Checks", sub: "Per shirt crafted" },
              { num: "100%", label: "Premium Fabric", sub: "Finest linen mills" },
              { num: "14", label: "Day Returns", sub: "No questions asked" },
              { num: "5", label: "Curated Colors", sub: "Rajasthan-inspired" },
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

      {/* Craftsmanship Focus — replaces testimonials pre-launch */}
      <section className="bg-card/50 dark:bg-card/20">
        <AnimatedSection className="container py-10 md:py-14">
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4956a] mb-2">Our Promise</p>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-foreground">Crafted With Precision</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[
              { title: "47 Quality Checks", desc: "Every shirt passes through 47 rigorous quality checkpoints before it reaches you. From fabric inspection to final stitch — zero compromise." },
              { title: "Jodhpur Heritage", desc: "Born in the heart of Rajasthan, our craft draws from generations of textile mastery. Modern design meets timeless tradition." },
              { title: "Premium Linen", desc: "Sourced from the finest mills, our linen is breathable, durable, and gets softer with every wash. Designed for Indian summers." },
            ].map((item, i) => (
              <div key={i} className="p-6 md:p-8 bg-background border border-border hover:border-[#c4956a]/30 transition-colors">
                <div className="w-8 h-8 border border-[#c4956a]/30 flex items-center justify-center mb-4">
                  <span className="text-sm font-light text-[#c4956a]">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
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
          <Image src="/marko.png" alt="VCHUKI" width={56} height={56} className="mx-auto mb-4 invert" />
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
            { icon: RotateCcw, label: "14-Day Returns", sub: "Hassle-free" },
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
    </HomePageWrapper>
  )
}
