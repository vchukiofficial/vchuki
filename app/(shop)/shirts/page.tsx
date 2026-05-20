import { Metadata } from "next"
import { Suspense } from "react"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import Link from "next/link"
import Image from "next/image"
import ProductFilters from "@/components/products/ProductFilters"

export const metadata: Metadata = {
  title: "Shop Premium Shirts for Men — Formal, Casual, Linen | VCHUKI",
  description: "Browse VCHUKI's collection of 500+ premium shirts for men. Formal, casual, linen, cotton, oversized & ethnic shirts. Free shipping above ₹999. Launching July 7, 2026.",
  keywords: ["buy shirts online", "premium shirts india", "formal shirts men", "casual shirts", "linen shirts online", "vchuki shirts"],
  alternates: { canonical: "https://vchuki.com/shirts" },
  openGraph: { title: "Shop Premium Shirts for Men | VCHUKI", description: "India's finest collection of 500+ premium shirts.", url: "https://vchuki.com/shirts" },
}

const categories = [
  { slug: "formal", name: "Formal" },
  { slug: "casual", name: "Casual" },
  { slug: "linen", name: "Linen" },
  { slug: "cotton", name: "Cotton" },
  { slug: "oversized", name: "Oversized" },
  { slug: "premium", name: "Premium" },
  { slug: "ethnic", name: "Ethnic" },
]

interface Props {
  searchParams: { search?: string; page?: string; sort?: string; price?: string; tag?: string; size?: string }
}

export default async function ShirtsPage({ searchParams }: Props) {
  await connectDB()

  const query: Record<string, any> = { isActive: true }
  if (searchParams.search) query.name = { $regex: searchParams.search, $options: "i" }
  if (searchParams.tag) query.tags = { $in: [searchParams.tag] }
  if (searchParams.price) {
    const [min, max] = searchParams.price.split("-").map(Number)
    query.basePrice = { $gte: min, $lte: max }
  }

  let sort: Record<string, any> = { createdAt: -1 }
  switch (searchParams.sort) {
    case "price-asc": sort = { basePrice: 1 }; break
    case "price-desc": sort = { basePrice: -1 }; break
    case "bestseller": query.tags = { ...(query.tags || {}), $in: [...(query.tags?.$in || []), "bestseller"] }; break
    case "rating": sort = { rating: -1 }; break
  }

  const page = Number(searchParams.page) || 1
  const limit = 24

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(query),
  ])

  const serialized = JSON.parse(JSON.stringify(products))
  const totalPages = Math.ceil(total / limit)

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vchuki.com" },
      { "@type": "ListItem", position: 2, name: "Shirts", item: "https://vchuki.com/shirts" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container py-4 md:py-8">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Shirts</span>
        </nav>

        <div className="mb-4">
          <h1 className="text-xl md:text-3xl font-bold">Premium Shirts for Men</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{total} products · Free shipping above ₹999 · Launching July 7</p>
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 pb-1">
          <Link href="/shirts" className="px-3 py-1.5 rounded-full text-[11px] md:text-xs border bg-primary text-primary-foreground border-primary whitespace-nowrap">All</Link>
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="px-3 py-1.5 rounded-full text-[11px] md:text-xs border border-border text-muted-foreground hover:border-primary/50 whitespace-nowrap transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Filters */}
        <Suspense fallback={null}>
          <ProductFilters />
        </Suspense>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {serialized.map((product: any) => (
            <Link key={product._id} href={`/product/${product.slug}`} className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                <Image
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
                  alt={`${product.name} - Buy at VCHUKI`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {product.tags?.includes("new-launch") && (
                  <span className="absolute top-2 left-2 text-[8px] md:text-[9px] uppercase tracking-wider bg-green-600 text-white px-1.5 py-0.5 rounded font-medium">New</span>
                )}
                {product.tags?.includes("bestseller") && !product.tags?.includes("new-launch") && (
                  <span className="absolute top-2 left-2 text-[8px] md:text-[9px] uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">Bestseller</span>
                )}
              </div>
              <div className="p-2 md:p-3">
                <h2 className="text-[11px] md:text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">{product.name}</h2>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-sm md:text-base font-bold text-primary">₹{product.basePrice?.toLocaleString()}</p>
                  {product.rating && (
                    <span className="text-[10px] text-muted-foreground">★ {product.rating?.toFixed(1)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {serialized.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products match your filters.</p>
            <Link href="/shirts" className="text-sm text-primary mt-2 inline-block">Clear filters →</Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-8">
            {page > 1 && (
              <Link href={`/shirts?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`} className="h-8 px-3 rounded-lg flex items-center justify-center text-xs bg-card border text-muted-foreground">
                ← Prev
              </Link>
            )}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i
              return (
                <Link key={p} href={`/shirts?${new URLSearchParams({ ...searchParams, page: String(p) })}`} className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs ${page === p ? "bg-primary text-primary-foreground" : "bg-card border text-muted-foreground"}`}>
                  {p}
                </Link>
              )
            })}
            {page < totalPages && (
              <Link href={`/shirts?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`} className="h-8 px-3 rounded-lg flex items-center justify-center text-xs bg-card border text-muted-foreground">
                Next →
              </Link>
            )}
          </div>
        )}

        {/* SEO Content */}
        <section className="mt-12 text-xs text-muted-foreground max-w-3xl space-y-2">
          <h2 className="text-sm font-bold text-foreground">Buy Premium Shirts Online at VCHUKI</h2>
          <p>VCHUKI offers 500+ premium shirts for men across formal, casual, linen, cotton, oversized, premium, and ethnic categories. Every shirt is crafted with premium fabrics, perfect stitching, and modern fits. Free shipping above ₹999. 30-day easy returns. Launching July 7, 2026.</p>
        </section>
      </div>
    </>
  )
}
