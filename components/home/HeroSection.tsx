"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingCart, Sparkles, Wind, Ruler, CheckCircle } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4a574]/15 via-[#f5e6d3] to-[#e8d5c0] dark:from-[#1a1209] dark:via-[#0f0a06] dark:to-[#1a1209]" />
      
      {/* Heritage pattern */}
      <div className="absolute inset-0 heritage-pattern opacity-40 dark:opacity-20" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#c4956a]/30"
            style={{ left: `${20 + i * 15}%`, top: `${30 + i * 10}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative container z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8b6914] dark:text-[#c4956a] font-medium">New Arrival — Live 7 July</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1] tracking-tight"
            >
              Premium Linen<br />
              <span className="font-semibold text-[#c4956a]">Full Sleeve</span><br />
              <span className="font-light">Shirts</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm"
            >
              Crafted in Jodhpur with the finest linen. Breathable, soft, and designed for the modern man who values quiet luxury.
            </motion.p>

            {/* USP badges - using lucide icons instead of emojis */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 grid grid-cols-2 gap-3 max-w-sm"
            >
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
            </motion.div>

            {/* Price + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-4 md:gap-6"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#c4956a]">Starting at</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground">₹799</p>
              </div>
              <Link
                href="/shirts"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs md:text-sm font-medium tracking-wider hover:opacity-90 transition-all duration-300"
              >
                SHOP NOW
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/shirts/linen"
                className="inline-flex items-center gap-2 px-5 py-3.5 border border-[#c4956a]/40 text-foreground text-xs font-medium tracking-wider hover:bg-[#c4956a]/5 transition-all"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                LINEN EDIT
              </Link>
            </motion.div>

            {/* Color swatches */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="mt-6 flex items-center gap-3"
            >
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Shades:</span>
              <div className="flex gap-2">
                {[
                  { color: "#87CEEB", name: "Sky Blue" },
                  { color: "#3d5a80", name: "Royal Indigo" },
                  { color: "#d4a574", name: "Desert Sand" },
                  { color: "#6b7c5e", name: "Sage" },
                  { color: "#f5e6d3", name: "Ivory" },
                ].map((swatch) => (
                  <div
                    key={swatch.color}
                    className="w-5 h-5 rounded-full border-2 border-background shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: swatch.color }}
                    title={swatch.name}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Product Image (skyblue.png) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Glow behind product */}
              <div className="absolute -inset-12 bg-gradient-to-t from-[#c4956a]/15 via-[#87CEEB]/10 to-transparent rounded-full blur-3xl" />
              
              {/* Floating shirt animation */}
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-[280px] h-[360px] md:w-[350px] md:h-[440px] lg:w-[400px] lg:h-[500px]"
              >
                <Image
                  src="/skyblue.png"
                  alt="VCHUKI Premium Sky Blue Linen Shirt - Front View"
                  fill
                  className="object-contain drop-shadow-2xl"
                  sizes="400px"
                  priority
                />
              </motion.div>

              {/* Corner motifs */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-[#c4956a]/40" />
              <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-[#c4956a]/40" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-[#c4956a]/40" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-[#c4956a]/40" />

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 top-16 px-3 py-2 bg-background/90 backdrop-blur-sm border border-[#c4956a]/20 shadow-lg"
              >
                <p className="text-[9px] uppercase tracking-wider text-[#c4956a] font-medium">100% Linen</p>
                <p className="text-[10px] text-foreground font-medium mt-0.5">Premium Fabric</p>
              </motion.div>

              {/* Size badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -left-4 bottom-24 px-3 py-2 bg-background/90 backdrop-blur-sm border border-[#c4956a]/20 shadow-lg"
              >
                <p className="text-[9px] uppercase tracking-wider text-[#c4956a] font-medium">Available</p>
                <p className="text-[10px] text-foreground font-medium mt-0.5">S · M · L · XL · XXL</p>
              </motion.div>
            </div>
          </motion.div>
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
