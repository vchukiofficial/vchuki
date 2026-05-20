"use client"
import Navbar from '@/components/layout/Navbar'
import HeroBanner from '@/components/home/HeroBanner'
import CartDrawer from '@/components/layout/CartDrawer'
import ProductCard from '@/components/products/ProductCard'

// Mock data for demo
const mockProducts = [
  {
    _id: '1',
    name: 'Classic Oxford Shirt',
    slug: 'classic-oxford-shirt',
    description: 'A timeless classic Oxford shirt for every occasion.',
    basePrice: 1999,
    category: 'Formal',
    tags: ['cotton', 'slim-fit'],
    images: ['/shirt1.jpg'],
    isFeatured: true,
    rating: 4.5,
    reviewsCount: 120,
  },
]

export default function Home() {
  const products = mockProducts

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      <CartDrawer />
      
      <main className="container py-20">
        <section className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Featured Shirts
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our premium collection of shirts crafted for every occasion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
