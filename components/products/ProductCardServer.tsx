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
  }
}

export default function ProductCardServer({ product }: Props) {
  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-lg border border-border/50 bg-card/50 overflow-hidden hover:border-primary/30 transition-all">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <Image
          src={product.images[0] || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <span className="text-[10px] uppercase tracking-wider bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-muted-foreground">
            {product.category}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</h3>
        <p className="text-sm font-bold text-primary mt-1">₹{product.basePrice.toLocaleString()}</p>
      </div>
    </Link>
  )
}
