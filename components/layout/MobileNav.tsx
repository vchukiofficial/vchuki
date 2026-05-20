"use client"

import Link from "next/link"
import { Home, Grid, ShoppingCart, User, Heart } from "lucide-react"
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
    { href: "/account/wishlist", icon: Heart, label: "Wishlist" },
    { href: "/account", icon: User, label: "Account" },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md md:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href} className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <tab.icon className="h-5 w-5" />
              <span className="text-[9px]">{tab.label}</span>
            </Link>
          )
        })}
        <button onClick={toggleCart} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute top-1.5 right-3 h-3.5 w-3.5 rounded-full bg-primary text-[8px] font-bold flex items-center justify-center text-primary-foreground">
              {items.length}
            </span>
          )}
          <span className="text-[9px]">Cart</span>
        </button>
      </div>
    </div>
  )
}
