"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, ShoppingCart, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useCartStore } from "@/store/cartStore"
import { useWishlistStore } from "@/store/wishlistStore"

interface VariantProduct {
  _id: string
  productId?: string
  name: string
  slug: string
  basePrice: number
  comparePrice?: number
  images: string[]
  category: string
  tags?: string[]
  variantColor?: { name: string; hex: string }
  variantImage?: string
  variantPrice?: number
  variantSku?: string
  variantId?: string
  variantStock?: number
  availableSizes?: string[]
}

function QuickAddVariant({ product, onSizeSelect }: { product: VariantProduct; onSizeSelect?: (size: string) => void }) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState(product.availableSizes?.[0] || "M")

  function handleSizeClick(e: React.MouseEvent, size: string) {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize(size)
    onSizeSelect?.(size)
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      _id: product.variantId ? `${product.productId || product._id}-${product.variantSku}` : product._id,
      name: product.name,
      slug: product.slug,
      images: product.variantImage ? [product.variantImage] : product.images,
      price: product.variantPrice || product.basePrice,
      quantity: 1,
      sku: product.variantSku || `${product.slug}-default`,
      variantId: product.variantId || product._id,
      size: selectedSize,
      color: product.variantColor?.name || "Default",
    })
    setAdded(true)
  }

  return (
    <div className="space-y-2">
      {/* Size selector — larger, readable */}
      {product.availableSizes && product.availableSizes.length > 1 && (
        <div className="flex gap-1.5 flex-wrap" onClick={(e) => e.preventDefault()}>
          {product.availableSizes.map((size) => (
            <button
              key={size}
              onClick={(e) => handleSizeClick(e, size)}
              className={`h-8 min-w-[2.2rem] px-2 text-xs font-semibold border transition-all ${
                selectedSize === size
                  ? "border-[#c4956a] bg-[#c4956a] text-white"
                  : "border-white/40 text-white bg-black/30 backdrop-blur-sm hover:border-[#c4956a]/70"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={handleAdd}
        disabled={added}
        className={`w-full py-2.5 text-xs font-medium tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 ${
          added
            ? "bg-emerald-600 text-white"
            : "bg-[#2a1f14]/90 dark:bg-[#c4956a]/90 backdrop-blur-sm text-[#f5e6d3] dark:text-[#2a1f14] hover:bg-[#2a1f14] dark:hover:bg-[#c4956a]"
        }`}
      >
        {added ? <><Check className="h-3.5 w-3.5" /> Added to Bag</> : <><ShoppingCart className="h-3.5 w-3.5" /> Add to Bag</>}
      </button>
    </div>
  )
}

export function ShirtsVariantGrid({ products }: { products: VariantProduct[] }) {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const { items: wishlistItems, toggle: toggleWishlist, load: loadWishlist } = useWishlistStore()
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => { loadWishlist() }, [loadWishlist])

  async function handleWishlistToggle(e: React.MouseEvent, productId: string) {
    e.preventDefault()
    e.stopPropagation()
    const prevItems = [...wishlistItems]
    await toggleWishlist(productId)
    // If store reverted (meaning API returned 401), show login prompt
    setTimeout(() => {
      const current = useWishlistStore.getState().items
      const wasInList = prevItems.includes(productId)
      const isInList = current.includes(productId)
      if (wasInList === isInList && !wasInList) {
        setShowLoginPrompt(true)
        setTimeout(() => setShowLoginPrompt(false), 3000)
      }
    }, 600)
  }

  function handleSizeSelect(productId: string, size: string) {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }))
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => {
        const isVariant = !!product.variantColor
        const displayImage = isVariant
          ? product.variantImage
          : product.images?.[0] || "/placeholder-product.svg"
        const displayPrice = isVariant ? product.variantPrice : product.basePrice

        // Build product link with color and size params
        const linkParams = new URLSearchParams()
        if (isVariant && product.variantColor?.name) {
          linkParams.set("color", product.variantColor.name)
        }
        const sizeForLink = selectedSizes[product._id] || product.availableSizes?.[0]
        if (sizeForLink) {
          linkParams.set("size", sizeForLink)
        }
        const productHref = `/product/${product.slug}${linkParams.toString() ? `?${linkParams.toString()}` : ""}`

        return (
          <div key={product._id} className="group">
            <Link href={productHref} className="block">
              <div className="relative aspect-[3/4] bg-card overflow-hidden border border-border group-hover:border-[#c4956a]/30 transition-colors">
                {displayImage && (
                  <Image
                    src={displayImage}
                    alt={`${product.name}${isVariant ? ` - ${product.variantColor!.name}` : ""}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                )}
                {/* Badges */}
                {product.tags?.includes("new-launch") && (
                  <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-[#c4956a] text-white px-2 py-0.5 font-medium">New</span>
                )}
                {product.tags?.includes("bestseller") && !product.tags?.includes("new-launch") && (
                  <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-[#2a1f14] text-[#f5e6d3] px-2 py-0.5 font-medium">Bestseller</span>
                )}
                {/* Color indicator */}
                {isVariant && product.variantColor?.hex && (
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-2 py-1 border border-border">
                    <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: product.variantColor.hex }} />
                    <span className="text-[9px] font-medium text-foreground">{product.variantColor.name}</span>
                  </div>
                )}
                {/* Wishlist */}
                <button
                  className={`absolute top-2.5 right-2.5 h-7 w-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                    wishlistItems.includes(product.productId || product._id.split("-")[0])
                      ? "bg-red-500/20 opacity-100"
                      : "bg-white/80 dark:bg-black/50 opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => handleWishlistToggle(e, product.productId || product._id.split("-")[0])}
                >
                  <Heart className={`h-3.5 w-3.5 ${
                    wishlistItems.includes(product.productId || product._id.split("-")[0])
                      ? "fill-red-500 text-red-500"
                      : "text-foreground/70"
                  }`} />
                </button>
                {/* Desktop hover quick add */}
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-8">
                  <QuickAddVariant product={product} onSizeSelect={(size) => handleSizeSelect(product._id, size)} />
                </div>
              </div>
            </Link>
            {/* Product info */}
            <div className="pt-2.5">
              <Link href={productHref}>
                <h2 className="text-[11px] md:text-xs font-normal line-clamp-1 text-foreground/80 group-hover:text-foreground transition-colors">{product.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-semibold text-foreground">₹{displayPrice?.toLocaleString()}</p>
                  {product.comparePrice && product.comparePrice > (displayPrice || 0) && (
                    <p className="text-xs text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</p>
                  )}
                  {product.comparePrice && product.comparePrice > (displayPrice || 0) && (
                    <span className="text-[9px] px-1 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {Math.round(((product.comparePrice - (displayPrice || 0)) / product.comparePrice) * 100)}% OFF
                    </span>
                  )}
                </div>
              </Link>
              {/* Mobile always-visible add to cart */}
              <div className="mt-2 md:hidden">
                <QuickAddVariant product={product} onSizeSelect={(size) => handleSizeSelect(product._id, size)} />
              </div>
            </div>
          </div>
        )
      })}

      {/* Login prompt toast */}
      {showLoginPrompt && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-3 text-xs font-medium shadow-xl animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3">
          <Heart className="h-3.5 w-3.5" />
          <span>Please <a href="/auth/login" className="underline text-[#c4956a]">sign in</a> to save items to wishlist</span>
        </div>
      )}
    </div>
  )
}
