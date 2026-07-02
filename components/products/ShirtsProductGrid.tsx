"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Check } from "lucide-react"
import { useState } from "react"
import { useCartStore } from "@/store/cartStore"

interface Product {
  _id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  category: string
  tags?: string[]
}

function QuickAdd({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price: product.basePrice,
      quantity: 1,
      sku: `${product.slug}-default`,
      variantId: product._id,
      size: "M",
      color: "Default",
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-2 text-[10px] font-medium tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-[#2a1f14]/90 dark:bg-[#c4956a]/90 backdrop-blur-sm text-[#f5e6d3] dark:text-[#2a1f14] hover:bg-[#2a1f14] dark:hover:bg-[#c4956a]"
      }`}
    >
      {added ? <><Check className="h-3 w-3" /> Added</> : <><ShoppingCart className="h-3 w-3" /> Add to Bag</>}
    </button>
  )
}

export function ShirtsProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <div key={product._id} className="group">
          <Link href={`/product/${product.slug}`} className="block">
            <div className="relative aspect-[3/4] bg-card overflow-hidden border border-border group-hover:border-[#c4956a]/30 transition-colors">
              <Image
                src={product.images?.[0] || "/placeholder-product.svg"}
                alt={`${product.name} - VCHUKI`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              {/* Badges */}
              {product.tags?.includes("new-launch") && (
                <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-[#c4956a] text-white px-2 py-0.5 font-medium">New</span>
              )}
              {product.tags?.includes("bestseller") && !product.tags?.includes("new-launch") && (
                <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-[#2a1f14] text-[#f5e6d3] px-2 py-0.5 font-medium">Bestseller</span>
              )}
              {/* Wishlist */}
              <button
                className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-3.5 w-3.5 text-foreground/70" />
              </button>
              {/* Desktop hover quick add */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                <QuickAdd product={product} />
              </div>
            </div>
          </Link>
          {/* Product info */}
          <div className="pt-2.5">
            <Link href={`/product/${product.slug}`}>
              <h2 className="text-[11px] md:text-xs font-normal line-clamp-1 text-foreground/80 group-hover:text-foreground transition-colors">{product.name}</h2>
              <p className="text-sm font-semibold text-foreground mt-0.5">₹{product.basePrice?.toLocaleString()}</p>
            </Link>
            {/* Mobile always-visible add to cart */}
            <div className="mt-2 md:hidden">
              <QuickAdd product={product} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
