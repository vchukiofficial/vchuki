import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"

async function getFeaturedProducts() {
  await connectDB()
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean()
  return JSON.parse(JSON.stringify(products))
}

async function getAllProducts() {
  await connectDB()
  const products = await Product.find({ isActive: true }).limit(12).lean()
  return JSON.parse(JSON.stringify(products))
}

export default async function HomePage() {
  const [featured, all] = await Promise.all([getFeaturedProducts(), getAllProducts()])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container py-16 md:py-28 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-primary font-medium mb-3">Premium Fashion</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className="text-gradient">VCHUKI</span>
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-4">
            Crafted for those who demand excellence. Premium shirts for comfort, style, and every occasion.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center px-4">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto px-8">Explore Collection</Button>
            </Link>
            <Link href="/products?category=formal">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">Formal Wear</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-10 md:py-16">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {[
            { name: "Formal", desc: "Office & Events", href: "/products?category=formal" },
            { name: "Casual", desc: "Everyday Style", href: "/products?category=casual" },
            { name: "Ethnic", desc: "Traditional", href: "/products?category=ethnic" },
          ].map((cat) => (
            <Link key={cat.name} href={cat.href} className="group p-4 md:p-6 rounded-xl border bg-card hover:border-primary/50 transition-all text-center">
              <h3 className="text-sm md:text-lg font-bold group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-10 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Featured</h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Handpicked for you</p>
          </div>
          <Link href="/products"><Button variant="ghost" size="sm" className="text-primary text-xs">View All →</Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {featured.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="container py-10 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold">New Arrivals</h2>
          <Link href="/products"><Button variant="ghost" size="sm" className="text-primary text-xs">Shop All →</Button></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {all.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* USP */}
      <section className="border-y bg-muted/30">
        <div className="container py-8 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          {[
            { label: "Free Shipping", sub: "Above ₹999" },
            { label: "Easy Returns", sub: "30-day policy" },
            { label: "Secure Payment", sub: "100% protected" },
            { label: "Premium Quality", sub: "Handcrafted" },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-semibold text-xs md:text-sm">{item.label}</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <Image
          src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.isFeatured && (
          <span className="absolute top-2 left-2 text-[9px] md:text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
            Featured
          </span>
        )}
      </div>
      <div className="p-2.5 md:p-3">
        <h3 className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm md:text-base font-bold text-primary">₹{product.basePrice?.toLocaleString()}</p>
          <span className="text-[10px] text-muted-foreground capitalize">{product.category}</span>
        </div>
      </div>
    </Link>
  )
}
