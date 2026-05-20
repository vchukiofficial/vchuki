"use client"

import Link from 'next/link'
import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

export default function Navbar() {
  const { toggleCart } = useUIStore()
  const { totalItems } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter:blur(20px)]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-4 hidden md:flex">
          <h1 className="text-xl font-bold text-primary">ShirtStore</h1>
        </Link>
        
        <Link href="/" className="mr-6 flex md:hidden">
          <h1 className="text-xl font-bold text-primary">SS</h1>
        </Link>

        <div className="flex flex-1 items-center justify-center space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex md:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="w-full rounded-md border bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Search shirts..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="sm">
            <Heart className="h-5 w-5" />
            <span className="ml-1 text-xs">{wishlistItems.length}</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={toggleCart}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                {totalItems}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
