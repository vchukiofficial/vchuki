"use client"

import { useEffect, useState } from "react"
import { Zap, Tag } from "lucide-react"
import { fetchComboOffers, getOffersForProduct, type ComboOffer } from "@/lib/comboOffers"

interface Props {
  category: string
  productName: string
}

export function ComboOfferWidget({ category, productName }: Props) {
  const [offers, setOffers] = useState<ComboOffer[]>([])

  useEffect(() => {
    fetchComboOffers().then((dbOffers) => {
      if (dbOffers.length > 0) {
        // Filter relevant offers for this product
        const type = category.toLowerCase()
        const relevant = dbOffers.filter((o) =>
          o.conditions.category.some((c) => type.includes(c) || c.includes(type))
        )
        setOffers(relevant.length > 0 ? relevant : getOffersForProduct(category, productName))
      } else {
        setOffers(getOffersForProduct(category, productName))
      }
    })
  }, [category, productName])

  if (offers.length === 0) return null

  return (
    <div className="border border-[#c4956a]/30 bg-[#c4956a]/5 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Zap className="h-3.5 w-3.5 text-[#c4956a]" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#c4956a]">Combo Offers</span>
      </div>
      <div className="space-y-1.5">
        {offers.slice(0, 3).map((offer) => (
          <OfferRow key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  )
}

function OfferRow({ offer }: { offer: ComboOffer }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#c4956a]/10 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <Tag className="h-3 w-3 text-[#c4956a] flex-shrink-0" />
        <p className="text-[11px] text-foreground truncate">{offer.description}</p>
      </div>
      {offer.savedAmount && (
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          Save ₹{offer.savedAmount}
        </span>
      )}
    </div>
  )
}
