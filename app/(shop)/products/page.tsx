"use client"

import { Suspense } from 'react'
import ProductGrid from './ProductGrid'
import ProductFilters from './ProductFilters'

// PLP - Premium grid with filters
export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 lg:py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-destructive bg-clip-text text-transparent mb-4">
            All Shirts
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our premium collection of shirts crafted for every occasion
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sticky Filters */}
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters />
          </Suspense>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading products...</div>}>
              <ProductGrid />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
