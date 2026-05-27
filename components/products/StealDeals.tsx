"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Zap, Check } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

interface Props {
  currentProductId: string
  currentCategory: string
}

interface DealProduct {
  _id: string
  name: string
  slug: string
  basePrice: number
  images: string[]
  category: string
  variant?: {
    _id: string
    sku: string
    color: { name: string; hex: string }
    size: string
    images: string[]
    priceAdjustment: number
  }
}

export function StealDeals({ currentProductId, currentCategory }: Props) {
  const [deals, setDeals] = useState<DealProduct[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDeals() {
      try {
        // Fetch products from other categories only
        const res = await fetch(`/api/products?limit=10`)
        if (!res.ok) return
        const data = await res.json()
        const products = (data.products || []).filter(
          (p: any) => p._id !== currentProductId && p.category !== currentCategory
        )

        const results: DealProduct[] = []
        for (const product of products.slice(0, 6)) {
          const varRes = await fetch(`/api/products/${product._id}/variants`)
          if (!varRes.ok) continue
          const varData = await varRes.json()
          const inStockVariant = (varData.variants || []).find((v: any) => v.stock > 0)
          if (inStockVariant) {
            results.push({ ...product, variant: inStockVariant })
          }
          if (results.length >= 4) break
        }
        setDeals(results)
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchDeals()
  }, [currentProductId, currentCategory])

  function handleAdd(deal: DealProduct) {
    if (!deal.variant) return
    addItem({
      _id: `${deal._id}-${deal.variant.sku}`,
      name: deal.name,
      slug: deal.slug,
      images: deal.variant.images?.length ? deal.variant.images : deal.images,
      price: deal.basePrice + (deal.variant.priceAdjustment || 0),
      quantity: 1,
      sku: deal.variant.sku,
      variantId: deal.variant._id,
      size: deal.variant.size,
      color: deal.variant.color?.name || "Default",
    })
    setAddedId(deal._id)
    setTimeout(() => setAddedId(null), 2000)
  }

  if (loading || deals.length === 0) return null

  return (
    <div className="border border-[#c4956a]/30 bg-gradient-to-r from-[#c4956a]/5 to-transparent p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-[#c4956a] fill-[#c4956a]" />
        <div>
          <p className="text-xs font-semibold text-foreground">STEAL DEALS</p>
          <p className="text-[10px] text-muted-foreground">Pick any one of these items</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {deals.map((deal) => {
          const img = deal.variant?.images?.[0] || deal.images?.[0]
          const price = deal.basePrice + (deal.variant?.priceAdjustment || 0)
          const isAdded = addedId === deal._id

          return (
            <div key={deal._id} className="flex gap-2 p-2 bg-background border border-border hover:border-[#c4956a]/30 transition-colors">
              <Link href={`/product/${deal.slug}`} className="relative w-12 h-14 flex-shrink-0 bg-card overflow-hidden border border-border">
                {img && <Image src={img} alt={deal.name} fill className="object-cover" sizes="48px" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${deal.slug}`}>
                  <p className="text-[10px] font-medium text-foreground line-clamp-1">{deal.name}</p>
                  <p className="text-[10px] text-muted-foreground">{deal.variant?.color?.name} · {deal.variant?.size}</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">₹{price.toLocaleString()}</p>
                </Link>
                <button
                  onClick={() => handleAdd(deal)}
                  disabled={isAdded}
                  className={`mt-1 px-2 py-1 text-[9px] font-medium uppercase tracking-wider transition-all ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-[#c4956a]/10 text-[#c4956a] border border-[#c4956a]/30 hover:bg-[#c4956a]/20"
                  }`}
                >
                  {isAdded ? <span className="flex items-center gap-0.5"><Check className="h-2.5 w-2.5" /> Added</span> : "+ Add"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
