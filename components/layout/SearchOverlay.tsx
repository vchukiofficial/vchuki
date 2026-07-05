"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "@/store/uiStore"

interface SearchResult {
  _id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
}

export default function SearchOverlay() {
  const { isSearchOpen, setSearchOpen } = useUIStore()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query.trim())}&limit=6`)
        const data = await res.json()
        setResults(data.products || [])
      } catch {
        setResults([])
      }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  function goToResults() {
    if (!query.trim()) return
    router.push(`/shirts?search=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    goToResults()
  }

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-0 inset-x-0 md:top-[8%] md:left-1/2 md:-translate-x-1/2 md:w-[560px] bg-background border-b md:border border-border shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for shirts, kurtas, colors..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto">
              {results.length > 0 && (
                <div className="p-2">
                  {results.map((product) => (
                    <Link
                      key={product._id}
                      href={`/product/${product.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-card transition-colors"
                    >
                      <div className="relative h-14 w-11 flex-shrink-0 bg-card overflow-hidden border border-border">
                        {product.images?.[0] && (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="44px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">₹{product.basePrice?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={goToResults}
                    className="w-full mt-1 py-2.5 text-center text-xs uppercase tracking-wider font-medium text-[#c4956a] hover:underline"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </button>
                </div>
              )}

              {!loading && query.trim() && results.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">No products found for &ldquo;{query}&rdquo;</p>
                  <Link href="/shirts" onClick={() => setSearchOpen(false)} className="inline-block mt-3 text-xs uppercase tracking-wider font-medium text-[#c4956a] hover:underline">
                    Browse all shirts
                  </Link>
                </div>
              )}

              {!query.trim() && (
                <div className="p-6">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {["Linen Shirt", "Kurta", "Half Sleeve", "Golden Dune", "Ivory White"].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 text-xs border border-border text-muted-foreground hover:border-[#c4956a]/40 hover:text-foreground transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
