"use client"

import Link from "next/link"
import { Home, Grid, Heart, User, ShoppingCart } from "lucide-react"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"
import { usePathname } from "next/navigation"

export default function MobileNav() {
  const { toggleCart } = useUIStore()
  const items = useCartStore((s) => s.items)
  const pathname = usePathname()

  const tabs = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shirts", icon: Grid, label: "Shop" },
    { href: "/account/wishlist", icon: Heart, label: "Saved" },
    { href: "/account", icon: User, label: "You" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t md:hidden">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href} className={`flex flex-col items-center justify-center gap-0.5 ${active ? "text-foreground" : "text-muted-foreground"}`}>
              <tab.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] tracking-wide">{tab.label}</span>
            </Link>
          )
        })}
        <button onClick={toggleCart} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground relative">
          <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.5} />
          {items.length > 0 && (
            <span className="absolute top-2 right-4 h-3 w-3 rounded-full bg-foreground text-background text-[7px] font-medium flex items-center justify-center">
              {items.length}
            </span>
          )}
          <span className="text-[9px] tracking-wide">Bag</span>
        </button>
      </div>
    </div>
  )
}
