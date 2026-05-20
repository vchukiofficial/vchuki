import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import Link from "next/link"
import Image from "next/image"

interface Props {
  searchParams: { category?: string; search?: string; page?: string }
}

export default async function ProductsPage({ searchParams }: Props) {
  await connectDB()

  const query: Record<string, any> = { isActive: true }
  if (searchParams.category) query.category = searchParams.category
  if (searchParams.search) query.name = { $regex: searchParams.search, $options: "i" }

  const page = Number(searchParams.page) || 1
  const limit = 12
  const skip = (page - 1) * limit

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ])

  const serialized = JSON.parse(JSON.stringify(products))
  const totalPages = Math.ceil(total / limit)
  const categories = ["formal", "casual", "ethnic"]

  return (
    <div className="container py-4 md:py-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-lg md:text-2xl font-bold">
          {searchParams.category ? searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1) + " Shirts" : "All Shirts"}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">{total} products</p>
      </div>

      {/* Filters - horizontal scroll on mobile */}
      <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto no-scrollbar pb-1">
        <Link href="/products">
          <span className={`inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm border whitespace-nowrap transition-colors ${!searchParams.category ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
            All
          </span>
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/products?category=${cat}`}>
            <span className={`inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm border whitespace-nowrap transition-colors capitalize ${searchParams.category === cat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
              {cat}
            </span>
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
        {serialized.map((product: any) => (
          <Link key={product._id} href={`/products/${product.slug}`} className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
              <Image
                src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-muted-foreground">
                {product.category}
              </span>
            </div>
            <div className="p-2.5 md:p-3">
              <h3 className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</h3>
              <p className="text-sm md:text-base font-bold text-primary mt-0.5">₹{product.basePrice.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>

      {serialized.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">No products found.</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6 md:mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i}
              href={`/products?${new URLSearchParams({ ...searchParams, page: String(i + 1) })}`}
              className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border text-muted-foreground hover:border-primary/50"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
