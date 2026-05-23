"use client"

import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { useCartStore } from "@/store/cartStore"

interface Props {
  product: {
    _id: string
    name: string
    slug: string
    basePrice: number
    images: string[]
  }
}

export function QuickAddButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      images: product.images,
      price: product.basePrice,
      quantity: 1,
      sku: `${product.slug}-default`,
      variantId: product._id,
      size: "M",
      color: "Default",
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-2.5 text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
        added
          ? "bg-emerald-600 text-white"
          : "bg-[#2a1f14]/90 backdrop-blur-sm text-[#f5e6d3] hover:bg-[#2a1f14]"
      }`}
    >
      {added ? (
        <span className="flex items-center justify-center gap-1.5">
          <Check className="h-3 w-3" /> Added
        </span>
      ) : (
        <span className="flex items-center justify-center gap-1.5">
          <ShoppingCart className="h-3 w-3" /> Quick Add
        </span>
      )}
    </button>
  )
}
