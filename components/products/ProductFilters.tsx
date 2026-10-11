"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react"

const priceRanges = [
  { label: "Under ₹799", min: 0, max: 799 },
  { label: "₹799 - ₹999", min: 799, max: 999 },
  { label: "₹1000 - ₹1499", min: 1000, max: 1499 },
  { label: "₹1500+", min: 1500, max: 99999 },
]

const sizeOptions = ["S", "M", "L", "XL", "XXL"]
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
]

const tagFilters = [
  { label: "New Launch 🔥", value: "new-launch" },
  { label: "Bestseller", value: "bestseller" },
  { label: "Featured", value: "featured" },
  { label: "Summer", value: "summer" },
  { label: "Luxury", value: "luxury" },
]

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sheet, setSheet] = useState<"sort" | "filter" | null>(null)

  const currentSort = searchParams.get("sort") || "newest"
  const currentPrice = searchParams.get("price") || ""
  const currentTag = searchParams.get("tag") || ""
  const currentSize = searchParams.get("size") || ""

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  function clearAll() {
    router.push(window.location.pathname)
    setSheet(null)
  }

  const activeFilterCount = [currentPrice, currentTag, currentSize].filter(Boolean).length
  const hasFilters = activeFilterCount > 0 || currentSort !== "newest"

  const sortContent = (
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2.5">Sort By</p>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { applyFilter("sort", opt.value === "newest" ? "" : opt.value); setSheet(null) }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                (currentSort === opt.value || (!currentSort && opt.value === "newest"))
                  ? "bg-[#c4956a]/10 text-[#c4956a] font-medium border-l-2 border-[#c4956a]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
  )

  const filterContent = (
    <div className="space-y-6">
      {/* Tags */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2.5">Collection</p>
        <div className="space-y-1">
          {tagFilters.map((tag) => (
            <button
              key={tag.value}
              onClick={() => applyFilter("tag", currentTag === tag.value ? "" : tag.value)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                currentTag === tag.value
                  ? "bg-[#c4956a]/10 text-[#c4956a] font-medium border-l-2 border-[#c4956a]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2.5">Price</p>
        <div className="space-y-1">
          {priceRanges.map((range) => {
            const value = `${range.min}-${range.max}`
            return (
              <button
                key={value}
                onClick={() => applyFilter("price", currentPrice === value ? "" : value)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  currentPrice === value
                    ? "bg-[#c4956a]/10 text-[#c4956a] font-medium border-l-2 border-[#c4956a]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2.5">Size</p>
        <div className="flex flex-wrap gap-1.5">
          {sizeOptions.map((size) => (
            <button
              key={size}
              onClick={() => applyFilter("size", currentSize === size ? "" : size)}
              className={`h-9 w-11 border text-xs font-medium transition-colors ${
                currentSize === size
                  ? "border-[#c4956a] bg-[#c4956a] text-white"
                  : "border-border text-muted-foreground hover:border-[#c4956a]/50 hover:text-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop: Always visible left sidebar */}
      <aside className="hidden md:block w-56 flex-shrink-0 pr-6 border-r border-border">
        <div className="space-y-6">
          {sortContent}
          {filterContent}
        </div>
      </aside>

      {/* Mobile: Sort | Filter bar pinned just above the bottom nav */}
      <div className="md:hidden fixed bottom-[56px] inset-x-0 z-40 grid grid-cols-2 h-12 bg-background border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button onClick={() => setSheet("sort")} className="flex items-center justify-center gap-2 text-xs font-medium text-foreground border-r border-border">
          <ArrowUpDown className="h-4 w-4" />
          Sort
          {currentSort !== "newest" && <span className="h-1.5 w-1.5 rounded-full bg-[#c4956a]" />}
        </button>
        <button onClick={() => setSheet("filter")} className="flex items-center justify-center gap-2 text-xs font-medium text-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && (
            <span className="h-4 min-w-4 px-1 rounded-full bg-[#c4956a] text-white text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Mobile bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSheet(null)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-background rounded-t-2xl overflow-y-auto p-5 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-foreground">{sheet === "sort" ? "Sort By" : "Filter"}</h2>
              <button onClick={() => setSheet(null)} aria-label="Close" className="h-8 w-8 flex items-center justify-center border border-border text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            {sheet === "sort" ? sortContent : (
              <>
                {filterContent}
                <button
                  onClick={() => setSheet(null)}
                  className="mt-6 w-full py-3 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase"
                >
                  Show Results
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
