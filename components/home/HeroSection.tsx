"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, Wind, Ruler, CheckCircle } from "lucide-react"

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
  comparePrice: number
  colors: VariantColor[]
}

// Fallback static data (used if API returns nothing)
const FALLBACK_CATEGORIES: HeroCategory[] = [
  {
    label: "Half Sleeve Shirts",
    slug: "linen-half-sleeve",
    tagline: "Summer Ease",
    basePrice: 799,
    comparePrice: 1499,
    colors: [
      { name: "Beige", hex: "#d4a574", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png", price: 799 },
      { name: "Sky Blue", hex: "#87CEEB", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/sky-blue.png", price: 799 },
      { name: "White", hex: "#f5f5f5", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/white.png", price: 799 },
    ],
  },
  {
    label: "Full Sleeve Shirts",
    slug: "linen-full-sleeve",
    tagline: "Timeless Luxury",
    basePrice: 899,
    comparePrice: 1699,
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
    comparePrice: 1899,
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
    comparePrice: 1999,
    colors: [
      { name: "Olive Green", hex: "#6b7c5e", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/fullsleevolivegreenshortshirts.png", price: 1099 },
      { name: "Beige", hex: "#d4a574", image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png", price: 1099 },
    ],
  },
]

const CATEGORY_SLUGS = ["linen-half-sleeve", "linen-full-sleeve", "kurta-half-sleeve", "kurta-full-sleeve"]
const CATEGORY_LABELS: Record<string, { label: string; tagline: string }> = {
  "linen-half-sleeve": { label: "Half Sleeve Shirts", tagline: "Summer Ease" },
  "linen-full-sleeve": { label: "Full Sleeve Shirts", tagline: "Timeless Luxury" },
  "kurta-half-sleeve": { label: "Half Kurta", tagline: "Modern Ethnic" },
  "kurta-full-sleeve": { label: "Full Kurta", tagline: "Heritage Craft" },
}

export function HeroSection() {
  const [categories, setCategories] = useState<HeroCategory[]>(FALLBACK_CATEGORIES)
  const [activeCategory, setActiveCategory] = useState(0)
  const [activeColor, setActiveColor] = useState<Record<number, number>>({})
  const [, setLoaded] = useState(false)
  const [paused, setPaused] = useState(false)

  // Auto-rotate categories every 5 seconds
  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % categories.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [categories.length, paused])

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
            const productComparePrice = products[0]?.comparePrice || 0
            results.push({
              label: meta.label,
              slug,
              tagline: meta.tagline,
              basePrice: lowestPrice === Infinity ? 799 : lowestPrice,
              comparePrice: productComparePrice,
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
  const currentPrice = current?.colors[colorIdx]?.price || current?.basePrice || 799
  const currentComparePrice = current?.comparePrice || 0
  const currentImage = current?.colors[colorIdx]?.image || current?.colors[0]?.image || ""



  if (!current) return null

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/VCHUKI_–_QUIET_LUXURY_GRWM_REE (2).mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 dark:from-black/80 dark:via-black/60 dark:to-black/40" />
      </div>

      <div className="relative container z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left - Text */}
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

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-[1.1] tracking-tight">
              Premium Linen Blend<br />
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

            <p className="mt-4 text-sm md:text-base text-white/70 leading-relaxed max-w-sm">
              Crafted in Jodhpur with the finest linen. Breathable, soft, and designed for the modern man who values quiet luxury.
            </p>

            {/* Category Tabs */}
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.map((cat, idx) => (
                <button
                  key={cat.slug}
                  onClick={() => { setActiveCategory(idx); setPaused(true); setTimeout(() => setPaused(false), 10000) }}
                  className={`px-3 py-2 text-[10px] uppercase tracking-wider font-medium border transition-all duration-300 ${
                    activeCategory === idx
                      ? "border-[#c4956a] bg-[#c4956a]/10 text-[#c4956a]"
                      : "border-white/20 text-white/60 hover:border-[#c4956a]/40 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Slide indicators / progress dots */}
            <div className="mt-3 flex items-center gap-1.5">
              {categories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveCategory(idx); setPaused(true); setTimeout(() => setPaused(false), 10000) }}
                  className="relative h-1 overflow-hidden transition-all duration-300"
                  style={{ width: activeCategory === idx ? 24 : 8 }}
                >
                  <div className="absolute inset-0 bg-border rounded-full" />
                  {activeCategory === idx && (
                    <motion.div
                      className="absolute inset-0 bg-[#c4956a] rounded-full origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 5, ease: "linear" }}
                      key={`progress-${activeCategory}`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Color Swatches for active category */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-[10px] text-white/60 uppercase tracking-wider">Colors:</span>
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
              <span className="text-[11px] text-white font-medium">{current.colors[colorIdx]?.name}</span>
            </div>

            {/* USP badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm">
              {[
                { icon: Sparkles, label: "Premium Linen Blend" },
                { icon: Wind, label: "Soft & Breathable" },
                { icon: Ruler, label: "Perfect Modern Fit" },
                { icon: CheckCircle, label: "Lightweight Comfort" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-[#c4956a]" />
                  <span className="text-[10px] md:text-[11px] uppercase tracking-wide text-white/70 font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-4 md:gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#c4956a]">Starting at</p>
                <div className="flex items-center gap-3">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentPrice}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl md:text-4xl font-bold text-white"
                    >
                      ₹{currentPrice.toLocaleString()}
                    </motion.p>
                  </AnimatePresence>
                  {currentComparePrice > currentPrice && (
                    <>
                      <p className="text-lg text-white/40 line-through">₹{currentComparePrice.toLocaleString()}</p>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5">
                        {Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
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

          {/* Right - Product Image */}
          <div className="relative hidden lg:flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${colorIdx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-[350px] h-[450px] md:w-[400px] md:h-[520px]"
              >
                <motion.div
                  animate={{ y: [-6, 6, -6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  {currentImage && (
                    <Image
                      src={currentImage}
                      alt={`VCHUKI ${current.label} - ${current.colors[colorIdx]?.name}`}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="400px"
                      priority
                    />
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
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
