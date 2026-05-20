import { Metadata } from "next"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Shop Premium Shirts for Men — Formal, Casual, Linen | VCHUKI",
  description: "Browse VCHUKI's complete collection of premium shirts for men. Formal shirts, casual shirts, linen shirts, cotton shirts & more. Free shipping above ₹999.",
  keywords: ["buy shirts online", "premium shirts india", "formal shirts men", "casual shirts", "linen shirts online"],
  alternates: { canonical: "https://vchuki.com/shirts" },
  openGraph: {
    title: "Shop Premium Shirts for Men | VCHUKI",
    description: "India's finest collection of premium shirts. Formal, casual, linen & cotton.",
    url: "https://vchuki.com/shirts",
  },
}

const categories = [
  { slug: "formal", name: "Formal Shirts", desc: "Office & events", count: 0 },
  { slug: "casual", name: "Casual Shirts", desc: "Everyday style", count: 0 },
  { slug: "linen", name: "Linen Shirts", desc: "Summer essentials", count: 0 },
  { slug: "cotton", name: "Cotton Shirts", desc: "Classic comfort", count: 0 },
  { slug: "oversized", name: "Oversized Shirts", desc: "Relaxed fit", count: 0 },
  { slug: "premium", name: "Premium Collection", desc: "Luxury picks", count: 0 },
]

export default async function ShirtsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  await connectDB()

  const query: Record<string, any> = { isActive: true }
  if (searchParams.search) query.name = { $regex: searchParams.search, $options: "i" }

  const page = Number(searchParams.page) || 1
  const limit = 12

  const [products, total] = await Promise.all([
    Product.find(query).sort({ isFeatured: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
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
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Shirts</span>
        </nav>

        {/* SEO Heading */}
        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold">Premium Shirts for Men</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover {total} handcrafted shirts — formal, casual, linen & more. Free shipping above ₹999.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/shirts/${cat.slug}`} className="p-3 rounded-xl border bg-card text-center hover:border-primary/50 transition-all group">
              <p className="text-xs md:text-sm font-medium group-hover:text-primary transition-colors">{cat.name.replace(" Shirts", "")}</p>
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
          {serialized.map((product: any) => (
            <Link key={product._id} href={`/product/${product.slug}`} className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                <Image
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
                  alt={`${product.name} - Buy online at VCHUKI`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {product.isFeatured && (
                  <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
                    Bestseller
                  </span>
                )}
              </div>
              <div className="p-2.5 md:p-3">
                <h2 className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</h2>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm md:text-base font-bold text-primary">₹{product.basePrice?.toLocaleString()}</p>
                  <span className="text-[10px] text-muted-foreground capitalize">{product.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {serialized.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No products found.</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, i) => (
              <Link key={i} href={`/shirts?page=${i + 1}`} className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border text-muted-foreground"}`}>
                {i + 1}
              </Link>
            ))}
          </div>
        )}

        {/* SEO Content */}
        <section className="mt-12 prose prose-sm max-w-none text-muted-foreground">
          <h2 className="text-lg font-bold text-foreground">Buy Premium Shirts Online at VCHUKI</h2>
          <p>
            VCHUKI offers India&apos;s finest collection of premium shirts for men. Whether you&apos;re looking for formal shirts for office wear,
            casual shirts for weekends, or breathable linen shirts for summer — we have it all. Each shirt is crafted with premium fabrics,
            perfect stitching, and modern fits designed for the Indian body type.
          </p>
          <p>
            Our collection includes Oxford shirts, mandarin collar shirts, denim shirts, flannel shirts, and polo t-shirts.
            All shirts come with free shipping above ₹999 and a 30-day easy return policy.
          </p>
        </section>
      </div>
    </>
  )
}
