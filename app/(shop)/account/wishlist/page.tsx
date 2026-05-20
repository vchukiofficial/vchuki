"use client"

import { useWishlistStore } from "@/store/wishlistStore"
import { useEffect, useState } from "react"
import type { Product } from "@/types"
import ProductCardServer from "@/components/products/ProductCardServer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function WishlistPage() {
  const { items: wishlistIds } = useWishlistStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (wishlistIds.length > 0) {
      fetch(`/api/products?ids=${wishlistIds.join(",")}`)
        .then((r) => r.json())
        .then((data) => { setProducts(data.products || []); setLoading(false) })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [wishlistIds])

  if (loading) return <div className="container py-20 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Wishlist ({wishlistIds.length})</h1>
      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Link href="/products"><Button variant="outline">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCardServer key={p._id} product={p as any} />
          ))}
        </div>
      )}
    </div>
  )
}
