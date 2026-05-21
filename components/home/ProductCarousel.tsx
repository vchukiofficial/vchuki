"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Props {
  products: any[]
}

export function ProductCarousel({ products }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.6
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" })
  }

  return (
    <div className="relative group/carousel">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border shadow-sm flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Products */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar px-4 md:px-[max(1rem,calc((100vw-1320px)/2+1rem))] scroll-smooth"
      >
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product.slug}`}
            className="group flex-shrink-0 w-[42vw] md:w-[22vw] lg:w-[18vw]"
          >
            <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
              <Image
                src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 42vw, 22vw"
                loading="lazy"
              />
              {product.tags?.includes("new-launch") && (
                <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-foreground text-background px-2 py-0.5 font-medium">
                  New
                </span>
              )}
              {product.tags?.includes("bestseller") && !product.tags?.includes("new-launch") && (
                <span className="absolute top-2.5 left-2.5 text-[8px] uppercase tracking-[0.1em] bg-amber-600 text-white px-2 py-0.5 font-medium">
                  Bestseller
                </span>
              )}
              {/* Quick view overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                <div className="bg-background/95 backdrop-blur-sm text-center py-2.5 text-[11px] font-medium tracking-wider uppercase">
                  Quick View
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-[11px] md:text-xs font-normal line-clamp-1 group-hover:underline underline-offset-2 decoration-muted-foreground/40 transition-all">{product.name}</h3>
              <p className="text-xs md:text-sm font-medium mt-0.5">₹{product.basePrice?.toLocaleString()}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
