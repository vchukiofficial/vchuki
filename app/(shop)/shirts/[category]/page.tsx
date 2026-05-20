import { Metadata } from "next"
import { notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import Link from "next/link"
import Image from "next/image"

const categoryMeta: Record<string, { title: string; description: string; h1: string; content: string }> = {
  formal: {
    title: "Formal Shirts for Men — Office & Business Wear",
    description: "Shop premium formal shirts for men at VCHUKI. Oxford shirts, dress shirts, French cuff shirts. Perfect for office, meetings & events. Free shipping above ₹999.",
    h1: "Formal Shirts for Men",
    content: "Elevate your professional wardrobe with VCHUKI's premium formal shirts. Our collection features crisp Oxford shirts, elegant French cuff shirts, and classic dress shirts crafted from 100% cotton. Perfect for office wear, business meetings, and formal events.",
  },
  casual: {
    title: "Casual Shirts for Men — Everyday Style",
    description: "Explore casual shirts for men at VCHUKI. Denim shirts, flannel shirts, Hawaiian prints & more. Comfortable fits for everyday wear. Shop now with free shipping.",
    h1: "Casual Shirts for Men",
    content: "Discover comfortable and stylish casual shirts at VCHUKI. From washed denim to vibrant Hawaiian prints, our casual collection is designed for weekends, outings, and everyday style. Available in slim, regular, and relaxed fits.",
  },
  linen: {
    title: "Linen Shirts for Men — Breathable Summer Shirts Online",
    description: "Buy premium linen shirts for men online at VCHUKI. Breathable, lightweight & perfect for Indian summers. Available in multiple colors and fits. Free shipping.",
    h1: "Linen Shirts for Men",
    content: "Stay cool and stylish with VCHUKI's premium linen shirts. Made from 100% natural linen, these shirts are breathable, lightweight, and perfect for Indian summers. Available in classic and modern fits with a natural texture that gets better with every wash.",
  },
  cotton: {
    title: "Cotton Shirts for Men — Premium 100% Cotton",
    description: "Shop 100% cotton shirts for men at VCHUKI. Soft, durable & comfortable. Oxford cotton, poplin & twill weaves. Premium quality at great prices.",
    h1: "Cotton Shirts for Men",
    content: "Experience the comfort of pure cotton with VCHUKI's premium cotton shirt collection. From crisp Oxford weaves to smooth poplin, our cotton shirts offer all-day comfort with a polished look. Pre-shrunk and color-fast for lasting quality.",
  },
  oversized: {
    title: "Oversized Shirts for Men — Relaxed Fit Streetwear",
    description: "Shop trendy oversized shirts for men at VCHUKI. Relaxed fit, drop shoulders & modern streetwear style. Perfect for casual outings. Free shipping above ₹999.",
    h1: "Oversized Shirts for Men",
    content: "Make a statement with VCHUKI's oversized shirt collection. Featuring drop shoulders, relaxed fits, and contemporary designs inspired by global streetwear trends. Perfect for layering or wearing solo for a bold, effortless look.",
  },
  premium: {
    title: "Premium Collection — Luxury Shirts for Men",
    description: "Explore VCHUKI's premium luxury shirt collection. Handcrafted with the finest fabrics, exclusive designs & impeccable tailoring. Limited edition pieces.",
    h1: "Premium Collection",
    content: "Indulge in luxury with VCHUKI's Premium Collection. Each piece is handcrafted using the finest imported fabrics with meticulous attention to detail. Limited edition designs that combine timeless elegance with modern sophistication.",
  },
}

interface Props {
  params: { category: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = categoryMeta[params.category]
  if (!meta) return { title: "Not Found" }

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://vchuki.com/shirts/${params.category}` },
    openGraph: {
      title: meta.title + " | VCHUKI",
      description: meta.description,
      url: `https://vchuki.com/shirts/${params.category}`,
    },
  }
}

export function generateStaticParams() {
  return Object.keys(categoryMeta).map((category) => ({ category }))
}

export default async function CategoryPage({ params }: Props) {
  const meta = categoryMeta[params.category]
  if (!meta) notFound()

  await connectDB()

  // Map URL categories to DB categories/tags
  const query: Record<string, any> = { isActive: true }
  if (["formal", "casual", "ethnic"].includes(params.category)) {
    query.category = params.category
  } else if (params.category === "linen") {
    query.tags = { $in: ["linen"] }
  } else if (params.category === "cotton") {
    query.tags = { $in: ["cotton"] }
  } else if (params.category === "oversized") {
    query.tags = { $in: ["oversized", "relaxed"] }
  } else if (params.category === "premium") {
    query.isFeatured = true
  }

  const products = await Product.find(query).sort({ createdAt: -1 }).lean()
  const serialized = JSON.parse(JSON.stringify(products))

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vchuki.com" },
      { "@type": "ListItem", position: 2, name: "Shirts", item: "https://vchuki.com/shirts" },
      { "@type": "ListItem", position: 3, name: meta.h1, item: `https://vchuki.com/shirts/${params.category}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container py-4 md:py-8">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/shirts" className="hover:text-foreground">Shirts</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground capitalize">{params.category}</span>
        </nav>

        <div className="mb-6">
          <h1 className="text-xl md:text-3xl font-bold">{meta.h1}</h1>
          <p className="text-sm text-muted-foreground mt-1">{serialized.length} products available</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
          {serialized.map((product: any) => (
            <Link key={product._id} href={`/product/${product.slug}`} className="group block rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                <Image
                  src={product.images?.[0] || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"}
                  alt={`${product.name} - ${meta.h1} at VCHUKI`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-2.5 md:p-3">
                <h2 className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">{product.name}</h2>
                <p className="text-sm md:text-base font-bold text-primary mt-0.5">₹{product.basePrice?.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>

        {serialized.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No products in this category yet.</div>
        )}

        <section className="mt-12 text-sm text-muted-foreground max-w-3xl">
          <h2 className="text-base font-bold text-foreground mb-2">{meta.h1} at VCHUKI</h2>
          <p>{meta.content}</p>
        </section>
      </div>
    </>
  )
}
