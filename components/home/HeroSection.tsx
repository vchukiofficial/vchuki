"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-[92vh] md:h-[95vh] flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1600&q=90"
          alt="VCHUKI Premium Linen Shirts Collection"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>

      {/* Content */}
      <div className="relative container pb-16 md:pb-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-white/60 mb-4"
          >
            Summer 2026 Collection
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.05] tracking-tight"
          >
            The Art of<br />
            <span className="font-medium">Linen</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-5 text-sm md:text-base text-white/60 max-w-sm leading-relaxed"
          >
            Premium linen shirts crafted in Jodhpur. Breathable elegance for the modern man.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-8 flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/shirts"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black text-xs md:text-sm font-medium tracking-wider hover:bg-white/90 transition-colors"
            >
              SHOP COLLECTION
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/shirts/linen"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/30 text-white text-xs md:text-sm font-medium tracking-wider hover:bg-white/10 transition-colors"
            >
              LINEN EDIT
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-6 right-6 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
