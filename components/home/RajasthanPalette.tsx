"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const SHADES = [
  {
    name: "Desert Sand",
    hex: "#DCCEB8",
    image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/beige.png",
    mood: "Elegant. Timeless. Minimal.",
    story: "Inspired by warm sandstone palaces of Rajasthan",
    visual: "Golden desert sunlight, palace walls, warm beige atmosphere",
    bg: "from-[#DCCEB8]/20 via-[#f5e6d3]/10 to-[#2a1f14]/5",
    bgDark: "from-[#3d2e1a] via-[#2a1f14] to-[#1a1209]",
    accent: "#DCCEB8",
  },
  {
    name: "Royal Indigo",
    hex: "#304D7A",
    image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/sky-blue.png",
    mood: "Bold. Regal. Powerful.",
    story: "Inspired by the royal blue city nights of Jodhpur",
    visual: "Moonlit blue havelis, luxury indigo textures, cinematic evening tone",
    bg: "from-[#304D7A]/15 via-[#1a2a4a]/10 to-[#0f1a2e]/5",
    bgDark: "from-[#1a2a4a] via-[#0f1a2e] to-[#0a1020]",
    accent: "#BFD7EA",
  },
  {
    name: "Sage Heritage",
    hex: "#8A8F63",
    image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/olive-green.png",
    mood: "Masculine. Earthy. Premium.",
    story: "Inspired by royal courtyard gardens and botanical calm",
    visual: "Muted olive greenery, sandstone courtyards, luxury linen textures",
    bg: "from-[#8A8F63]/15 via-[#4a4f33]/10 to-[#2a2f1a]/5",
    bgDark: "from-[#2a2f1a] via-[#1a1f10] to-[#0f1209]",
    accent: "#8A8F63",
  },
  {
    name: "Golden Dune",
    hex: "#D8BF62",
    image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/yellow.png",
    mood: "Warm. Creative. Stylish.",
    story: "Inspired by Rajasthan's golden desert horizon",
    visual: "Golden dunes, sunset glow, rich earthy fashion tone",
    bg: "from-[#D8BF62]/15 via-[#c4956a]/10 to-[#2a1f14]/5",
    bgDark: "from-[#3d3010] via-[#2a1f14] to-[#1a1209]",
    accent: "#D8BF62",
  },
  {
    name: "Ivory White",
    hex: "#F5F3EE",
    image: "https://u1kwkwq0sju0a3pp.public.blob.vercel-storage.com/products/vchuki/white.png",
    mood: "Pure. Clean. Luxurious.",
    story: "Inspired by marble palaces and pristine elegance",
    visual: "White marble, morning light, clean luxury minimalism",
    bg: "from-[#F5F3EE]/30 via-[#e8e4de]/15 to-[#d4d0ca]/5",
    bgDark: "from-[#2a2825] via-[#1a1816] to-[#0f0e0d]",
    accent: "#F5F3EE",
  },
]

