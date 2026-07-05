import Link from "next/link"
import Image from "next/image"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"
import HeroVideo from "@/models/HeroVideo"
import { ArrowRight, Truck, RotateCcw, Shield, CheckCircle, Gem, MapPin, ClipboardCheck, Wind } from "lucide-react"
import { HeroSection } from "@/components/home/HeroSection"
import { AnimatedSection } from "@/components/home/AnimatedSection"
import { ShirtsVariantGrid } from "@/components/products/ShirtsVariantGrid"
import { RajasthanPalette } from "@/components/home/RajasthanPalette"
import { HomePageWrapper } from "@/components/home/HomePageWrapper"
import { DroppingJulyBanner } from "@/components/home/DroppingJulyBanner"
import { CategoryImageCarousel } from "@/components/home/CategoryImageCarousel"

// FIX #5: Enable ISR caching - revalidate every 60 seconds
export const revalidate = 60

// FIX #2: Batch all variant queries into single DB calls (eliminates N+1)
function expandProductsToVariantCards(products: any[], allVariants: any[]) {
  const variantsByProduct = new Map<string, any[]>()
  for (const v of allVariants) {
    const pid = (v as any).product.toString()
    if (!variantsByProduct.has(pid)) variantsByProduct.set(pid, [])
    variantsByProduct.get(pid)!.push(v)
  }

  const cards: any[] = []
  for (const product of products) {
    const p = product as any
    const variants = variantsByProduct.get(p._id.toString()) || []

    // Products with no variants — show as standalone card
    if (variants.length === 0) {
      if (p.images?.[0]) cards.push({ ...p, _id: p._id.toString(), productId: p._id })
      continue
    }

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
          variantImage: p.images?.[0] || vAny.images?.[0],
          variantImageSecondary: vAny.images?.[1] || p.images?.[1],
          variantPrice: p.basePrice + (vAny.priceAdjustment || 0),
          variantSku: vAny.sku,
          variantId: vAny._id,
          variantStock: vAny.stock,
          availableSizes: [{ size: vAny.size, stock: vAny.stock }],
        })
      } else {
        const existing = colorMap.get(colorName)
        if (!existing.availableSizes.some((s: any) => s.size === vAny.size)) {
          existing.availableSizes.push({ size: vAny.size, stock: vAny.stock })
        }
      }
    }
    cards.push(...colorMap.values())
  }
  return cards
}

async function getProducts() {
  await connectDB()

  // Fetch all product groups in parallel
  const [bestsellers, newArrivals, linen] = await Promise.all([
    Product.find({ isFeatured: true, isActive: true }).limit(8).lean(),
    Product.find({ isActive: true, tags: { $in: ["new-launch"] } }).sort({ createdAt: -1 }).limit(8).lean(),
    Product.find({ isActive: true, tags: { $in: ["linen"] } }).limit(4).lean(),
  ])

  // FIX #2: Single batch query for ALL variants across all products
  const allProductIds = [
    ...bestsellers.map((p: any) => p._id),
    ...newArrivals.map((p: any) => p._id),
    ...linen.map((p: any) => p._id),
  ]

  const allVariants = await ProductVariant.find({
    product: { $in: allProductIds },
    stock: { $gt: 0 },
  }).lean()

  // Fetch category cover images (random color per category, not always the same one)
  const categorySlugs = ["linen-full-sleeve", "linen-half-sleeve", "kurta-half-sleeve", "kurta-full-sleeve"]
  const categoryCovers = await Promise.all(
    categorySlugs.map(async (slug) => {
      const products = await Product.find({ category: slug, isActive: true, "images.0": { $exists: true } }).select("images").lean()
      if (products.length === 0) return null
      return products[Math.floor(Math.random() * products.length)]
    })
  )
  const categoryImages: Record<string, string> = {}
  categorySlugs.forEach((slug, i) => {
    categoryImages[slug] = (categoryCovers[i] as any)?.images?.[0] || "/placeholder-product.svg"
  })

  // Fetch color images for RajasthanPalette (first product matching each color name)
  const colorNames = ["Desert Sand", "Olive Green", "Golden Dune", "Ivory White"]
  const paletteNames = ["Desert Sand", "Sage Heritage", "Golden Dune", "Ivory White"]
  const colorProducts = await Promise.all(
    colorNames.map(c => Product.findOne({ isActive: true, name: { $regex: c, $options: "i" }, "images.0": { $exists: true } }).select("images").lean())
  )
  const colorImages: Record<string, string> = {}
  paletteNames.forEach((name, i) => {
    colorImages[name] = (colorProducts[i] as any)?.images?.[0] || "/placeholder-product.svg"
  })

  // Active hero video for the homepage background — falls back to the bundled default if none is active
  const heroVideo = await HeroVideo.findOne({ isActive: true }).sort({ order: 1 }).lean()

  return {
    bestsellers: JSON.parse(JSON.stringify(expandProductsToVariantCards(bestsellers, allVariants))),
    newArrivals: JSON.parse(JSON.stringify(expandProductsToVariantCards(newArrivals, allVariants))),
    linen: JSON.parse(JSON.stringify(expandProductsToVariantCards(linen, allVariants))),
    categoryImages,
    colorImages,
    heroVideoUrl: (heroVideo as any)?.url || null,
  }
}

