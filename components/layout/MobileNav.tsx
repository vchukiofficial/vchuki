"use client"

import Link from 'next/link'
import { Home, Grid, Search, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import { useCartStore } from '@/store/cartStore'

export default function MobileNav() {
  const { toggleCart } = useUIStore()
  const { totalItems } = useCartStore()

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl"
    >
      <div className="grid grid-cols-5 gap-2 p-2 mx-4 h-16">
        <Link href="/" className="flex flex-col items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-0.5">Home</span>
        </Link>

        <Link href="/categories" className="flex flex-col items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors">
          <Grid className="h-5 w-5" />
          <span className="text-xs mt-0.5">Categories</span>
        </Link>

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-12 w-12 rounded-full p-0 mx-auto col-span-1 bg-primary text-primary-foreground shadow-xl hover:shadow-primary/25 -mt-2"
        >
          <Search className="h-6 w-6" />
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          className="h-12 w-12 rounded-full p-0 relative col-span-1"
          onClick={toggleCart}
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold shadow-lg">
              {totalItems}
            </div>
          )}
        </Button>

        <Link href="/profile" className="flex flex-col items-center justify-center p-1 text-muted-foreground hover:text-foreground transition-colors">
          <User className="h-5 w-5" />
          <span className="text-xs mt-0.5">Profile</span>
        </Link>
      </div>
    </motion.div>
  )
}
