"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useCartStore } from "@/store/cartStore"
import { Star, ShoppingCart, Heart, Check, Truck, RotateCcw, Shield } from "lucide-react"
import type { Product, ProductVariant, Review } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
  product: Product
  variants: ProductVariant[]
  reviews: Review[]
}

export default function ProductDetailClient({ product, variants, reviews }: Props) {
  const addItem = useCartStore((s) => s.addItem)

  // Derive unique sizes and colors from variants
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants])
  const colors = useMemo(() => [...new Map(variants.map((v) => [v.color.name, v.color])).values()], [variants])

  const [selectedSize, setSelectedSize] = useState(sizes[0] || "")
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "")
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [added, setAdded] = useState(false)

  // Get selected variant
  const selectedVariant = useMemo(
    () => variants.find((v) => v.size === selectedSize && v.color.name === selectedColor),
    [variants, selectedSize, selectedColor]
  )

  // Images: use variant images if available, fallback to product images
  const displayImages = useMemo(() => {
    const variantImages = selectedVariant?.images?.length ? selectedVariant.images : []
    const productImages = product.images || []
    const all = [...new Set([...variantImages, ...productImages])]
    return all.length > 0 ? all : ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"]
  }, [selectedVariant, product.images])

  const price = product.basePrice + (selectedVariant?.priceAdjustment || 0)
  const inStock = (selectedVariant?.stock || 0) > 0
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  function handleColorChange(colorName: string) {
    setSelectedColor(colorName)
    setActiveImageIndex(0) // Reset to first image on color change
  }

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem({
      _id: product._id + "-" + selectedVariant.sku,
      name: product.name,
      slug: product.slug,
      images: displayImages,
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
    <div className="container pb-20 md:pb-12">
      <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative aspect-[3/4] bg-secondary overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={displayImages[activeImageIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src={displayImages[activeImageIndex]}
                  alt={`${product.name} - ${selectedColor}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
            </AnimatePresence>
            {/* Image counter */}
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
              {activeImageIndex + 1} / {displayImages.length}
            </div>
          </div>

          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden transition-all ${
                    activeImageIndex === i ? "ring-2 ring-foreground ring-offset-2" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5 md:sticky md:top-20 md:self-start">
          {/* Category & Name */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{product.category}</p>
            <h1 className="text-xl md:text-2xl font-medium mt-1 tracking-tight">{product.name}</h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avgRating) ? "fill-foreground/80 text-foreground/80" : "text-muted-foreground/20"}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({reviews.length})</span>
              </div>
            )}
          </div>

          {/* Price */}
          <p className="text-2xl font-medium tracking-tight">₹{price.toLocaleString()}</p>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2.5">
                Color: <span className="text-muted-foreground font-normal">{selectedColor}</span>
              </p>
              <div className="flex gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color.name)}
                    className={`h-9 w-9 rounded-full transition-all relative ${
                      selectedColor === color.name ? "ring-2 ring-foreground ring-offset-2 scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {/* Border for white/light colors */}
                    {(color.hex === "#FFFFFF" || color.hex === "#F5F5DC") && (
                      <span className="absolute inset-0 rounded-full border border-border" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-medium">
                  Size: <span className="text-muted-foreground font-normal">{selectedSize}</span>
                </p>
                <button className="text-[10px] text-muted-foreground underline underline-offset-2">Size Guide</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const variant = variants.find((v) => v.size === size && v.color.name === selectedColor)
                  const available = (variant?.stock || 0) > 0
                  return (
                    <button
                      key={size}
                      onClick={() => available && setSelectedSize(size)}
                      disabled={!available}
                      className={`h-10 min-w-[3rem] px-3 rounded-sm border text-xs font-medium transition-all ${
                        selectedSize === size
                          ? "border-foreground bg-foreground text-background"
                          : available
                          ? "border-border hover:border-foreground/50"
                          : "border-border/30 text-muted-foreground/30 cursor-not-allowed line-through"
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stock Status */}
          {selectedVariant && (
            <p className={`text-xs ${inStock ? "text-emerald-600" : "text-red-500"}`}>
              {inStock ? (selectedVariant.stock <= 5 ? `Only ${selectedVariant.stock} left — selling fast` : "In Stock") : "Out of Stock"}
            </p>
          )}

          {/* Add to Cart */}
          <div className="flex gap-3 pt-2">
            <button
              disabled={!inStock || added}
              onClick={handleAddToCart}
              className={`flex-1 h-12 flex items-center justify-center gap-2 text-xs font-medium tracking-wider uppercase transition-all ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-foreground text-background hover:opacity-90"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {added ? <><Check className="h-4 w-4" /> Added to Bag</> : <><ShoppingCart className="h-4 w-4" /> Add to Bag</>}
            </button>
            <button className="h-12 w-12 border flex items-center justify-center hover:bg-muted/50 transition-colors">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t">
            <div className="text-center">
              <Truck className="h-4 w-4 mx-auto text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[10px] text-muted-foreground mt-1.5">Free Shipping</p>
              <p className="text-[9px] text-muted-foreground/60">Above ₹999</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-4 w-4 mx-auto text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[10px] text-muted-foreground mt-1.5">Easy Returns</p>
              <p className="text-[9px] text-muted-foreground/60">30 days</p>
            </div>
            <div className="text-center">
              <Shield className="h-4 w-4 mx-auto text-muted-foreground" strokeWidth={1.5} />
              <p className="text-[10px] text-muted-foreground mt-1.5">Secure Payment</p>
              <p className="text-[9px] text-muted-foreground/60">SSL Encrypted</p>
            </div>
          </div>

          {/* Product Details */}
          <details className="border-t pt-4 group">
            <summary className="text-xs font-medium cursor-pointer flex items-center justify-between">
              Product Details
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p>Fabric: {selectedVariant?.fabric || "Premium Cotton"}</p>
              <p>Fit: <span className="capitalize">{selectedVariant?.fit || "Regular"}</span></p>
              <p>SKU: {selectedVariant?.sku || "—"}</p>
              <p>Care: Machine wash cold, tumble dry low</p>
              <p>Made in India</p>
            </div>
          </details>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16 md:mt-24 border-t pt-10">
          <h2 className="text-lg font-medium mb-6">Customer Reviews ({reviews.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((review: any) => (
              <div key={review._id} className="p-4 border rounded-sm">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-foreground/70 text-foreground/70" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-medium">{review.user?.name || "Customer"}</span>
                  {review.verifiedPurchase && (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">Verified</span>
                  )}
                </div>
                {review.comment && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-14 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium">₹{price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{selectedSize} / {selectedColor}</p>
          </div>
          <button
            disabled={!inStock || added}
            onClick={handleAddToCart}
            className="px-6 py-3 bg-foreground text-background text-xs font-medium tracking-wider uppercase disabled:opacity-40"
          >
            {added ? "Added ✓" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  )
}
