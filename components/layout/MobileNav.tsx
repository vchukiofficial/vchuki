"use client"

import Link from "next/link"
import { Home, Grid, Search, ShoppingCart, User } from "lucide-react"
import { useUIStore } from "@/store/uiStore"
import { useCartStore } from "@/store/cartStore"

export default function MobileNav() {
  const { toggleCart } = useUIStore()
  const items = useCartStore((s) => s.items)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 h-16">
        <Link href="/" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-1">Home</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Grid className="h-5 w-5" />
          <span className="text-[10px] mt-1">Shop</span>
        </Link>
        <button className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Search className="h-5 w-5" />
          <span className="text-[10px] mt-1">Search</span>
        </button>
        <button onClick={toggleCart} className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute top-2 right-4 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
              {items.length}
            </span>
          )}
          <span className="text-[10px] mt-1">Cart</span>
        </button>
        <Link href="/account" className="flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <User className="h-5 w-5" />
          <span className="text-[10px] mt-1">Account</span>
        </Link>
      </div>
    </div>
  )
}
