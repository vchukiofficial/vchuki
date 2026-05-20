"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const priceRanges = [
  { label: "Under ₹999", min: 0, max: 999 },
  { label: "₹999 - ₹1499", min: 999, max: 1499 },
  { label: "₹1500 - ₹2499", min: 1500, max: 2499 },
  { label: "₹2500 - ₹3999", min: 2500, max: 3999 },
  { label: "₹4000+", min: 4000, max: 99999 },
]

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Bestsellers", value: "bestseller" },
  { label: "Rating", value: "rating" },
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
  const [showFilters, setShowFilters] = useState(false)

  const currentSort = searchParams.get("sort") || "newest"
  const currentPrice = searchParams.get("price") || ""
  const currentTag = searchParams.get("tag") || ""

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
  }

  const hasFilters = currentPrice || currentTag || currentSort !== "newest"

  return (
    <div className="mb-4 md:mb-6">
      {/* Top bar: Sort + Filter toggle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs md:text-sm hover:border-primary/50 transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {hasFilters && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </button>

        <select
          value={currentSort}
          onChange={(e) => applyFilter("sort", e.target.value)}
          className="px-3 py-2 rounded-lg border bg-background text-xs md:text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Quick tag filters - horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {tagFilters.map((tag) => (
          <button
            key={tag.value}
            onClick={() => applyFilter("tag", currentTag === tag.value ? "" : tag.value)}
            className={`px-3 py-1.5 rounded-full text-[11px] md:text-xs border whitespace-nowrap transition-colors ${
              currentTag === tag.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {tag.label}
          </button>
        ))}
        {hasFilters && (
          <button onClick={clearAll} className="px-3 py-1.5 rounded-full text-[11px] md:text-xs border border-destructive/30 text-destructive whitespace-nowrap flex items-center gap-1">
            <X className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Expanded filters panel */}
      {showFilters && (
        <div className="mt-3 p-4 rounded-xl border bg-card space-y-4 animate-fade-in">
          {/* Price Range */}
          <div>
            <p className="text-xs font-medium mb-2">Price Range</p>
            <div className="flex flex-wrap gap-1.5">
              {priceRanges.map((range) => {
                const value = `${range.min}-${range.max}`
                return (
                  <button
                    key={value}
                    onClick={() => applyFilter("price", currentPrice === value ? "" : value)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
                      currentPrice === value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
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
            <p className="text-xs font-medium mb-2">Size</p>
            <div className="flex flex-wrap gap-1.5">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => applyFilter("size", searchParams.get("size") === size ? "" : size)}
                  className={`h-8 w-10 rounded-lg text-[11px] border font-medium transition-colors ${
                    searchParams.get("size") === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowFilters(false)}>
              Apply
            </Button>
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={clearAll}>
              Reset All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
