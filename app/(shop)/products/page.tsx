import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductCardServer from "@/components/products/ProductCardServer"
import Link from "next/link"

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
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {searchParams.category ? searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1) : "All"} Shirts
          </h1>
          <p className="text-sm text-muted-foreground">{total} products</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Link href="/products">
          <span className={`px-4 py-2 rounded-full text-sm border transition-colors ${!searchParams.category ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"}`}>
            All
          </span>
        </Link>
        {categories.map((cat) => (
          <Link key={cat} href={`/products?category=${cat}`}>
            <span className={`px-4 py-2 rounded-full text-sm border transition-colors capitalize ${searchParams.category === cat ? "bg-primary text-primary-foreground border-primary" : "border-border/50 text-muted-foreground hover:border-primary/50"}`}>
              {cat}
            </span>
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {serialized.map((product: any) => (
          <ProductCardServer key={product._id} product={product} />
        ))}
      </div>

      {serialized.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          No products found.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link
              key={i}
              href={`/products?${new URLSearchParams({ ...searchParams, page: String(i + 1) })}`}
              className={`h-8 w-8 rounded flex items-center justify-center text-sm ${page === i + 1 ? "bg-primary text-primary-foreground" : "bg-card border border-border/50 text-muted-foreground hover:border-primary/50"}`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
