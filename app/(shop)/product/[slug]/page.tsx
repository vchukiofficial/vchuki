import { Metadata } from "next"
import { notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"
import Review from "@/models/Review"
import ProductDetailClient from "@/components/products/ProductDetailClient"
import ProductRecommendations from "@/components/products/ProductRecommendations"
import Link from "next/link"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connectDB()
  const product = await Product.findOne({ slug: params.slug }).lean()
  if (!product) return { title: "Not Found" }

  const p = product as any
  return {
    title: `${p.name} — Buy Online at ₹${p.basePrice}`,
    description: `${p.description} Shop ${p.name} at VCHUKI. Premium quality, free shipping above ₹1,599. Available in multiple sizes and colors.`,
    keywords: [p.name, p.category, ...p.tags, "buy online", "vchuki"],
    alternates: { canonical: `https://vchuki.com/product/${p.slug}` },
    openGraph: {
      title: `${p.name} — ₹${p.basePrice} | VCHUKI`,
      description: p.description,
      url: `https://vchuki.com/product/${p.slug}`,
      images: p.images?.[0] ? [{ url: p.images[0], width: 600, height: 800, alt: p.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} — ₹${p.basePrice}`,
      description: p.description,
      images: p.images?.[0] ? [p.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  await connectDB()

  const product = await Product.findOne({ slug: params.slug, isActive: true }).lean()
  if (!product) notFound()

  const p = product as any
  const variants = await ProductVariant.find({ product: p._id }).lean()
  
  let reviews: any[] = []
  try {
    reviews = await Review.find({ product: p._id, status: { $ne: "hidden" } }).populate("user", "name").lean()
  } catch {
    // If populate fails (deleted users), fetch without populate
    try {
      reviews = await Review.find({ product: p._id, status: { $ne: "hidden" } }).lean()
    } catch {
      reviews = []
    }
  }

  // Fetch sibling products (same category, different colors) for color swatches
  const siblingProducts = await Product.find({ category: p.category, _id: { $ne: p._id }, isActive: true }).select("name slug").lean()
  const siblingColors: { name: string; hex: string; slug: string }[] = []
  for (const sib of siblingProducts) {
    const sibAny = sib as any
    const firstVariant = await ProductVariant.findOne({ product: sibAny._id }).select("color").lean() as any
    if (firstVariant?.color) {
      siblingColors.push({ name: firstVariant.color.name, hex: firstVariant.color.hex, slug: sibAny.slug })
    }
  }

  const avgRating = (reviews && reviews.length > 0)
    ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviews.length
    : 0

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images,
    brand: { "@type": "Brand", name: "VCHUKI" },
    sku: p.slug,
    url: `https://vchuki.com/product/${p.slug}`,
    offers: {
      "@type": "Offer",
      price: p.basePrice,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "VCHUKI" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: p.basePrice >= 1599 ? 0 : 50, currency: "INR" },
        deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" }, transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" } },
      },
    },
    ...(reviews.length > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating.toFixed(1), reviewCount: reviews.length },
      review: reviews.slice(0, 5).map((r: any) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.user?.name || "Customer" },
        reviewRating: { "@type": "Rating", ratingValue: r.rating },
        reviewBody: r.comment || "",
      })),
    }),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://vchuki.com" },
      { "@type": "ListItem", position: 2, name: "Shirts", item: "https://vchuki.com/shirts" },
      { "@type": "ListItem", position: 3, name: p.category, item: `https://vchuki.com/shirts/${p.category}` },
      { "@type": "ListItem", position: 4, name: p.name, item: `https://vchuki.com/product/${p.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="container py-4 md:py-6">
        <nav className="text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/shirts" className="hover:text-foreground">Shirts</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/shirts/${p.category}`} className="hover:text-foreground capitalize">{p.category}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{p.name}</span>
        </nav>
      </div>

      <ProductDetailClient
        product={JSON.parse(JSON.stringify(product))}
        variants={JSON.parse(JSON.stringify(variants))}
        reviews={JSON.parse(JSON.stringify(reviews))}
        siblingColors={siblingColors}
      />

      <ProductRecommendations
        currentProductId={p._id.toString()}
        currentCategory={p.category}
      />
    </>
  )
}