const CATEGORIES = [
  { name: "Linen Full Sleeve Shirts", slug: "linen-full-sleeve", desc: "Breathable luxury" },
  { name: "Linen Half Sleeve Shirts", slug: "linen-half-sleeve", desc: "Summer ease" },
  { name: "Linen Short Kurtas Half Sleeve", slug: "kurta-half-sleeve", desc: "Ethnic modern" },
  { name: "Linen Short Kurtas Full Sleeve", slug: "kurta-full-sleeve", desc: "Heritage craft" },
]

export default async function HomePage() {
  const { bestsellers, newArrivals, linen, categoryImages, colorImages, heroVideoUrl } = await getProducts()
  const categorySlides = CATEGORIES.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    image: categoryImages[cat.slug] || "/placeholder-product.svg",
  })).filter((s) => s.image !== "/placeholder-product.svg")

  return (
    <HomePageWrapper>
      {/* H1 for SEO - Visible but styled as brand element */}
      <h1 className="sr-only">VCHUKI — Premium Cotton Linen Shirts & Short Kurtas for Men | Handcrafted in Jodhpur</h1>

      <HeroSection videoUrl={heroVideoUrl} />

      {/* Fabric Story Strip */}
      <section className="border-y border-[#c4956a]/20 bg-[#2a1f14] dark:bg-[#1a1209]">
        <div className="container py-5 md:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { icon: Gem, label: "Premium Linen Blend", sub: "Finest mills" },
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
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="group relative aspect-[3/4] overflow-hidden border border-border bg-gradient-to-b from-card/50 to-background">
              <Image src={categoryImages[cat.slug] || "/placeholder-product.svg"} alt={`${cat.name} - VCHUKI`} fill className="object-contain p-4 transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" />
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
            <ShirtsVariantGrid products={bestsellers} />
          </div>
        </AnimatedSection>
      )}

      {/* Dropping July */}
      <DroppingJulyBanner />

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
            <CategoryImageCarousel slides={categorySlides} />
          </div>
        </AnimatedSection>
      </section>

      {/* Color Story Experience */}
      <RajasthanPalette colorImages={colorImages} />

      {/* Linen Collection */}
      {linen.length > 0 && (
        <AnimatedSection className="py-10 md:py-16 bg-card/40 dark:bg-card/20 border-y border-border">
          <div className="container">
            <div className="text-center mb-6 md:mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] mb-2">Summer Essential</p>
              <h2 className="text-2xl md:text-4xl font-light tracking-tight text-foreground">The Linen Edit</h2>
              <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">Breathable. Elegant. Made for Indian summers.</p>
            </div>
            <ShirtsVariantGrid products={linen} />
          </div>
        </AnimatedSection>
      )}

      {/* New Arrivals */}
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
            <ShirtsVariantGrid products={newArrivals} />
          </div>
        </AnimatedSection>
      )}

      {/* Why VCHUKI */}
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

      {/* Craftsmanship */}
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
              { title: "Premium Linen Blend", desc: "Sourced from the finest mills, our linen is breathable, durable, and gets softer with every wash. Designed for Indian summers." },
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
        <div className="container relative z-10 py-12 md:py-24 text-center max-w-lg mx-auto px-6">
          <Image src="/marko.png" alt="VCHUKI" width={48} height={48} className="mx-auto mb-4 invert" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] mb-3">Exclusive Access</p>
          <h2 className="text-lg md:text-3xl font-light tracking-tight text-[#f5e6d3]">Join the VCHUKI Club</h2>
          <p className="text-xs md:text-sm text-[#f5e6d3]/50 mt-3">Get 10% off your first order. Early access to drops.</p>
          <form className="flex mt-6 md:mt-8 border border-[#c4956a]/30 overflow-hidden max-w-sm mx-auto">
            <input type="email" placeholder="Your email" className="flex-1 min-w-0 px-3 md:px-4 py-3 bg-transparent text-sm text-[#f5e6d3] placeholder:text-[#f5e6d3]/30 outline-none" />
            <button type="submit" className="px-4 md:px-6 py-3 bg-[#c4956a] text-[#2a1f14] text-[10px] md:text-xs font-bold tracking-wider hover:bg-[#d4a574] transition-colors whitespace-nowrap">
              JOIN
            </button>
          </form>
          <p className="text-[9px] text-[#f5e6d3]/30 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="border-t border-border">
        <div className="container py-6 md:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { icon: Truck, label: "Free Shipping", sub: "Orders above ₹1,599" },
            { icon: RotateCcw, label: "7-Day Returns", sub: "Hassle-free" },
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
