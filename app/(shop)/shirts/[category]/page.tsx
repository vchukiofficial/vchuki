import { Metadata } from "next"
import { notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import Link from "next/link"
import { ShirtsProductGrid } from "@/components/products/ShirtsProductGrid"

const categoryMeta: Record<string, { title: string; description: string; h1: string; content: string }> = {
  "linen-full-sleeve": {
    title: "Linen Full Sleeve Shirts for Men — Premium Breathable Shirts | VCHUKI",
    description: "Shop premium linen full sleeve shirts for men at VCHUKI. Breathable, lightweight & crafted in Jodhpur. Free shipping above ₹999.",
    h1: "Linen Full Sleeve Shirts",
    content: "Stay cool and stylish with VCHUKI's premium linen full sleeve shirts. Made from 100% natural linen, breathable and perfect for Indian summers. Crafted in Jodhpur with Rajasthan's finest textile heritage.",
  },
  "linen-half-sleeve": {
    title: "Linen Half Sleeve Shirts for Men — Summer Essentials | VCHUKI",
    description: "Buy premium linen half sleeve shirts for men online at VCHUKI. Perfect for summer. Lightweight & breathable. Free shipping.",
    h1: "Linen Half Sleeve Shirts",
    content: "Embrace summer with VCHUKI's linen half sleeve shirts. Lightweight, breathable, and designed for the modern man who values comfort without compromising on style.",
  },
  "kurta-full-sleeve": {
    title: "Linen Short Kurtas Full Sleeve — Modern Ethnic Wear | VCHUKI",
    description: "Shop premium linen short kurtas with full sleeves at VCHUKI. Modern ethnic wear crafted in Jodhpur. Free shipping above ₹999.",
    h1: "Linen Short Kurtas — Full Sleeve",
    content: "Discover VCHUKI's modern linen short kurtas with full sleeves. A perfect fusion of Rajasthani heritage and contemporary fashion. Ideal for festivals, office, and everyday ethnic style.",
  },
  "kurta-half-sleeve": {
    title: "Linen Short Kurtas Half Sleeve — Casual Ethnic | VCHUKI",
    description: "Buy premium linen short kurtas with half sleeves at VCHUKI. Casual ethnic wear for modern men. Free shipping above ₹999.",
    h1: "Linen Short Kurtas — Half Sleeve",
    content: "VCHUKI's half sleeve linen short kurtas bring effortless ethnic style to your wardrobe. Breathable, comfortable, and crafted with premium linen for all-day ease.",
  },
  linen: {
    title: "Linen Shirts for Men — Breathable Summer Shirts Online | VCHUKI",
    description: "Buy premium linen shirts for men online at VCHUKI. Breathable, lightweight & perfect for Indian summers. Free shipping.",
    h1: "Linen Shirts for Men",
    content: "Stay cool and stylish with VCHUKI's premium linen shirts. Made from 100% natural linen, breathable and perfect for Indian summers.",
  },
}

interface Props {
  params: { category: string }
}

export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = categoryMeta[params.category]
  if (!meta) return { title: "Not Found" }
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `https://vchuki.com/shirts/${params.category}` },
  }
}

export default async function CategoryPage({ params }: Props) {
  const meta = categoryMeta[params.category]
  if (!meta) notFound()

  await connectDB()

  const query: Record<string, any> = { isActive: true }
  if (params.category === "linen-full-sleeve") {
    query.tags = { $in: ["linen", "full-sleeve"] }
  } else if (params.category === "linen-half-sleeve") {
    query.tags = { $in: ["half-sleeve"] }
  } else if (params.category === "kurta-full-sleeve") {
    query.tags = { $in: ["kurta", "full-sleeve"] }
  } else if (params.category === "kurta-half-sleeve") {
    query.tags = { $in: ["kurta", "half-sleeve"] }
  } else if (params.category === "linen") {
    query.$or = [{ tags: { $in: ["linen"] } }, { category: "linen" }]
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
