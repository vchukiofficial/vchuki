import { Metadata } from "next"
import { Suspense } from "react"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"
import Link from "next/link"
import ProductFilters from "@/components/products/ProductFilters"
import { ShirtsVariantGrid } from "@/components/products/ShirtsVariantGrid"

export const metadata: Metadata = {
  title: "Shop Premium Shirts for Men — Formal, Casual, Linen | VCHUKI",
  description: "Browse VCHUKI's collection of premium shirts for men. Formal, casual, linen, cotton & premium shirts. Free shipping above ₹1,599.",
  keywords: ["buy shirts online", "premium shirts india", "formal shirts men", "casual shirts", "linen shirts online", "vchuki shirts"],
  alternates: { canonical: "https://vchuki.com/shirts" },
}

export const revalidate = 60

const categories = [
  { slug: "linen-full-sleeve", name: "Linen Full Sleeve" },
  { slug: "linen-half-sleeve", name: "Linen Half Sleeve" },
  { slug: "kurta-full-sleeve", name: "Short Kurta Full Sleeve" },
  { slug: "kurta-half-sleeve", name: "Short Kurta Half Sleeve" },
]

interface Props {
  searchParams: { search?: string; page?: string; sort?: string; price?: string; tag?: string; size?: string; category?: string }
}

