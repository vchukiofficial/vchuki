"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart, Check, ArrowRight } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

interface Variant {
  _id: string
  color: { name: string; hex: string }
  size: string
  stock: number
  sku: string
  images: string[]
  priceAdjustment: number
}

interface RecommendedProduct {
  _id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  category: string
  variants: Variant[]
}

interface Props {
  currentProductId: string
  currentCategory: string
}

export default function ProductRecommendations({ currentProductId, currentCategory }: Props) {
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        // Fetch from other categories
        const allCategories = ["linen-half-sleeve", "linen-full-sleeve", "kurta-half-sleeve", "kurta-full-sleeve"]
        const otherCategories = allCategories.filter((c) => c !== currentCategory)

        const results: RecommendedProduct[] = []

        for (const cat of otherCategories) {
          const res = await fetch(`/api/products?category=${cat}&limit=3`)
          if (!res.ok) continue
          const data = await res.json()

          for (const product of data.products || []) {
            if (product._id === currentProductId) continue
            const varRes = await fetch(`/api/products/${product._id}/variants`)
            if (!varRes.ok) continue
            const varData = await varRes.json()
            const variants = (varData.variants || []).filter((v: any) => v.stock > 0)
            if (variants.length > 0) {
              results.push({ ...product, variants })
            }
          }
        }

        setProducts(results.slice(0, 8))
      } catch {
        // silent fail
      }
      setLoading(false)
    }

    fetchRecommendations()
  }, [currentProductId, currentCategory])

  function handleQuickAdd(product: RecommendedProduct, variant: Variant) {
    addItem({
      _id: `${product._id}-${variant.sku}`,
      name: product.name,
      slug: product.slug,
      images: variant.images?.length ? variant.images : product.images,
      price: product.basePrice + (variant.priceAdjustment || 0),
      quantity: 1,
      sku: variant.sku,
      variantId: variant._id,
      size: variant.size,
      color: variant.color.name,
    })
    setAddedId(`${product._id}-${variant.sku}`)
    setTimeout(() => setAddedId(null), 2000)
  }

  if (loading) {
    return (
      <section className="container py-12 md:py-16 border-t border-border mt-12">
        <div className="h-6 w-48 bg-muted animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="container py-12 md:py-16 border-t border-border mt-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4956a] font-medium">Complete Your Look</p>
          <h2 className="text-xl md:text-2xl font-light tracking-tight mt-1 text-foreground">You May Also Like</h2>
        </div>
        <Link href="/shirts" className="group flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map((product) => {
          // Get unique colors
          const colorMap = new Map<string, Variant>()
          product.variants.forEach((v) => {
            if (!colorMap.has(v.color.name)) colorMap.set(v.color.name, v)
          })
          const uniqueColors = Array.from(colorMap.values())
          const firstVariant = uniqueColors[0]
          const displayImage = firstVariant?.images?.[0] || product.images?.[0]

          return (
            <div key={product._id} className="group">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] bg-card overflow-hidden border border-border group-hover:border-[#c4956a]/30 transition-colors mb-2">
                  {displayImage && (
                    <Image
                      src={displayImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                    />
                  )}
                  {/* Category badge */}
                  <span className="absolute top-2 left-2 text-[8px] uppercase tracking-wider bg-background/80 backdrop-blur-sm px-2 py-0.5 border border-border text-muted-foreground">
                    {product.category.replace(/-/g, " ")}
                  </span>
                  {/* Wishlist */}
                  <button
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart className="h-3.5 w-3.5 text-foreground/70" />
                  </button>
                </div>
              </Link>

              {/* Info */}
              <Link href={`/product/${product.slug}`} className="block">
                <h3 className="text-[11px] md:text-xs font-normal line-clamp-1 text-foreground/80">{product.name}</h3>
                <p className="text-xs md:text-sm font-semibold mt-0.5 text-foreground">₹{(product.basePrice + (firstVariant?.priceAdjustment || 0)).toLocaleString()}</p>
              </Link>

              {/* Color dots */}
              {uniqueColors.length > 1 && (
                <div className="flex gap-1.5 mt-1.5">
                  {uniqueColors.slice(0, 5).map((v) => (
                    <div
                      key={v.color.name}
                      className="w-3.5 h-3.5 rounded-full border border-border"
                      style={{ backgroundColor: v.color.hex }}
                      title={v.color.name}
                    />
                  ))}
                  {uniqueColors.length > 5 && (
                    <span className="text-[9px] text-muted-foreground self-center">+{uniqueColors.length - 5}</span>
                  )}
                </div>
              )}

              {/* Quick Add Button */}
              <button
                onClick={() => handleQuickAdd(product, firstVariant)}
                disabled={addedId === `${product._id}-${firstVariant.sku}`}
                className={`mt-2 w-full py-2 flex items-center justify-center gap-1.5 text-[10px] font-medium tracking-wider uppercase border transition-all ${
                  addedId === `${product._id}-${firstVariant.sku}`
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-border text-foreground hover:border-[#c4956a] hover:bg-[#c4956a]/5"
                }`}
              >
                {addedId === `${product._id}-${firstVariant.sku}` ? (
                  <><Check className="h-3 w-3" /> Added</>
                ) : (
                  <><ShoppingCart className="h-3 w-3" /> Quick Add</>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Engaging content */}
      <div className="mt-10 p-6 md:p-8 bg-card/50 border border-border text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4956a] font-medium mb-2">Customers Also Prefer</p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          Pair your selection with pieces from our other collections. Our customers love mixing kurtas with linen shirts for a versatile wardrobe that transitions effortlessly from casual to semi-formal.
        </p>
        <Link
          href="/shirts"
          className="inline-flex items-center gap-2 mt-4 text-xs uppercase tracking-wider font-medium text-[#c4956a] border-b border-[#c4956a]/30 pb-0.5 hover:border-[#c4956a] transition-colors"
        >
          Explore Full Collection <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  )
}