export function RajasthanPalette() {
  const [active, setActive] = useState(0)
  const shade = SHADES[active]

  return (
    <section className="relative py-24 md:py-40 overflow-hidden">
      {/* Animated background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${shade.bg} dark:${shade.bgDark}`} />
          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
            style={{ backgroundColor: shade.hex }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Heritage pattern overlay */}
      <div className="absolute inset-0 heritage-pattern opacity-10" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c4956a] font-medium mb-3">Crafted In Shades Of Heritage</p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground">
            The Rajasthan<br />
            <span className="italic font-serif">Palette</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-4 max-w-sm mx-auto leading-relaxed">
            Five shades. Five stories. Each born from the landscapes, architecture, and soul of Rajasthan.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          
          {/* Left — Color Story */}
          <div className="space-y-10">
            {/* Active shade info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Color indicator */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 border-2 border-border shadow-lg"
                    style={{ backgroundColor: shade.hex }}
                  />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">Shade {String(active + 1).padStart(2, "0")} / {String(SHADES.length).padStart(2, "0")}</p>
                    <h3 className="text-2xl md:text-3xl font-light tracking-tight text-foreground mt-0.5">{shade.name}</h3>
                  </div>
                </div>

                {/* Story */}
                <p className="text-base md:text-lg text-foreground/80 leading-relaxed font-light italic">
                  &ldquo;{shade.story}&rdquo;
                </p>

                {/* Mood */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-[#c4956a] font-medium mb-1">Mood</p>
                    <p className="text-sm text-foreground font-medium tracking-wide">{shade.mood}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-[#c4956a] font-medium mb-1">Visual Feel</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{shade.visual}</p>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/shirts"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-[#c4956a] border-b border-[#c4956a]/30 pb-0.5 hover:border-[#c4956a] transition-colors mt-2"
                >
                  Shop This Shade <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Color Swatches — Interactive */}
            <div className="space-y-3">
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-medium">Select Shade</p>
              <div className="flex gap-3">
                {SHADES.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setActive(i)}
                    className="group relative"
                  >
                    <motion.div
                      className={`w-10 h-10 md:w-12 md:h-12 border-2 transition-all duration-300 ${
                        active === i
                          ? "border-[#c4956a] scale-110 shadow-lg"
                          : "border-border hover:border-[#c4956a]/40 hover:scale-105"
                      }`}
                      style={{ backgroundColor: s.hex }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    />
                    {/* Active indicator */}
                    {active === i && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c4956a]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-foreground text-background text-[8px] tracking-wider uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {s.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Product Display */}
          <div className="relative flex items-center justify-center">
            {/* Background glow for product */}
            <div
              className="absolute inset-0 rounded-full blur-[80px] opacity-15 transition-colors duration-700"
              style={{ backgroundColor: shade.hex }}
            />

            {/* Corner frames */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#c4956a]/30" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-[#c4956a]/30" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-[#c4956a]/30" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-[#c4956a]/30" />

            {/* Product Image — full width, proper sizing */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.92, rotateY: -5 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.92, rotateY: 5 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full aspect-[3/4] max-w-[420px] mx-auto"
              >
                <Image
                  src={shade.image}
                  alt={`VCHUKI ${shade.name} Premium Linen Shirt`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 80vw, 420px"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Floating label */}
            <motion.div
              key={`label-${active}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 backdrop-blur-md border border-[#c4956a]/20"
            >
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#c4956a] font-medium text-center">{shade.name}</p>
              <p className="text-[10px] text-muted-foreground text-center mt-0.5">100% Premium Linen · ₹799</p>
            </motion.div>
          </div>
        </div>

        {/* Bottom — Horizontal scroll preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-20 md:mt-28 border-t border-border/50 pt-10"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-medium">All Shades</p>
            <Link href="/shirts" className="text-[10px] uppercase tracking-[0.15em] text-[#c4956a] font-medium hover:underline">
              View Collection
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-1.5 md:gap-3">
            {SHADES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setActive(i)}
                className={`group relative aspect-[3/4] overflow-hidden border transition-all duration-300 ${
                  active === i ? "border-[#c4956a] shadow-lg" : "border-border hover:border-[#c4956a]/30"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  className={`object-cover transition-transform duration-500 ${active === i ? "scale-105" : "group-hover:scale-105"}`}
                  sizes="20vw"
                />
                <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-3">
                  <p className="text-[7px] md:text-[10px] text-white font-medium tracking-wide truncate">{s.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2 h-2 rounded-full border border-white/40" style={{ backgroundColor: s.hex }} />
                    <p className="text-[6px] md:text-[9px] text-white/60 uppercase tracking-wider hidden md:block">{s.hex}</p>
                  </div>
                </div>
                {active === i && (
                  <motion.div
                    layoutId="activeBorder"
                    className="absolute inset-0 border-2 border-[#c4956a]"
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
