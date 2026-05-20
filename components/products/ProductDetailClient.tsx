"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"
import { Star, ShoppingCart, Heart, Check } from "lucide-react"
import type { Product, ProductVariant, Review } from "@/types"

interface Props {
  product: Product
  variants: ProductVariant[]
  reviews: Review[]
}

export default function ProductDetailClient({ product, variants, reviews }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  const sizes = [...new Set(variants.map((v) => v.size))]
  const colors = [...new Map(variants.map((v) => [v.color.name, v.color])).values()]

  const [selectedSize, setSelectedSize] = useState(sizes[0] || "")
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "")
  const [added, setAdded] = useState(false)

  const selectedVariant = variants.find(
    (v) => v.size === selectedSize && v.color.name === selectedColor
  )

  const price = product.basePrice + (selectedVariant?.priceAdjustment || 0)
  const inStock = (selectedVariant?.stock || 0) > 0

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price,
      quantity: 1,
      sku: selectedVariant.sku,
      variantId: selectedVariant._id,
      size: selectedSize,
      color: selectedColor,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
            <Image
              src={product.images[0] || "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary">{product.category}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          <p className="text-3xl font-bold text-primary">₹{price.toLocaleString()}</p>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Color */}
          <div>
            <p className="text-sm font-medium mb-2">Color: {selectedColor}</p>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor === color.name ? "border-primary scale-110" : "border-border/50"}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-sm font-medium mb-2">Size: {selectedSize}</p>
            <div className="flex gap-2">
              {sizes.map((size) => {
                const variant = variants.find((v) => v.size === size && v.color.name === selectedColor)
                const available = (variant?.stock || 0) > 0
                return (
                  <button
                    key={size}
                    onClick={() => available && setSelectedSize(size)}
                    disabled={!available}
                    className={`h-10 w-12 rounded border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary/10 text-primary"
                        : available
                        ? "border-border/50 hover:border-primary/50"
                        : "border-border/30 text-muted-foreground/30 cursor-not-allowed line-through"
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Stock */}
          <p className={`text-sm ${inStock ? "text-green-500" : "text-destructive"}`}>
            {inStock ? `In stock (${selectedVariant?.stock} left)` : "Out of stock"}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={!inStock || added}
              onClick={handleAddToCart}
            >
              {added ? <><Check className="h-4 w-4 mr-2" /> Added</> : <><ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart</>}
            </Button>
            <Button variant="outline" size="lg" className="border-primary/30">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Details */}
          <div className="border-t border-border/50 pt-4 space-y-2 text-sm text-muted-foreground">
            <p>Fabric: {selectedVariant?.fabric || "Cotton"}</p>
            <p>Fit: {selectedVariant?.fit || "Regular"}</p>
            <p>SKU: {selectedVariant?.sku || "—"}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6">Reviews ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review._id} className="p-4 rounded-lg border border-border/50 bg-card/50">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.user?.name || "User"}</span>
                  {review.verifiedPurchase && (
                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">Verified</span>
                  )}
                </div>
                {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
