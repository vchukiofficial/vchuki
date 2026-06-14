import { Metadata } from "next"
import { notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"
import Link from "next/link"
import { Suspense } from "react"
import ProductFilters from "@/components/products/ProductFilters"
import { ShirtsVariantGrid } from "@/components/products/ShirtsVariantGrid"

const categoryMeta: Record<string, { title: string; description: string; h1: string; content: string }> = {
  "linen-full-sleeve": {
    title: "Linen Full Sleeve Shirts for Men — Premium Breathable Shirts | VCHUKI",
    description: "Shop premium linen full sleeve shirts for men at VCHUKI. Breathable, lightweight & crafted in Jodhpur. Free shipping above ₹999.",
    h1: "Linen Full Sleeve Shirts",
    content: "Stay cool and stylish with VCHUKI's premium linen full sleeve shirts. Made from 100% natural linen, breathable and perfect for Indian summers. Crafted in Jodhpur with Rajasthan's finest textile heritage.",
  },
  "linen-half-sleeve": {
    title: "Linen Half Sleeve Shirts for Men — Summer Essentials | VCHUKI",
    description: "Buy premium linen half sleeve shirts for men online at VCHUKI. Perfect for summer. Lightweight & breathable. Free shipping.",
    h1: "Linen Half Sleeve Shirts",
    content: "Embrace summer with VCHUKI's linen half sleeve shirts. Lightweight, breathable, and designed for the modern man who values comfort without compromising on style.",
  },
  "kurta-full-sleeve": {
    title: "Linen Short Kurtas Full Sleeve — Modern Ethnic Wear | VCHUKI",
    description: "Shop premium linen short kurtas with full sleeves at VCHUKI. Modern ethnic wear crafted in Jodhpur. Free shipping above ₹999.",
    h1: "Linen Short Kurtas — Full Sleeve",
    content: "Discover VCHUKI's modern linen short kurtas with full sleeves. A perfect fusion of Rajasthani heritage and contemporary fashion. Ideal for festivals, office, and everyday ethnic style.",
  },
  "kurta-half-sleeve": {
    title: "Linen Short Kurtas Half Sleeve — Casual Ethnic | VCHUKI",
    description: "Buy premium linen short kurtas with half sleeves at VCHUKI. Casual ethnic wear for modern men. Free shipping above ₹999.",
    h1: "Linen Short Kurtas — Half Sleeve",
    content: "VCHUKI's half sleeve linen short kurtas bring effortless ethnic style to your wardrobe. Breathable, comfortable, and crafted with premium linen for all-day ease.",
  },
  linen: {
    title: "Linen Shirts for Men — Breathable Summer Shirts Online | VCHUKI",
    description: "Buy premium linen shirts for men online at VCHUKI. Breathable, lightweight & perfect for Indian summers. Free shipping.",
    h1: "Linen Shirts for Men",
    content: "Stay cool and stylish with VCHUKI's premium linen shirts. Made from 100% natural linen, breathable and perfect for Indian summers.",
  },
}

const allCategories = [
  { slug: "linen-full-sleeve", name: "Linen Full Sleeve" },
  { slug: "linen-half-sleeve", name: "Linen Half Sleeve" },
  { slug: "kurta-full-sleeve", name: "Short Kurta Full Sleeve" },
  { slug: "kurta-half-sleeve", name: "Short Kurta Half Sleeve" },
]

interface Props {
  params: { category: string }
  searchParams: { sort?: string; price?: string; tag?: string; size?: string }
}

export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = categoryMeta[params.category]
  if (!meta) return { title: "Not Found" }
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://vchuki.com/shirts/${params.category}` },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const meta = categoryMeta[params.category]
  if (!meta) notFound()

  await connectDB()

  // Handle aggregate categories
  const query: Record<string, any> = { isActive: true }
  if (params.category === "linen") {
    query.category = { $in: ["linen-full-sleeve", "linen-half-sleeve"] }
  } else {
    query.category = params.category
  }

  if (searchParams.tag) {
    query.tags = { $in: [searchParams.tag] }
  }
  if (searchParams.price) {
    const [min, max] = searchParams.price.split("-").map(Number)
    query.basePrice = { $gte: min, $lte: max }
  }

  let sort: Record<string, any> = { createdAt: -1 }
  switch (searchParams.sort) {
    case "price-asc": sort = { basePrice: 1 }; break
    case "price-desc": sort = { basePrice: -1 }; break
    case "rating": sort = { rating: -1 }; break
  }

  let products = await Product.find(query).sort(sort).lean()

  // Fallback: if tag filter returns 0, show all products in category
  if (products.length === 0 && searchParams.tag) {
    const fallbackQuery: Record<string, any> = { isActive: true }
    if (params.category === "linen") {
      fallbackQuery.category = { $in: ["linen-full-sleeve", "linen-half-sleeve"] }
    } else {
      fallbackQuery.category = params.category
    }
    if (searchParams.price) {
      const [min, max] = searchParams.price.split("-").map(Number)
      fallbackQuery.basePrice = { $gte: min, $lte: max }
    }
    products = await Product.find(fallbackQuery).sort(sort).lean()
  }

  // Expand into variant cards
  const variantCards: any[] = []
  for (const product of products) {
    const p = product as any
    const variants = await ProductVariant.find({ product: p._id, stock: { $gt: 0 } }).lean()

    if (variants.length === 0) {
      variantCards.push({ ...p, _id: p._id.toString() })
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

    if (searchParams.size) {
      for (const [, card] of colorMap) {
        if (card.availableSizes.includes(searchParams.size)) {
          variantCards.push(card)
        }
      }
    } else {
      variantCards.push(...colorMap.values())
    }
  }

  // Shuffle variant cards for fresh display
  const seed = new Date().toDateString().split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let i = variantCards.length - 1; i > 0; i--) {
    const j = (seed * (i + 1) * 7919) % (i + 1)
    ;[variantCards[i], variantCards[j]] = [variantCards[j], variantCards[i]]
  }

  const serialized = JSON.parse(JSON.stringify(variantCards))

  return (
    <div className="container py-4 md:py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="mx-1.5 text-border">/</span>
        <Link href="/shirts" className="hover:text-foreground transition-colors">Shirts</Link>
        <span className="mx-1.5 text-border">/</span>
        <span className="text-foreground">{meta.h1}</span>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl md:text-3xl font-light tracking-tight text-foreground">{meta.h1}</h1>
        <p className="text-xs text-muted-foreground mt-1">{serialized.length} variants available · Free shipping above ₹999</p>
      </div>

      {/* Category pills — stay on filtered pages */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        <Link
          href="/shirts"
          className="px-4 py-2 text-[10px] uppercase tracking-wider font-medium border border-border text-muted-foreground hover:border-[#c4956a]/40 hover:text-foreground whitespace-nowrap transition-colors"
        >
          All
        </Link>
        {allCategories.map((cat) => {
          const isActive = cat.slug === params.category
          // Preserve filters when switching categories
          const filterParams = new URLSearchParams()
          if (searchParams.sort) filterParams.set("sort", searchParams.sort)
          if (searchParams.price) filterParams.set("price", searchParams.price)
          if (searchParams.size) filterParams.set("size", searchParams.size)
          const href = `/shirts/${cat.slug}${filterParams.toString() ? `?${filterParams.toString()}` : ""}`

          return (
            <Link
              key={cat.slug}
              href={href}
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
            <div className="text-center py-16 border border-border">
              <p className="text-muted-foreground text-sm">No products match your filters.</p>
              <Link href={`/shirts/${params.category}`} className="text-xs text-[#c4956a] mt-2 inline-block hover:underline">Clear filters →</Link>
            </div>
          )}
        </div>
      </div>

      {/* SEO */}
      <section className="mt-12 text-sm text-muted-foreground max-w-2xl">
        <h2 className="text-base font-medium text-foreground mb-2">{meta.h1} at VCHUKI</h2>
        <p>{meta.content}</p>
      </section>
    </div>
  )
}
