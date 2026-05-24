import { Metadata } from "next"
import { Suspense } from "react"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import Link from "next/link"
import ProductFilters from "@/components/products/ProductFilters"
import { ShirtsProductGrid } from "@/components/products/ShirtsProductGrid"

export const metadata: Metadata = {
  title: "Shop Premium Shirts for Men — Formal, Casual, Linen | VCHUKI",
  description: "Browse VCHUKI's collection of premium shirts for men. Formal, casual, linen, cotton & premium shirts. Free shipping above ₹999.",
  keywords: ["buy shirts online", "premium shirts india", "formal shirts men", "casual shirts", "linen shirts online", "vchuki shirts"],
  alternates: { canonical: "https://vchuki.com/shirts" },
}

export const revalidate = 0

const categories = [
  { slug: "linen-full-sleeve", name: "Linen Full Sleeve" },
  { slug: "linen-half-sleeve", name: "Linen Half Sleeve" },
  { slug: "kurta-full-sleeve", name: "Short Kurta Full Sleeve" },
  { slug: "kurta-half-sleeve", name: "Short Kurta Half Sleeve" },
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

  return (
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
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{total} products · Free shipping above ₹999</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
        <Link href="/shirts" className="px-4 py-2 text-[10px] uppercase tracking-wider font-medium border border-[#c4956a] bg-[#c4956a]/10 text-[#c4956a] whitespace-nowrap">
          All
        </Link>
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="px-4 py-2 text-[10px] uppercase tracking-wider font-medium border border-border text-muted-foreground hover:border-[#c4956a]/40 hover:text-foreground whitespace-nowrap transition-colors">
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <ProductFilters />
      </Suspense>

      {/* Products Grid with Add to Cart */}
      <ShirtsProductGrid products={serialized} />

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
  )
}
