"use client"

import { Button } from '@/components/ui/button'

export default function HeroBanner() {
  return (
    <section className="relative h-screen overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
      <div className="absolute inset-0">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      </div>

      <div className="container relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent drop-shadow-lg">
          Premium Shirts
          <span className="block bg-gradient-to-r from-primary to-destructive text-5xl md:text-7xl font-black bg-clip-text text-transparent">
            Collection
          </span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-xl text-muted-foreground md:text-2xl">
          Discover the perfect fit with our curated collection of shirts. 
          Crafted for comfort, style, and every occasion.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="text-lg px-8 py-6 shadow-2xl hover:shadow-primary/25">
            Shop Now
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            Learn More
          </Button>
        </div>

        <div className="mt-16 flex flex-wrap gap-6 justify-center">
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            <span>Free Shipping over ₹999</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
            <span>30 Day Returns</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 bg-secondary rounded-full animate-pulse" />
            <span>Secure Payments</span>
          </div>
        </div>
      </div>
    </section>
  )
}
