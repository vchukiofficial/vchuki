import Link from "next/link"
import { Button } from "@/components/ui/button"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductCardServer from "@/components/products/ProductCardServer"

async function getFeaturedProducts() {
  await connectDB()
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8).lean()
  return JSON.parse(JSON.stringify(products))
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <>
      {/* Hero */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-primary mb-4">Premium Fashion</p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="text-gradient">VCHUKI</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Crafted for those who demand excellence. Premium shirts designed for comfort, style, and every occasion.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="px-8 text-base">
                Explore Collection
              </Button>
            </Link>
            <Link href="/products?category=formal">
              <Button variant="outline" size="lg" className="px-8 text-base border-primary/30 hover:bg-primary/10">
                Formal Wear
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Formal", desc: "Office & Events", href: "/products?category=formal" },
            { name: "Casual", desc: "Everyday Style", href: "/products?category=casual" },
            { name: "Ethnic", desc: "Traditional Fusion", href: "/products?category=ethnic" },
          ].map((cat) => (
            <Link key={cat.name} href={cat.href} className="group relative p-8 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 hover:bg-card transition-all">
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
              <span className="text-xs text-primary mt-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                Shop Now →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Featured</h2>
            <p className="text-muted-foreground text-sm mt-1">Handpicked for you</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="text-primary">View All →</Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <ProductCardServer key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* USP Banner */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Free Shipping", sub: "Orders above ₹999" },
            { label: "Easy Returns", sub: "30-day policy" },
            { label: "Secure Payment", sub: "100% protected" },
            { label: "Premium Quality", sub: "Handcrafted fabrics" },
          ].map((item) => (
            <div key={item.label}>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
