import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const imagePool = [
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
  "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80",
  "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&q=80",
  "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80",
  "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
  "https://images.unsplash.com/photo-1625910513413-5fc421e0fd4f?w=600&q=80",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
  "https://images.unsplash.com/photo-1598033129183-c4f50c736c10?w=600&q=80",
  "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600&q=80",
  "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&q=80",
  "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=600&q=80",
]

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== "vchuki-seed-2026") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const db = mongoose.connection.db!

  // Update all products with 4-5 images
  const products = await db.collection("products").find({}).toArray()
  let updated = 0
  for (const product of products) {
    const images = shuffle(imagePool).slice(0, 4 + Math.floor(Math.random() * 2))
    await db.collection("products").updateOne({ _id: product._id }, { $set: { images } })
    updated++
  }

  // Add variants for products missing them
  const existingVariantProductIds = await db.collection("productvariants").distinct("product")
  const existingSet = new Set(existingVariantProductIds.map((id: any) => id.toString()))

  const colors = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy Blue", hex: "#1B2A4A" },
    { name: "Sky Blue", hex: "#87CEEB" },
    { name: "Black", hex: "#000000" },
    { name: "Olive Green", hex: "#556B2F" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Maroon", hex: "#800000" },
    { name: "Charcoal", hex: "#36454F" },
  ]
  const sizes = ["S", "M", "L", "XL", "XXL"]
  let variantsCreated = 0

  for (const product of products) {
    if (existingSet.has(product._id.toString())) continue

    const numColors = 3 + Math.floor(Math.random() * 3)
    const productColors = shuffle(colors).slice(0, numColors)
    const variants: any[] = []

    for (const color of productColors) {
      for (const size of sizes) {
        variants.push({
          product: product._id,
          color: { name: color.name, hex: color.hex },
          size,
          fabric: product.tags?.includes("linen") ? "100% Premium Linen" : product.tags?.includes("cotton") ? "100% Organic Cotton" : "Premium Cotton Blend",
          fit: product.tags?.includes("oversized") ? "relaxed" : Math.random() > 0.5 ? "slim" : "regular",
          stock: Math.floor(Math.random() * 80) + 10,
          priceAdjustment: size === "XXL" ? 100 : 0,
          sku: `VCH-${(product.slug || "").slice(0, 12)}-${color.name.toLowerCase().replace(/\s/g, "")}-${size}`,
          images: shuffle(imagePool).slice(0, 3),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    if (variants.length > 0) {
      await db.collection("productvariants").insertMany(variants)
      variantsCreated += variants.length
    }
  }

  return NextResponse.json({ success: true, productsUpdated: updated, variantsCreated })
}
