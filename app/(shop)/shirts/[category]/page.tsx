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
    title: "Full Sleeve Cotton Linen Shirts for Men | Premium Breathable Shirts | VCHUKI",
    description: "Shop premium full sleeve cotton-linen shirts for men at VCHUKI. Breathable, lightweight & handcrafted in Jodhpur. Free shipping above ₹1,599. 7-day returns.",
    h1: "Full Sleeve Cotton Linen Shirts",
    content: "Stay cool and stylish with VCHUKI's premium full sleeve cotton-linen shirts. Made from LEE fabric — a premium cotton-linen blend that's breathable, soft, and perfect for Indian summers. Handcrafted in Jodhpur with Rajasthan's finest textile heritage. Available in 5 signature colors inspired by the desert landscape.",
  },
  "linen-half-sleeve": {
    title: "Half Sleeve Cotton Linen Shirts for Men | Summer Essentials | VCHUKI",
    description: "Buy premium half sleeve cotton-linen shirts for men online at VCHUKI. Perfect for Indian summers. Lightweight, breathable & handcrafted in Jodhpur. Free shipping.",
    h1: "Half Sleeve Cotton Linen Shirts",
    content: "Embrace summer with VCHUKI's half sleeve cotton-linen shirts. Lightweight, breathable LEE fabric designed for the modern Indian man who values comfort without compromising on style. Handcrafted in Jodhpur with 47 quality checks.",
  },
  "kurta-full-sleeve": {
    title: "Premium Short Kurta Full Sleeve for Men | Cotton Linen Ethnic Wear | VCHUKI",
    description: "Shop premium cotton-linen short kurtas with full sleeves at VCHUKI. Modern ethnic wear handcrafted in Jodhpur. Not a long kurta — a modern short kurta for everyday style. Free shipping.",
    h1: "Short Kurta Full Sleeve — Premium Cotton Linen",
    content: "Discover VCHUKI's modern short kurtas with full sleeves. A perfect fusion of Rajasthani heritage and contemporary fashion. Made from premium LEE cotton-linen fabric. Ideal for festivals, office ethnic days, and everyday style. Note: These are short kurtas (hip-length), not traditional long kurtas.",
  },
  "kurta-half-sleeve": {
    title: "Premium Short Kurta Half Sleeve for Men | Cotton Linen | VCHUKI",
    description: "Buy premium cotton-linen short kurtas with half sleeves at VCHUKI. Modern ethnic wear for Indian men. Handcrafted in Jodhpur. Free shipping above ₹1,599.",
    h1: "Short Kurta Half Sleeve — Premium Cotton Linen",
    content: "VCHUKI's half sleeve short kurtas bring effortless ethnic style to your wardrobe. Breathable LEE cotton-linen fabric, comfortable and handcrafted with 47 quality checks. Perfect for casual ethnic occasions, festivals, and relaxed weekends.",
  },
  linen: {
    title: "Cotton Linen Shirts for Men Online India | Breathable Summer Shirts | VCHUKI",
    description: "Buy premium cotton-linen shirts for men online at VCHUKI. Breathable, lightweight & perfect for Indian summers. Handcrafted in Jodhpur. Free shipping.",
    h1: "Cotton Linen Shirts for Men",
    content: "Stay cool and stylish with VCHUKI's premium cotton-linen shirts. Made from LEE fabric — breathable, soft, and perfect for Indian summers. Wear Your Culture. Live Your Story.",
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

  // FIX #9: Batch fetch all variants in ONE query (eliminates N+1)
  const productIds = products.map((p: any) => p._id)
  const allVariants = await ProductVariant.find({ product: { $in: productIds }, stock: { $gt: 0 } }).lean()

  const variantsByProduct = new Map<string, any[]>()
  for (const v of allVariants) {
    const pid = (v as any).product.toString()
    if (!variantsByProduct.has(pid)) variantsByProduct.set(pid, [])
    variantsByProduct.get(pid)!.push(v)
  }

  // Expand into variant cards
  const variantCards: any[] = []
  for (const product of products) {
    const p = product as any
    const variants = variantsByProduct.get(p._id.toString()) || []

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
          variantImage: p.images?.[0] || vAny.images?.[0],
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
          variantCards.push({ ...card, availableSizes: [searchParams.size] })
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vchuki.com" },
      { "@type": "ListItem", position: 2, name: "Shirts", item: "https://vchuki.com/shirts" },
      { "@type": "ListItem", position: 3, name: meta.h1, item: `https://vchuki.com/shirts/${params.category}` },
    ],
  }

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: meta.h1,
    description: meta.description,
    url: `https://vchuki.com/shirts/${params.category}`,
    isPartOf: { "@type": "WebSite", name: "VCHUKI", url: "https://vchuki.com" },
    breadcrumb: breadcrumbSchema,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
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
        <p className="text-xs text-muted-foreground mt-1">{serialized.length} variants available · Free shipping above ₹1,599</p>
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
    </>
  )
}
