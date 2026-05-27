"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Wind, Ruler, CheckCircle, ZoomIn, ZoomOut } from "lucide-react"

interface VariantColor {
  name: string
  hex: string
  image: string
  price: number
}

interface HeroCategory {
  label: string
  slug: string
  tagline: string
  basePrice: number
  colors: VariantColor[]
}

// Fallback static data (used if API returns nothing)
const FALLBACK_CATEGORIES: HeroCategory[] = [
  {
    label: "Half Sleeve Shirts",
    slug: "linen-half-sleeve",
    tagline: "Summer Ease",
    basePrice: 799,
    colors: [
      { name: "Beige", hex: "#d4a574", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png", price: 799 },
      { name: "Sky Blue", hex: "#87CEEB", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/sky-blue.png", price: 799 },
      { name: "White", hex: "#f5f5f5", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/white.png", price: 799 },
    ],
  },
  {
    label: "Full Sleeve Shirts",
    slug: "linen",
    tagline: "Timeless Luxury",
    basePrice: 899,
    colors: [
      { name: "Sky Blue", hex: "#87CEEB", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/skyblue.png", price: 899 },
      { name: "Olive Green", hex: "#6b7c5e", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/olive-green.png", price: 899 },
      { name: "Yellow", hex: "#e6c84c", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/yellow.png", price: 899 },
    ],
  },
  {
    label: "Half Kurta",
    slug: "kurta-half-sleeve",
    tagline: "Modern Ethnic",
    basePrice: 999,
    colors: [
      { name: "Golden Dune", hex: "#c4956a", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/shortsleevgoldenduneshortkurta.png", price: 999 },
      { name: "White", hex: "#f5f5f5", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/white.png", price: 999 },
    ],
  },
  {
    label: "Full Kurta",
    slug: "kurta-full-sleeve",
    tagline: "Heritage Craft",
    basePrice: 1099,
    colors: [
      { name: "Olive Green", hex: "#6b7c5e", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/fullsleevolivegreenshortshirts.png", price: 1099 },
      { name: "Beige", hex: "#d4a574", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png", price: 1099 },
    ],
  },
]

const CATEGORY_SLUGS = ["linen-half-sleeve", "linen", "kurta-half-sleeve", "kurta-full-sleeve"]
const CATEGORY_LABELS: Record<string, { label: string; tagline: string }> = {
  "linen-half-sleeve": { label: "Half Sleeve Shirts", tagline: "Summer Ease" },
  "linen": { label: "Full Sleeve Shirts", tagline: "Timeless Luxury" },
  "kurta-half-sleeve": { label: "Half Kurta", tagline: "Modern Ethnic" },
  "kurta-full-sleeve": { label: "Full Kurta", tagline: "Heritage Craft" },
}

export function HeroSection() {
  const [categories, setCategories] = useState<HeroCategory[]>(FALLBACK_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState(0)
  const [activeColor, setActiveColor] = useState<Record<number, number>>({})
  const [zoom, setZoom] = useState(1)
  const [, setLoaded] = useState(false)

  // Fetch real products with in-stock variants
  useEffect(() => {
    async function fetchHeroData() {
      try {
        const results: HeroCategory[] = []

        for (const slug of CATEGORY_SLUGS) {
          const res = await fetch(`/api/products?category=${slug}&limit=5`)
          if (!res.ok) continue
          const data = await res.json()
          const products = data.products || []

          // For each product, fetch variants and filter in-stock only
          const colorsMap: Map<string, VariantColor> = new Map()
          let lowestPrice = Infinity

          for (const product of products) {
            const varRes = await fetch(`/api/products/${product._id}/variants`)
            if (!varRes.ok) continue
            const varData = await varRes.json()
            const variants = varData.variants || varData || []

            for (const v of variants) {
              if (v.stock <= 0) continue // Skip out of stock
              const colorKey = v.color?.name || "Default"
              const price = product.basePrice + (v.priceAdjustment || 0)
              if (price < lowestPrice) lowestPrice = price

              if (!colorsMap.has(colorKey)) {
                colorsMap.set(colorKey, {
                  name: v.color?.name || "Default",
                  hex: v.color?.hex || "#c4956a",
                  image: v.images?.[0] || product.images?.[0] || "",
                  price,
                })
              }
            }
          }

          if (colorsMap.size > 0) {
            const meta = CATEGORY_LABELS[slug] || { label: slug, tagline: "" }
            results.push({
              label: meta.label,
              slug,
              tagline: meta.tagline,
              basePrice: lowestPrice === Infinity ? 799 : lowestPrice,
              colors: Array.from(colorsMap.values()),
            })
          }
        }

        if (results.length > 0) {
          // Merge API data into fallback — keep same number of categories to avoid layout shift
          setCategories((prev) => {
            const merged = prev.map((fallback) => {
              const apiMatch = results.find((r) => r.slug === fallback.slug)
              return apiMatch || fallback
            })
            return merged
          })
        }
        setLoaded(true)
      } catch {
        setLoaded(true)
      }
    }

    fetchHeroData()
  }, [])

  const current = categories[activeCategory]
  const colorIdx = activeColor[activeCategory] || 0
  const currentImage = current?.colors[colorIdx]?.image || current?.colors[0]?.image || ""
  const currentPrice = current?.colors[colorIdx]?.price || current?.basePrice || 799

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.3, 2.5)), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.3, 1)), [])

  // Reset zoom when category or color changes
  useEffect(() => { setZoom(1) }, [activeCategory, colorIdx])

  if (!current) return null

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4a574]/15 via-[#f5e6d3] to-[#e8d5c0] dark:from-[#1a1209] dark:via-[#0f0a06] dark:to-[#1a1209]" />
      <div className="absolute inset-0 heritage-pattern opacity-40 dark:opacity-20" />

      <div className="relative container z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left - Text & Category Selector */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-lg"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#c4956a]/30 bg-[#c4956a]/5 dark:bg-[#c4956a]/10 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4956a] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8b6914] dark:text-[#c4956a] font-medium">New Arrival — Live Now</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1] tracking-tight">
              Premium Linen<br />
              <AnimatePresence mode="wait">
                <motion.span
                  key={current.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="font-semibold text-[#c4956a] inline-block"
                >
                  {current.label}
                </motion.span>
              </AnimatePresence>
            </h1>

            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm">
              Crafted in Jodhpur with the finest linen. Breathable, soft, and designed for the modern man who values quiet luxury.
            </p>

            {/* Category Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat, idx) => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(idx)}
                  className={`px-3 py-2 text-[10px] uppercase tracking-wider font-medium border transition-all duration-300 ${
                    activeCategory === idx
                      ? "border-[#c4956a] bg-[#c4956a]/10 text-[#c4956a]"
                      : "border-border text-muted-foreground hover:border-[#c4956a]/40 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Color Swatches for active category */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Colors:</span>
              <div className="flex gap-2">
                {current.colors.map((color, idx) => (
                  <button
                    key={`${current.slug}-${color.name}-${idx}`}
                    onClick={() => setActiveColor((p) => ({ ...p, [activeCategory]: idx }))}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-300 hover:scale-125 ${
                      colorIdx === idx ? "border-[#c4956a] scale-110 shadow-lg ring-2 ring-[#c4956a]/20" : "border-border"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
              <span className="text-[11px] text-foreground font-medium">{current.colors[colorIdx]?.name}</span>
            </div>

            {/* USP badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm">
              {[
                { icon: Sparkles, label: "Premium Linen Fabric" },
                { icon: Wind, label: "Soft & Breathable" },
                { icon: Ruler, label: "Perfect Modern Fit" },
                { icon: CheckCircle, label: "Lightweight Comfort" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-[#c4956a]" />
                  <span className="text-[10px] md:text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Price + CTA — dynamic price per selected variant */}
            <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#c4956a]">Starting at</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentPrice}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl md:text-4xl font-bold text-foreground"
                  >
                    ₹{currentPrice.toLocaleString()}
                  </motion.p>
                </AnimatePresence>
              </div>
              <Link
                href={`/shirts/${current.slug}`}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs md:text-sm font-medium tracking-wider hover:opacity-90 transition-all duration-300"
              >
                SHOP {current.label.toUpperCase()}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right - Product Image with Zoom & Flip Animation */}
          <div className="relative flex items-center justify-center min-h-[450px] md:min-h-[580px]">
            {/* Glow */}
            <div className="absolute -inset-16 bg-gradient-to-t from-[#c4956a]/15 via-[#87CEEB]/10 to-transparent rounded-full blur-3xl" />

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={handleZoomIn}
                className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:border-[#c4956a]/50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5 text-foreground" />
              </button>
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:border-[#c4956a]/50 transition-colors disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>

            {/* Main product with flip animation — LARGER SIZE */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${colorIdx}`}
                initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                exit={{ rotateY: -90, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[320px] h-[420px] md:w-[400px] md:h-[520px] lg:w-[450px] lg:h-[580px]"
                style={{ perspective: "1200px" }}
              >
                {/* Floating disabled when zoomed, scrollable container when zoomed */}
                <motion.div
                  animate={zoom > 1 ? {} : { y: [-6, 6, -6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className={`relative w-full h-full ${zoom > 1 ? "overflow-auto cursor-grab active:cursor-grabbing" : "overflow-hidden cursor-zoom-in"}`}
                  onClick={zoom <= 1 ? handleZoomIn : undefined}
                >
                  <motion.div
                    animate={{ scale: zoom }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative w-full h-full origin-center"
                    style={{ minHeight: zoom > 1 ? `${580 * zoom}px` : undefined }}
                  >
                    {currentImage && (
                      <Image
                        src={currentImage}
                        alt={`VCHUKI ${current.label} - ${current.colors[colorIdx]?.name}`}
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="(max-width: 768px) 320px, 450px"
                        priority
                      />
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Orbiting category thumbnails — show selected variant image for each */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              {categories.map((cat, idx) => {
                if (idx === activeCategory) return null
                const offset = ((idx - activeCategory + categories.length) % categories.length)
                const angle = offset * (360 / (categories.length - 1)) + 30
                const radius = 220
                const x = Math.cos((angle * Math.PI) / 180) * radius
                const y = Math.sin((angle * Math.PI) / 180) * radius * 0.55

                // Show the currently selected color for that category, or first color
                const catColorIdx = activeColor[idx] || 0
                const thumbImage = cat.colors[catColorIdx]?.image || cat.colors[0]?.image

                return (
                  <motion.div
                    key={cat.slug}
                    className="absolute left-1/2 top-1/2 pointer-events-auto cursor-pointer"
                    style={{ x: x - 28, y: y - 28 }}
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    onClick={() => setActiveCategory(idx)}
                    whileHover={{ scale: 1.4 }}
                  >
                    <motion.div
                      animate={{ rotate: [360, 0] }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#c4956a]/30 bg-background/90 backdrop-blur-sm overflow-hidden shadow-xl hover:border-[#c4956a] transition-colors"
                    >
                      {thumbImage && (
                        <Image
                          src={thumbImage}
                          alt={cat.label}
                          width={64}
                          height={64}
                          className="object-contain p-1.5 w-full h-full"
                        />
                      )}
                    </motion.div>
                    {/* Label below thumbnail */}
                    <motion.p
                      animate={{ rotate: [360, 0] }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="text-[8px] text-center text-muted-foreground mt-1 font-medium uppercase tracking-wider whitespace-nowrap"
                    >
                      {cat.label}
                    </motion.p>
                  </motion.div>
                )
              })}
            </div>

            {/* Corner motifs */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#c4956a]/40" />
            <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[#c4956a]/40" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[#c4956a]/40" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#c4956a]/40" />

            {/* Category + Color badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${current.slug}-${colorIdx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute -right-2 md:right-4 top-16 px-3 py-2 bg-background/90 backdrop-blur-sm border border-[#c4956a]/20 shadow-lg"
              >
                <p className="text-[9px] uppercase tracking-wider text-[#c4956a] font-medium">{current.tagline}</p>
                <p className="text-[11px] text-foreground font-medium mt-0.5">{current.colors[colorIdx]?.name}</p>
              </motion.div>
            </AnimatePresence>

            {/* Size badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -left-2 md:left-4 bottom-24 px-3 py-2 bg-background/90 backdrop-blur-sm border border-[#c4956a]/20 shadow-lg"
            >
              <p className="text-[9px] uppercase tracking-wider text-[#c4956a] font-medium">In Stock</p>
              <p className="text-[10px] text-foreground font-medium mt-0.5">S · M · L · XL · XXL</p>
            </motion.div>

            {/* Zoom level indicator */}
            {zoom > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-4 right-4 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border text-[9px] text-muted-foreground"
              >
                {Math.round(zoom * 100)}%
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-5 h-8 border border-[#c4956a]/40 rounded-full flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 bg-[#c4956a]/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
