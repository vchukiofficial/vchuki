import { notFound } from "next/navigation"
import connectDB from "@/lib/mongodb"
import Product from "@/models/Product"
import ProductVariant from "@/models/ProductVariant"
import Review from "@/models/Review"
import ProductDetailClient from "@/components/products/ProductDetailClient"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  await connectDB()
  const product = await Product.findOne({ slug: params.slug }).lean()
  if (!product) return { title: "Not Found" }
  return {
    title: `${(product as any).name} — VCHUKI`,
    description: (product as any).description,
  }
}

export default async function ProductPage({ params }: Props) {
  await connectDB()

  const product = await Product.findOne({ slug: params.slug, isActive: true }).lean()
  if (!product) notFound()

  const variants = await ProductVariant.find({ product: (product as any)._id }).lean()
  const reviews = await Review.find({ product: (product as any)._id }).populate("user", "name").lean()

  const data = {
    product: JSON.parse(JSON.stringify(product)),
    variants: JSON.parse(JSON.stringify(variants)),
    reviews: JSON.parse(JSON.stringify(reviews)),
  }

  return <ProductDetailClient {...data} />
}
