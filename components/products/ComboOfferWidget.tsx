"use client"

import { useEffect, useState } from "react"
import { Zap, Gift, Percent } from "lucide-react"
import { fetchComboOffers, detectCategory, type ComboOffer } from "@/lib/comboOffers"

interface Props {
  category: string
  productName: string
}

export function ComboOfferWidget({ category, productName }: Props) {
  const [offers, setOffers] = useState<ComboOffer[]>([])

  useEffect(() => {
    const productType = detectCategory(category, productName)
    if (!productType) return

    fetchComboOffers().then((allOffers) => {
      // Only show offers where THIS product's type is in the offer's categories
      const relevant = allOffers.filter((o) => {
        const cats = o.conditions.category
        // Direct match: product type is one of the offer categories
        if (cats.includes(productType)) return true
        // Kurta matching: "full-sleeve-kurta" should match "kurta-full-sleeve" etc
        if (productType.includes("kurta") && cats.some((c) => c.includes("kurta"))) return true
        if (productType.includes("half-sleeve") && cats.some((c) => c.includes("half-sleeve") && !c.includes("kurta"))) return true
        if (productType === "full-sleeve-shirt" && cats.some((c) => c === "linen" || c === "full-sleeve-shirt")) return true
        return false
      })
      setOffers(relevant)
    })
  }, [category, productName])

  if (offers.length === 0) return null

  return (
    <div className="border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-[#c4956a]/5 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Zap className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
          Available Offers
        </span>
      </div>
      <div className="space-y-0">
        {offers.slice(0, 3).map((offer) => (
          <OfferRow key={offer.id || offer._id} offer={offer} />
        ))}
      </div>
      {offers.length > 3 && (
        <p className="text-[10px] text-muted-foreground">+{offers.length - 3} more offers available</p>
      )}
    </div>
  )
}

function OfferRow({ offer }: { offer: ComboOffer }) {
  const hasPrice = (offer.originalPrice || 0) > 0
  const sellingPrice = offer.sellingPrice || (offer.originalPrice ? Math.round(offer.originalPrice * (1 - offer.discount / 100)) : 0)

  return (
    <div className="flex items-start gap-2 py-2 border-b border-border/50 last:border-0">
      <div className="mt-0.5 h-4 w-4 rounded bg-[#c4956a]/10 flex items-center justify-center flex-shrink-0">
        {offer.conditions.minQty >= 3 ? (
          <Gift className="h-2.5 w-2.5 text-[#c4956a]" />
        ) : (
          <Percent className="h-2.5 w-2.5 text-[#c4956a]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-foreground leading-tight">{offer.description}</p>
        {hasPrice ? (
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-semibold text-foreground">₹{sellingPrice.toLocaleString()}</span>
            <span className="text-[10px] text-muted-foreground line-through">₹{offer.originalPrice!.toLocaleString()}</span>
            <span className="text-[9px] px-1 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">{offer.discount}% OFF</span>
          </div>
        ) : (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            {offer.discount}% OFF · Auto-applied at checkout
          </p>
        )}
      </div>
    </div>
  )
}
