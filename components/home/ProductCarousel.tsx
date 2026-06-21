"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { QuickAddButton } from "./QuickAddButton"

interface Props {
  products: any[]
  autoScroll?: boolean
}

export function ProductCarousel({ products, autoScroll = false }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.6
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  // Auto-scroll functionality
  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return

    function autoScrollFn() {
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        scrollRef.current.scrollBy({ left: clientWidth * 0.4, behavior: "smooth" })
      }
    }

    intervalRef.current = setInterval(autoScrollFn, 3500)

    const el = scrollRef.current
    const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    const resume = () => { intervalRef.current = setInterval(autoScrollFn, 3500) }

    el.addEventListener("mouseenter", pause)
    el.addEventListener("mouseleave", resume)
    el.addEventListener("touchstart", pause)
    el.addEventListener("touchend", resume)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      el.removeEventListener("mouseenter", pause)
      el.removeEventListener("mouseleave", resume)
      el.removeEventListener("touchstart", pause)
      el.removeEventListener("touchend", resume)
    }
  }, [autoScroll])

  if (!products.length) return null

  return (
    <div className="relative group/carousel">
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 md:left-4 top-[35%] -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border border-[#c4956a]/20 shadow-sm flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-[#c4956a]/50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 md:right-4 top-[35%] -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 backdrop-blur-sm border border-[#c4956a]/20 shadow-sm flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity hover:border-[#c4956a]/50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar px-4 md:px-[max(1rem,calc((100vw-1320px)/2+1rem))] scroll-smooth"
      >
        {products.map((product) => {
          // Variant-expanded card (has variantColor)
          const isVariantCard = !!product.variantColor
          const displayImage = isVariantCard
            ? product.variantImage
            : product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"
          const displayPrice = isVariantCard ? product.variantPrice : product.basePrice

          return (
            <div key={product._id} className="flex-shrink-0 w-[44vw] md:w-[22vw] lg:w-[18vw]">
              <Link href={`/product/${product.slug}`} className="group block">
                <div className="relative aspect-[3/4] bg-card overflow-hidden mb-3 border border-border group-hover:border-[#c4956a]/30 transition-colors">
                  <Image
                    src={displayImage}
                    alt={`${product.name}${isVariantCard ? ` - ${product.variantColor.name}` : ""}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 44vw, 22vw"
                    loading="lazy"
                  />
                  {product.tags?.includes("new-launch") && (
                    <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-[#c4956a] text-white px-2 py-0.5 font-medium">
                      New
                    </span>
                  )}
                  {product.tags?.includes("bestseller") && !product.tags?.includes("new-launch") && (
                    <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-[#2a1f14] text-[#f5e6d3] px-2 py-0.5 font-medium">
                      Bestseller
                    </span>
                  )}
                  {/* Color indicator for variant cards */}
                  {isVariantCard && product.variantColor?.hex && (
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm px-2 py-1 border border-border">
                      <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: product.variantColor.hex }} />
                      <span className="text-[9px] font-medium text-foreground">{product.variantColor.name}</span>
                    </div>
                  )}
                  <button className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
                    <Heart className="h-3.5 w-3.5 text-foreground/70" />
                  </button>
                  {/* Quick Add overlay - desktop */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                    <QuickAddButton product={product} />
                  </div>
                </div>
              </Link>
              <Link href={`/product/${product.slug}`} className="block">
                <h3 className="text-[11px] md:text-xs font-normal line-clamp-1 text-foreground/80 group-hover:text-foreground transition-colors">{product.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs md:text-sm font-semibold text-foreground">₹{displayPrice?.toLocaleString()}</p>
                  {product.comparePrice > 0 && product.comparePrice > (displayPrice || 0) && (
                    <>
                      <p className="text-[10px] text-muted-foreground line-through">₹{product.comparePrice.toLocaleString()}</p>
                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {Math.round(((product.comparePrice - (displayPrice || 0)) / product.comparePrice) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
              </Link>
              {/* Quick Add - mobile */}
              <div className="mt-2 md:hidden">
                <QuickAddButton product={product} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
