"use client"

import { useWishlistStore } from "@/store/wishlistStore"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Trash2 } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

interface WishlistProduct {
  _id: string
  name: string
  slug: string
  basePrice: number
  comparePrice?: number
  images: string[]
  category: string
}

export default function WishlistPage() {
  const { items: wishlistIds, load, toggle } = useWishlistStore()
  const addItem = useCartStore((s) => s.addItem)
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (wishlistIds.length > 0) {
      fetch(`/api/products?ids=${wishlistIds.join(",")}&limit=50`)
        .then((r) => r.json())
        .then((data) => { setProducts(data.products || []); setLoading(false) })
        .catch(() => setLoading(false))
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [wishlistIds])

  function handleRemove(productId: string) {
    toggle(productId)
  }

  function handleAddToCart(product: WishlistProduct) {
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
  }

  if (loading) return <div className="container py-20 text-center text-sm text-muted-foreground animate-pulse">Loading wishlist...</div>

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Wishlist</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{wishlistIds.length} items saved</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border border-border">
          <Heart className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Your wishlist is empty</p>
          <Link href="/shirts" className="inline-block px-6 py-2.5 border border-[#c4956a] text-[#c4956a] text-xs font-medium uppercase tracking-wider hover:bg-[#c4956a]/5 transition-colors">
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <div key={product._id} className="group border border-border hover:border-[#c4956a]/20 transition-colors">
              <Link href={`/product/${product.slug}`} className="block">
                <div className="relative aspect-[3/4] bg-card overflow-hidden">
                  {product.images?.[0] && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                </div>
              </Link>
              <div className="p-3 space-y-2">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="text-xs font-medium text-foreground line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-foreground">₹{product.basePrice.toLocaleString()}</span>
                    {product.comparePrice && product.comparePrice > product.basePrice && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</span>
                        <span className="text-[9px] px-1 py-0.5 bg-emerald-500/10 text-emerald-600 font-semibold">
                          {Math.round(((product.comparePrice - product.basePrice) / product.comparePrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
                  >
                    <ShoppingCart className="h-3 w-3" /> Add to Bag
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="h-8 w-8 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
