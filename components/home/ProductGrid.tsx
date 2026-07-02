"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { QuickAddButton } from "./QuickAddButton"

interface Props {
  products: any[]
}

export function ProductGrid({ products }: Props) {
  if (!products.length) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <div key={product._id} className="group">
          <Link href={`/product/${product.slug}`} className="block">
            <div className="relative aspect-[3/4] bg-card overflow-hidden mb-3 border border-border group-hover:border-[#c4956a]/30 transition-colors">
              <Image
                src={product.images?.[0] || "/placeholder-product.svg"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
              />
              {product.tags?.includes("new-launch") && (
                <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-[#c4956a] text-white px-2 py-0.5 font-medium">
                  New
                </span>
              )}
              <button
                className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-3.5 w-3.5 text-foreground/70" />
              </button>
              {/* Desktop quick add overlay */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                <QuickAddButton product={product} />
              </div>
            </div>
          </Link>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-[11px] md:text-xs font-normal line-clamp-1 text-foreground/80">{product.name}</h3>
            <p className="text-xs md:text-sm font-semibold mt-0.5 text-foreground">₹{product.basePrice?.toLocaleString()}</p>
          </Link>
          {/* Mobile quick add */}
          <div className="mt-2 md:hidden">
            <QuickAddButton product={product} />
          </div>
        </div>
      ))}
    </div>
  )
}
