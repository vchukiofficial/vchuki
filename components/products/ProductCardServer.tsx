import Link from "next/link"
import Image from "next/image"

interface Props {
  product: {
    _id: string
    name: string
    slug: string
    basePrice: number
    images: string[]
    category: string
    isFeatured: boolean
    tags?: string[]
  }
}

export default function ProductCardServer({ product }: Props) {
  return (
    <Link href={`/product/${product.slug}`} className="group block overflow-hidden">
      <div className="relative aspect-[3/4] bg-card overflow-hidden border border-border group-hover:border-[#c4956a]/30 transition-colors">
        <Image
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {product.tags?.includes("new-launch") && (
            <span className="text-[8px] uppercase tracking-[0.1em] bg-[#c4956a] text-white px-2 py-0.5 font-medium">New</span>
          )}
          {product.tags?.includes("bestseller") && !product.tags?.includes("new-launch") && (
            <span className="text-[8px] uppercase tracking-[0.1em] bg-[#2a1f14] text-[#f5e6d3] px-2 py-0.5 font-medium">Bestseller</span>
          )}
          {!product.tags?.includes("new-launch") && !product.tags?.includes("bestseller") && (
            <span className="text-[8px] uppercase tracking-[0.1em] bg-background/80 dark:bg-card/80 backdrop-blur-sm px-2 py-0.5 text-muted-foreground font-medium">
              {product.category}
            </span>
          )}
        </div>
      </div>
      <div className="pt-3">
        <h3 className="text-xs font-normal truncate text-foreground/80 group-hover:text-foreground transition-colors">{product.name}</h3>
        <p className="text-sm font-semibold text-foreground mt-0.5">₹{product.basePrice.toLocaleString()}</p>
      </div>
    </Link>
  )
}
