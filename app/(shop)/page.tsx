"use client"

import { Suspense } from 'react'
import HeroBanner from '@/components/home/HeroBanner'
import Navbar from '@/components/layout/Navbar'
import CartDrawer from '@/components/layout/CartDrawer'
import ProductGrid from '@/components/products/ProductGrid'

export default function ShopHome() {
  return (
    <>
      <Navbar />
      <HeroBanner />
      <CartDrawer />
      
      <main className="container py-20 space-y-20">
        {/* Best Sellers */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-destructive bg-clip-text text-transparent mb-6">
              Best Sellers
            </h2>
            <p className="text-xl max-w-2xl mx-auto text-muted-foreground">
              Our most loved shirts - proven favorites from thousands of happy customers
            </p>
          </div>
          <Suspense fallback={<div>Loading best sellers...</div>}>
            <ProductGrid type="bestsellers" />
          </Suspense>
        </section>

        {/* Category Highlights */}
        <section className="grid md:grid-cols-3 gap-8">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400/20 to-indigo-500/20 p-10 text-center hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 border cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10" />
            <h3 className="relative text-3xl font-black text-primary mb-4">Formal</h3>
            <p className="relative text-lg text-muted-foreground mb-6">Oxford, Dress Shirts</p>
            <span className="relative font-bold text-2xl text-primary">Shop Now →</span>
          </div>
          {/* More categories */}
        </section>
      </main>
    </>
  )
}
