"use client"

import ProductCard from './ProductCard'
import { useProducts } from '@/hooks/useProducts'

interface ProductGridProps {
  type?: 'bestsellers' | 'new' | 'featured'
}

export default function ProductGrid({ type = 'featured' }: ProductGridProps) {
const { products, isLoading: loading } = useProducts(type)

if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="group relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-card shadow-lg">
            <div className="absolute inset-0">
              <div className="h-full w-full animate-shimmer rounded-xl bg-gradient-to-r from-transparent via-muted to-transparent" />
            </div>
            <div className="absolute top-4 left-4 w-20 h-6 rounded-full bg-gradient-to-r from-destructive/80 animate-shimmer" />
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="h-5 w-3/4 animate-shimmer rounded bg-muted" />
              <div className="h-4 w-1/2 animate-shimmer rounded bg-muted" />
              <div className="flex items-center gap-1 mt-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-3 w-3 rounded-full bg-muted animate-shimmer" />
                ))}
                <div className="h-3 w-8 ml-2 animate-shimmer rounded bg-muted" />
              </div>
              <div className="flex justify-between items-end mt-3">
                <div className="h-7 w-20 animate-shimmer rounded bg-muted" />
                <div className="flex gap-1">
                  <div className="h-10 w-10 rounded-full animate-shimmer" />
                  <div className="h-10 w-10 rounded-full animate-shimmer" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}
