import { Metadata } from "next"
import { notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import Link from "next/link"
import { ShirtsProductGrid } from "@/components/products/ShirtsProductGrid"

const categoryMeta: Record<string, { title: string; description: string; h1: string; content: string }> = {
  formal: {
    title: "Formal Shirts for Men — Office & Business Wear",
    description: "Shop premium formal shirts for men at VCHUKI. Oxford shirts, dress shirts, French cuff shirts. Free shipping above ₹999.",
    h1: "Formal Shirts for Men",
    content: "Elevate your professional wardrobe with VCHUKI's premium formal shirts. Crafted from 100% cotton with meticulous attention to detail.",
  },
  casual: {
    title: "Casual Shirts for Men — Everyday Style",
    description: "Explore casual shirts for men at VCHUKI. Comfortable fits for everyday wear. Shop now with free shipping.",
    h1: "Casual Shirts for Men",
    content: "Discover comfortable and stylish casual shirts at VCHUKI. Designed for weekends, outings, and everyday style.",
  },
  linen: {
    title: "Linen Shirts for Men — Breathable Summer Shirts Online",
    description: "Buy premium linen shirts for men online at VCHUKI. Breathable, lightweight & perfect for Indian summers. Free shipping.",
    h1: "Linen Shirts for Men",
    content: "Stay cool and stylish with VCHUKI's premium linen shirts. Made from 100% natural linen, breathable and perfect for Indian summers.",
  },
  cotton: {
    title: "Cotton Shirts for Men — Premium 100% Cotton",
    description: "Shop 100% cotton shirts for men at VCHUKI. Soft, durable & comfortable. Premium quality at great prices.",
    h1: "Cotton Shirts for Men",
    content: "Experience the comfort of pure cotton with VCHUKI's premium cotton shirt collection.",
  },
  oversized: {
    title: "Oversized Shirts for Men — Relaxed Fit",
    description: "Shop trendy oversized shirts for men at VCHUKI. Relaxed fit & modern streetwear style. Free shipping above ₹999.",
    h1: "Oversized Shirts for Men",
    content: "Make a statement with VCHUKI's oversized shirt collection. Drop shoulders, relaxed fits, and contemporary designs.",
  },
  premium: {
    title: "Premium Collection — Luxury Shirts for Men",
    description: "Explore VCHUKI's premium luxury shirt collection. Handcrafted with the finest fabrics. Limited edition pieces.",
    h1: "Premium Collection",
    content: "Indulge in luxury with VCHUKI's Premium Collection. Each piece is handcrafted using the finest imported fabrics.",
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
  }
}

export function generateStaticParams() {
  return Object.keys(categoryMeta).map((category) => ({ category }))
}

export default async function CategoryPage({ params }: Props) {
  const meta = categoryMeta[params.category]
  if (!meta) notFound()

  await connectDB()

  const query: Record<string, any> = { isActive: true }
  if (["formal", "casual", "ethnic"].includes(params.category)) {
    query.category = params.category
  } else if (params.category === "linen") {
    query.$or = [{ tags: { $in: ["linen"] } }, { category: "linen" }]
  } else if (params.category === "cotton") {
    query.tags = { $in: ["cotton"] }
  } else if (params.category === "oversized") {
    query.tags = { $in: ["oversized", "relaxed"] }
  } else if (params.category === "premium") {
    query.$or = [{ category: "premium" }, { tags: { $in: ["premium"] } }]
  }

  const products = await Product.find(query).sort({ createdAt: -1 }).lean()
  const serialized = JSON.parse(JSON.stringify(products))

  return (
    <div className="container py-4 md:py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="mx-1.5 text-border">/</span>
        <Link href="/shirts" className="hover:text-foreground transition-colors">Shirts</Link>
        <span className="mx-1.5 text-border">/</span>
        <span className="text-foreground capitalize">{params.category}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-light tracking-tight text-foreground">{meta.h1}</h1>
        <p className="text-xs text-muted-foreground mt-1">{serialized.length} products available · Free shipping above ₹999</p>
      </div>

      {/* Products with Add to Cart */}
      <ShirtsProductGrid products={serialized} />

      {serialized.length === 0 && (
        <div className="text-center py-16 border border-border">
          <p className="text-muted-foreground text-sm">No products in this category yet.</p>
          <Link href="/shirts" className="text-xs text-[#c4956a] mt-2 inline-block hover:underline">Browse all shirts →</Link>
        </div>
      )}

      {/* SEO */}
      <section className="mt-12 text-sm text-muted-foreground max-w-2xl">
        <h2 className="text-base font-medium text-foreground mb-2">{meta.h1} at VCHUKI</h2>
        <p>{meta.content}</p>
      </section>
    </div>
  )
}
