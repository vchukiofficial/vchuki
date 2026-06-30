"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Wind, Ruler, CheckCircle } from "lucide-react"

interface HeroCategory {
  label: string
  slug: string
  tagline: string
  basePrice: number
  comparePrice: number
}

const CATEGORIES: HeroCategory[] = [
  { label: "Half Sleeve Shirts", slug: "linen-half-sleeve", tagline: "Summer Ease", basePrice: 799, comparePrice: 1499 },
  { label: "Full Sleeve Shirts", slug: "linen-full-sleeve", tagline: "Timeless Luxury", basePrice: 899, comparePrice: 1699 },
  { label: "Half Kurta", slug: "kurta-half-sleeve", tagline: "Modern Ethnic", basePrice: 999, comparePrice: 1899 },
  { label: "Full Kurta", slug: "kurta-full-sleeve", tagline: "Heritage Craft", basePrice: 1099, comparePrice: 1999 },
]

export function HeroSection() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [paused, setPaused] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Auto-rotate categories
  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setActiveCategory((prev) => (prev + 1) % CATEGORIES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [paused])

  // Lazy load video
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.src = "/VCHUKI_–_QUIET_LUXURY_GRWM_REE (2).mp4"
          videoRef.current.load()
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (videoRef.current) observer.observe(videoRef.current)
    return () => observer.disconnect()
  }, [])

  const current = CATEGORIES[activeCategory]

  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Video Background - Full Bleed */}
      <div className="absolute inset-0 z-0">
        {/* Poster/Fallback gradient while video loads */}
        <div className={`absolute inset-0 bg-gradient-to-br from-[#1a1209] via-[#2a1f14] to-[#0f0a06] transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`} />
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          poster=""
          className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Overlay - Strong left gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      {/* Content - Left Aligned, No Product Image Overlap */}
      <div className="relative container z-10 py-16 md:py-24">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#c4956a]/30 bg-[#c4956a]/5 backdrop-blur-sm mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c4956a] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#c4956a] font-medium">Handcrafted in Jodhpur</span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] tracking-tight">
              Premium Linen
              <br />
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
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-5 text-base md:text-lg text-white/60 leading-relaxed max-w-md"
          >
            Breathable. Elegant. Crafted for the modern man who values quiet luxury and timeless comfort.
          </motion.p>

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.slug}
                onClick={() => { setActiveCategory(idx); setPaused(true); setTimeout(() => setPaused(false), 10000) }}
                className={`px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] font-medium border transition-all duration-300 backdrop-blur-sm ${
                  activeCategory === idx
                    ? "border-[#c4956a] bg-[#c4956a]/15 text-[#c4956a]"
                    : "border-white/15 text-white/50 hover:border-[#c4956a]/40 hover:text-white/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </motion.div>

          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-1.5">
            {CATEGORIES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveCategory(idx); setPaused(true); setTimeout(() => setPaused(false), 10000) }}
                className="relative h-[3px] overflow-hidden transition-all duration-300 rounded-full"
                style={{ width: activeCategory === idx ? 32 : 12 }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full" />
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

          {/* USP Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
          >
            {[
              { icon: Sparkles, label: "Premium Linen Blend" },
              { icon: Wind, label: "Breathable Comfort" },
              { icon: Ruler, label: "Modern Fit" },
              { icon: CheckCircle, label: "47 Quality Checks" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="h-3.5 w-3.5 text-[#c4956a]" />
                <span className="text-[10px] uppercase tracking-wide text-white/60 font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Price + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-6"
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#c4956a] mb-1">Starting at</p>
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={current.basePrice}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-3xl md:text-4xl font-bold text-white"
                  >
                    ₹{current.basePrice.toLocaleString()}
                  </motion.p>
                </AnimatePresence>
                {current.comparePrice > current.basePrice && (
                  <>
                    <p className="text-base text-white/30 line-through">₹{current.comparePrice.toLocaleString()}</p>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 border border-emerald-400/20">
                      {Math.round(((current.comparePrice - current.basePrice) / current.comparePrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            <Link
              href={`/shirts/${current.slug}`}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#c4956a] text-[#1a1209] text-sm font-bold tracking-wider uppercase hover:bg-[#d4a574] transition-all duration-300 shadow-lg shadow-[#c4956a]/20"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/shirts"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/60 hover:text-white border-b border-white/20 hover:border-white/60 pb-0.5 transition-all"
            >
              View All Collections
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-10 flex items-center gap-4 text-[10px] text-white/30"
          >
            <span>Free Shipping above ₹1,599</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>14-Day Easy Returns</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>COD Available</span>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center p-1"
        >
          <div className="w-1 h-2 bg-[#c4956a]/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
