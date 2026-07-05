"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCartStore } from "@/store/cartStore"
import { useUIStore } from "@/store/uiStore"
import { buildCartItemFromVariant } from "@/lib/cart/buildCartItem"

interface VariantProduct {
  _id: string
  productId?: string
  name: string
  slug: string
  basePrice: number
  comparePrice?: number
  images: string[]
  variantColor?: { name: string; hex: string }
  variantImage?: string
  variantPrice?: number
  variantSku?: string
  variantId?: string
  availableSizes?: { size: string; stock: number }[]
}

interface QuickViewModalProps {
  product: VariantProduct | null
  /** Other color variants of the same base product, for in-modal color switching. */
  siblings?: VariantProduct[]
  onClose: () => void
  onSelectSibling?: (product: VariantProduct) => void
}

export function QuickViewModal({ product, siblings = [], onClose, onSelectSibling }: QuickViewModalProps) {
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useUIStore((s) => s.setCartOpen)
  const [added, setAdded] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [activeImg, setActiveImg] = useState(0)
  const [paused, setPaused] = useState(false)

  const isVariant = !!product?.variantColor
  const galleryImages = product?.images?.length ? product.images : product?.variantImage ? [product.variantImage] : []

  // Auto-rotate through the product's photos while the modal is open
  useEffect(() => {
    setActiveImg(0)
    if (paused || galleryImages.length <= 1) return
    const interval = setInterval(() => setActiveImg((i) => (i + 1) % galleryImages.length), 2500)
    return () => clearInterval(interval)
  }, [product?._id, paused, galleryImages.length])

  if (!product) return null

  const displayImage = galleryImages[activeImg] || product.variantImage || product.images?.[0] || "/placeholder-product.svg"
  const displayPrice = isVariant ? product.variantPrice : product.basePrice
  const sizes = product.availableSizes || []
  const activeSize = selectedSize || sizes.find((s) => s.stock > 0)?.size || sizes[0]?.size
  const activeSizeStock = sizes.find((s) => s.size === activeSize)?.stock ?? 1

  const linkParams = new URLSearchParams()
  if (isVariant && product.variantColor?.name) linkParams.set("color", product.variantColor.name)
  if (activeSize) linkParams.set("size", activeSize)
  const productHref = `/product/${product.slug}${linkParams.toString() ? `?${linkParams.toString()}` : ""}`

  function handleAdd() {
    if (!activeSize || activeSizeStock <= 0) return
    addItem(buildCartItemFromVariant({
      productId: product!.productId || product!._id,
      variantId: product!.variantId,
      name: product!.name,
      slug: product!.slug,
      image: product!.variantImage,
      fallbackImages: product!.images,
      price: product!.variantPrice || product!.basePrice,
      sku: product!.variantSku,
      size: activeSize,
      color: product!.variantColor?.name || "Default",
    }))
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onClose()
      setCartOpen(true)
    }, 700)
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[6%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[640px] max-h-[88vh] overflow-y-auto bg-background border border-border z-50"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 h-8 w-8 border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-2">
              <div
                className="relative aspect-[3/4] bg-card overflow-hidden"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <AnimatePresence mode="wait">
                  {displayImage && (
                    <motion.div
                      key={displayImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <Image src={displayImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 320px" className="object-cover" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {galleryImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`h-1.5 rounded-full transition-all ${i === activeImg ? "w-4 bg-[#c4956a]" : "w-1.5 bg-white/60"}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 md:p-6 space-y-4">
                <div>
                  <h2 className="text-base font-medium text-foreground">{product.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-semibold text-foreground">₹{displayPrice?.toLocaleString()}</p>
                    {product.comparePrice && product.comparePrice > (displayPrice || 0) && (
                      <p className="text-sm text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {siblings.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Color</p>
                    <div className="flex gap-2 flex-wrap">
                      {[product, ...siblings].map((sib) => (
                        <button
                          key={sib._id}
                          onClick={() => onSelectSibling?.(sib)}
                          title={sib.variantColor?.name}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            sib._id === product._id ? "border-[#c4956a]" : "border-border hover:border-[#c4956a]/50"
                          }`}
                          style={{ backgroundColor: sib.variantColor?.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {sizes.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Size</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {sizes.map(({ size, stock }) => {
                        const outOfStock = stock <= 0
                        return (
                          <button
                            key={size}
                            onClick={() => !outOfStock && setSelectedSize(size)}
                            disabled={outOfStock}
                            title={outOfStock ? "Out of stock" : stock <= 3 ? `Only ${stock} left` : undefined}
                            className={`h-9 min-w-[2.4rem] px-2.5 text-xs font-semibold border transition-all ${
                              outOfStock
                                ? "border-border text-muted-foreground/40 line-through cursor-not-allowed"
                                : activeSize === size
                                ? "border-[#c4956a] bg-[#c4956a] text-white"
                                : "border-border text-foreground hover:border-[#c4956a]/60"
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAdd}
                  disabled={added || activeSizeStock <= 0}
                  className={`w-full py-3 text-xs font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                    added ? "bg-emerald-600 text-white" : "bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] hover:opacity-90"
                  }`}
                >
                  {added ? <><Check className="h-4 w-4" /> Added to Bag</> : activeSizeStock <= 0 ? "Out of Stock" : <><ShoppingCart className="h-4 w-4" /> Add to Bag</>}
                </button>

                <Link href={productHref} onClick={onClose} className="block text-center text-xs text-[#c4956a] hover:underline">
                  View full details
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
