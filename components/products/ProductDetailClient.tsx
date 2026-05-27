"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useCartStore } from "@/store/cartStore"
import { useWishlistStore } from "@/store/wishlistStore"
import { Star, ShoppingCart, Heart, Check, Truck, RotateCcw, Shield, MessageCircle, Camera } from "lucide-react"
import type { Product, ProductVariant, Review } from "@/types"
import { motion, AnimatePresence } from "framer-motion"
import { SizeGuide } from "./SizeGuide"
import { VirtualTryOn } from "./VirtualTryOn"
import { ComboOfferWidget } from "./ComboOfferWidget"
import { StealDeals } from "./StealDeals"

interface Props {
  product: Product
  variants: ProductVariant[]
  reviews: Review[]
}

export default function ProductDetailClient({ product, variants, reviews }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const searchParams = useSearchParams()
  const { items: wishlistItems, toggle: toggleWishlist, load: loadWishlist } = useWishlistStore()

  useEffect(() => { loadWishlist() }, [loadWishlist])

  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants])
  const colors = useMemo(() => [...new Map(variants.map((v) => [v.color.name, v.color])).values()], [variants])

  // Pre-select color and size from URL params (passed from listing page)
  const urlColor = searchParams.get("color")
  const urlSize = searchParams.get("size")

  const initialColor = (urlColor && colors.find((c) => c.name === urlColor)) ? urlColor : colors[0]?.name || ""
  const initialSize = (urlSize && sizes.includes(urlSize)) ? urlSize : sizes[0] || ""

  const [selectedSize, setSelectedSize] = useState(initialSize)
  const [selectedColor, setSelectedColor] = useState(initialColor)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [added, setAdded] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [tryOnOpen, setTryOnOpen] = useState(false)

  const selectedVariant = useMemo(
    () => variants.find((v) => v.size === selectedSize && v.color.name === selectedColor),
    [variants, selectedSize, selectedColor]
  )

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
    setActiveImageIndex(0)
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
          <div className="relative aspect-square md:aspect-[4/5] bg-card overflow-hidden border border-border">
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
            <div className="absolute bottom-3 right-3 bg-[#2a1f14]/70 backdrop-blur-sm text-[#f5e6d3] text-[10px] px-2 py-1">
              {activeImageIndex + 1} / {displayImages.length}
            </div>
            {/* Corner accents */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-[#c4956a]/30" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-[#c4956a]/30" />
          </div>

          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden border transition-all ${
                    activeImageIndex === i ? "border-[#c4956a] ring-1 ring-[#c4956a]/30" : "border-border opacity-60 hover:opacity-100"
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
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c4956a] font-medium">{product.category}</p>
            <h1 className="text-xl md:text-2xl font-medium mt-1 tracking-tight text-foreground">{product.name}</h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(avgRating) ? "fill-[#c4956a] text-[#c4956a]" : "text-muted-foreground/20"}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          <p className="text-2xl font-semibold tracking-tight text-foreground">₹{price.toLocaleString()}</p>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Color Selection */}
          {colors.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2.5 text-foreground">
                Color: <span className="text-[#c4956a] font-normal">{selectedColor}</span>
              </p>
              <div className="flex gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color.name)}
                    className={`h-9 w-9 rounded-full transition-all relative ${
                      selectedColor === color.name ? "ring-2 ring-[#c4956a] ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {(color.hex === "#FFFFFF" || color.hex === "#F5E6D3" || color.hex === "#f5e6d3") && (
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
                <p className="text-xs font-medium text-foreground">
                  Size: <span className="text-muted-foreground font-normal">{selectedSize}</span>
                </p>
                <button onClick={() => setSizeGuideOpen(true)} className="text-[10px] text-[#c4956a] underline underline-offset-2">Size Guide</button>
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
                      className={`h-10 min-w-[3rem] px-3 border text-xs font-medium transition-all ${
                        selectedSize === size
                          ? "border-[#c4956a] bg-[#c4956a] text-white"
                          : available
                          ? "border-border text-foreground hover:border-[#c4956a]/50"
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

          {/* Stock */}
          {selectedVariant && (
            <p className={`text-xs font-medium ${inStock ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {inStock ? (selectedVariant.stock <= 5 ? `Only ${selectedVariant.stock} left — selling fast` : "✓ In Stock") : "Out of Stock"}
            </p>
          )}

          {/* Combo Offers */}
          <ComboOfferWidget category={product.category} productName={product.name} />

          {/* Steal Deals */}
          <StealDeals currentProductId={product._id} currentCategory={product.category} />

          {/* Add to Cart */}
          <div className="flex gap-3 pt-2">
            <button
              disabled={!inStock || added}
              onClick={handleAddToCart}
              className={`flex-1 h-12 flex items-center justify-center gap-2 text-xs font-medium tracking-wider uppercase transition-all ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] hover:opacity-90"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {added ? <><Check className="h-4 w-4" /> Added to Bag</> : <><ShoppingCart className="h-4 w-4" /> Add to Bag</>}
            </button>
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`h-12 w-12 border flex items-center justify-center transition-colors ${
                wishlistItems.includes(product._id)
                  ? "border-red-500/50 bg-red-500/5"
                  : "border-border hover:border-[#c4956a]/50"
              }`}
            >
              <Heart className={`h-4 w-4 ${
                wishlistItems.includes(product._id)
                  ? "fill-red-500 text-red-500"
                  : "text-foreground/70"
              }`} />
            </button>
          </div>

          {/* WhatsApp Styling Help */}
          <div className="flex gap-2">
            <button
              onClick={() => setTryOnOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4956a]/30 bg-[#c4956a]/5 text-[#c4956a] text-xs font-medium hover:bg-[#c4956a]/10 transition-colors"
            >
              <Camera className="h-4 w-4" />
              Virtual Try-On
            </button>
            <a
              href="https://wa.me/919876543210?text=Hi! I need styling help with the product"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-500/10 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Help
            </a>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <Truck className="h-4 w-4 mx-auto text-[#c4956a]" strokeWidth={1.5} />
              <p className="text-[10px] text-foreground mt-1.5 font-medium">Free Shipping</p>
              <p className="text-[9px] text-muted-foreground">Above ₹999</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-4 w-4 mx-auto text-[#c4956a]" strokeWidth={1.5} />
              <p className="text-[10px] text-foreground mt-1.5 font-medium">Easy Returns</p>
              <p className="text-[9px] text-muted-foreground">14 days</p>
            </div>
            <div className="text-center">
              <Shield className="h-4 w-4 mx-auto text-[#c4956a]" strokeWidth={1.5} />
              <p className="text-[10px] text-foreground mt-1.5 font-medium">Secure Payment</p>
              <p className="text-[9px] text-muted-foreground">SSL Encrypted</p>
            </div>
          </div>

          {/* Product Details */}
          <details className="border-t border-border pt-4 group">
            <summary className="text-xs font-medium cursor-pointer flex items-center justify-between text-foreground">
              Product Details
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p>Fabric: {selectedVariant?.fabric || "Premium Linen"}</p>
              <p>Fit: <span className="capitalize">{selectedVariant?.fit || "Regular"}</span></p>
              <p>SKU: {selectedVariant?.sku || "—"}</p>
              <p>Care: Machine wash cold, tumble dry low</p>
              <p>Made in India — Jodhpur, Rajasthan</p>
            </div>
          </details>

          {/* Fabric Story */}
          <details className="border-t border-border pt-4 group">
            <summary className="text-xs font-medium cursor-pointer flex items-center justify-between text-foreground">
              Fabric Story
              <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
              <p>Each VCHUKI shirt is crafted from premium linen sourced from the finest mills. The fabric undergoes 47 quality checks before it reaches you — ensuring breathability, softness, and a luxurious drape that gets better with every wash.</p>
            </div>
          </details>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-16 md:mt-24 border-t border-border pt-10">
          <h2 className="text-lg font-medium mb-6 text-foreground">Customer Reviews ({reviews.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((review: any) => (
              <div key={review._id} className="p-4 border border-border hover:border-[#c4956a]/20 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-[#c4956a] text-[#c4956a]" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-foreground">{review.user?.name || "Customer"}</span>
                  {review.verifiedPurchase && (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5">Verified</span>
                  )}
                </div>
                {review.comment && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-14 left-0 right-0 z-40 md:hidden bg-background/98 backdrop-blur-md border-t border-border p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">₹{price.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">{selectedSize} / {selectedColor}</p>
          </div>
          <button
            disabled={!inStock || added}
            onClick={handleAddToCart}
            className={`px-6 py-3 text-xs font-medium tracking-wider uppercase disabled:opacity-40 transition-all ${
              added ? "bg-emerald-600 text-white" : "bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14]"
            }`}
          >
            {added ? "Added ✓" : "Add to Bag"}
          </button>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuide isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Virtual Try-On */}
      <VirtualTryOn
        isOpen={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        shirtImage={displayImages[0]}
        productName={`${product.name} — ${selectedColor}`}
      />
    </div>
  )
}
