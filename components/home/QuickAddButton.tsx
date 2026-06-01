"use client"

import { useState } from "react"
import { Bell, Check } from "lucide-react"

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
  const [notified, setNotified] = useState(false)

  function handleNotify(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    // Store product interest for notification
    console.log("Notify interest:", product.slug)
    setNotified(true)
    setTimeout(() => setNotified(false), 3000)
  }

  return (
    <button
      onClick={handleNotify}
      className={`w-full py-2.5 text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
        notified
          ? "bg-emerald-600 text-white"
          : "bg-[#2a1f14]/90 backdrop-blur-sm text-[#f5e6d3] hover:bg-[#2a1f14]"
      }`}
    >
      {notified ? (
        <span className="flex items-center justify-center gap-1.5">
          <Check className="h-3 w-3" /> You&apos;ll be notified
        </span>
      ) : (
        <span className="flex items-center justify-center gap-1.5">
          <Bell className="h-3 w-3" /> Dropping July 7 — Notify Me
        </span>
      )}
    </button>
  )
}
