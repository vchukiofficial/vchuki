"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"

interface CategorySlide {
  slug: string
  name: string
  image: string
}

export function CategoryImageCarousel({ slides }: { slides: CategorySlide[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const interval = setInterval(() => setActive((i) => (i + 1) % slides.length), 3000)
    return () => clearInterval(interval)
  }, [paused, slides.length])

  if (slides.length === 0) return null
  const slide = slides[active]

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute -inset-2 border border-[#c4956a]/20" />
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={`${slide.name} - VCHUKI`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#c4956a]/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#c4956a]/50" />

      {/* Category label + dots */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <p className="text-[#f5e6d3] text-xs md:text-sm font-medium tracking-wide">{slide.name}</p>
        {slides.length > 1 && (
          <div className="flex gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.slug}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-[#c4956a]" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