// Shuffle array deterministically per-day so it changes daily but stays consistent within a session
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  const seed = new Date().toDateString().split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 7919) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default async function ShirtsPage({ searchParams }: Props) {
  await connectDB()

  const query: Record<string, any> = { isActive: true }
  if (searchParams.search) query.name = { $regex: searchParams.search, $options: "i" }

  // Category filter
  if (searchParams.category) {
    query.category = searchParams.category
  }

  // Tag filter — use $in so it matches products that have the tag
  if (searchParams.tag) {
    query.tags = { $in: [searchParams.tag] }
  }

  // Price filter
  if (searchParams.price) {
    const [min, max] = searchParams.price.split("-").map(Number)
    query.basePrice = { $gte: min, $lte: max }
  }

  let sort: Record<string, any> = { createdAt: -1 }
  switch (searchParams.sort) {
    case "price-asc": sort = { basePrice: 1 }; break
    case "price-desc": sort = { basePrice: -1 }; break
    case "bestseller": sort = { rating: -1 }; break
    case "rating": sort = { rating: -1 }; break
  }

  const page = Number(searchParams.page) || 1
  const limit = 24

  let [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(query),
  ])

  // Fallback: if tag filter returns 0 results, show all products in that category without tag filter
  if (products.length === 0 && searchParams.tag) {
    const fallbackQuery: Record<string, any> = { isActive: true }
    if (searchParams.category) fallbackQuery.category = searchParams.category
    if (searchParams.search) fallbackQuery.name = { $regex: searchParams.search, $options: "i" }
    if (searchParams.price) {
      const [min, max] = searchParams.price.split("-").map(Number)
      fallbackQuery.basePrice = { $gte: min, $lte: max }
    }
    ;[products, total] = await Promise.all([
      Product.find(fallbackQuery).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(fallbackQuery),
    ])
  }

  // BATCH fetch all variants for these products in ONE query (fixes N+1)
  const productIds = products.map((p: any) => p._id)
  const allVariants = await ProductVariant.find({ product: { $in: productIds }, stock: { $gt: 0 } }).lean()

  // Group variants by product ID
  const variantsByProduct = new Map<string, any[]>()
  for (const v of allVariants) {
    const pid = (v as any).product.toString()
    if (!variantsByProduct.has(pid)) variantsByProduct.set(pid, [])
    variantsByProduct.get(pid)!.push(v)
  }

  // Expand products into variant cards
  const variantCards: any[] = []
  for (const product of products) {
    const p = product as any
    const variants = variantsByProduct.get(p._id.toString()) || []

    if (variants.length === 0) {
      variantCards.push({ ...p, _id: p._id.toString() })
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
          productId: p._id.toString(),
          comparePrice: p.comparePrice || 0,
          variantColor: vAny.color,
          variantImage: vAny.images?.[0] || p.images?.[0],
          variantPrice: p.basePrice + (vAny.priceAdjustment || 0),
          variantSku: vAny.sku,
          variantId: vAny._id?.toString(),
          variantStock: vAny.stock,
          availableSizes: [vAny.size],
        })
      } else {
        const existing = colorMap.get(colorName)
        if (!existing.availableSizes.includes(vAny.size)) {
          existing.availableSizes.push(vAny.size)
        }
      }
    }

    // Filter by size if specified
    if (searchParams.size) {
      for (const [, card] of colorMap) {
        if (card.availableSizes.includes(searchParams.size)) {
          variantCards.push({ ...card, availableSizes: [searchParams.size] })
        }
      }
    } else {
      variantCards.push(...colorMap.values())
    }
  }

  // Shuffle variants for fresh display
  const shuffledCards = shuffleArray(variantCards)
  const serialized = JSON.parse(JSON.stringify(shuffledCards))
  const totalPages = Math.ceil(total / limit)

  // ItemList schema for Google rich results (product carousel)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Premium Shirts for Men - VCHUKI",
    description: "Browse VCHUKI's collection of premium linen shirts for men.",
    url: "https://vchuki.com/shirts",
    numberOfItems: serialized.length,
    itemListElement: serialized.slice(0, 20).map((p: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name + (p.variantColor?.name ? ` - ${p.variantColor.name}` : ""),
        url: `https://vchuki.com/product/${p.slug}`,
        image: p.variantImage || p.images?.[0] || "",
        brand: { "@type": "Brand", name: "VCHUKI" },
        offers: {
          "@type": "Offer",
          price: p.variantPrice || p.basePrice,
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
    <div className="container py-4 md:py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="mx-1.5 text-border">/</span>
        <span className="text-foreground">Shirts</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-3xl font-light tracking-tight text-foreground">Premium Shirts for Men</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{serialized.length} variants · Free shipping above ₹1,599</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        <Link
          href="/shirts"
          className={`px-4 py-2 text-[10px] uppercase tracking-wider font-medium border whitespace-nowrap transition-colors ${
            !searchParams.category ? "border-[#c4956a] bg-[#c4956a]/10 text-[#c4956a]" : "border-border text-muted-foreground hover:border-[#c4956a]/40 hover:text-foreground"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => {
          const params = new URLSearchParams()
          if (searchParams.sort) params.set("sort", searchParams.sort)
          if (searchParams.price) params.set("price", searchParams.price)
          if (searchParams.tag) params.set("tag", searchParams.tag)
          if (searchParams.size) params.set("size", searchParams.size)
          params.set("category", cat.slug)
          const isActive = searchParams.category === cat.slug

          return (
            <Link
              key={cat.slug}
              href={`/shirts?${params.toString()}`}
              className={`px-4 py-2 text-[10px] uppercase tracking-wider font-medium border whitespace-nowrap transition-colors ${
                isActive ? "border-[#c4956a] bg-[#c4956a]/10 text-[#c4956a]" : "border-border text-muted-foreground hover:border-[#c4956a]/40 hover:text-foreground"
              }`}
            >
              {cat.name}
            </Link>
          )
        })}
      </div>

      {/* Filters + Products Grid */}
      <div className="flex gap-0">
        <Suspense fallback={null}>
          <ProductFilters />
        </Suspense>

        <div className="flex-1 md:pl-6">
          {/* Products Grid */}
          <ShirtsVariantGrid products={serialized} />

          {serialized.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products match your filters.</p>
              <Link href="/shirts" className="text-sm text-[#c4956a] mt-2 inline-block hover:underline">Clear filters →</Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-8">
              {page > 1 && (
                <Link href={`/shirts?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`} className="h-8 px-3 flex items-center justify-center text-xs border border-border text-muted-foreground hover:border-[#c4956a]/30 transition-colors">
                  ← Prev
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i
                return (
                  <Link key={p} href={`/shirts?${new URLSearchParams({ ...searchParams, page: String(p) })}`} className={`h-8 w-8 flex items-center justify-center text-xs ${page === p ? "bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14]" : "border border-border text-muted-foreground"}`}>
                    {p}
                  </Link>
                )
              })}
              {page < totalPages && (
                <Link href={`/shirts?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`} className="h-8 px-3 flex items-center justify-center text-xs border border-border text-muted-foreground hover:border-[#c4956a]/30 transition-colors">
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}
