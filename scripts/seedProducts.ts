import mongoose from "mongoose"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const MONGODB_URI = process.env.MONGODB_URI!

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  basePrice: Number,
  category: String,
  tags: [String],
  images: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true })

const ProductVariantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  color: { name: String, hex: String },
  size: String,
  fabric: String,
  fit: { type: String, enum: ["slim", "regular", "relaxed"] },
  stock: { type: Number, default: 0 },
  priceAdjustment: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true },
  images: [String],
}, { timestamps: true })

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema)
const ProductVariant = mongoose.models.ProductVariant || mongoose.model("ProductVariant", ProductVariantSchema)

// Color definitions with their image paths in /public/
const COLORS = [
  { name: "Ivory White", hex: "#F5F3EE", image: "/white.png" },
  { name: "Sand Beige", hex: "#DCCEB8", image: "/Beige.png" },
  { name: "Soft Mustard", hex: "#D8BF62", image: "/Yellow.png" },
  { name: "Heritage Olive", hex: "#8A8F63", image: "/Olive Green.png" },
  { name: "Powder Sky Blue", hex: "#BFD7EA", image: "/Sky Blue.png" },
]

const SIZES = ["S", "M", "L", "XL", "XXL"]

async function main() {
  console.log("\n🔗 Connecting to MongoDB...")
  await mongoose.connect(MONGODB_URI)
  console.log("  ✓ Connected\n")

  // Check if product already exists
  const existing = await Product.findOne({ slug: "vchuki-premium-linen-full-sleeve-shirt" })
  if (existing) {
    console.log("  ⚠ Product already exists. Deleting old one + variants...")
    await ProductVariant.deleteMany({ product: existing._id })
    await Product.deleteOne({ _id: existing._id })
  }

  // All images for the product
  const allImages = [
    "/skyblue.png",
    ...COLORS.map(c => c.image),
    "/Linenproductwity6imagelayout.png",
  ]

  // Create the main product
  console.log("🛍️  Creating product...")
  const product = await Product.create({
    name: "VCHUKI Premium Linen Full Sleeve Shirt",
    slug: "vchuki-premium-linen-full-sleeve-shirt",
    description: "Crafted from 100% premium linen sourced from the finest mills. This full-sleeve shirt embodies the heritage of Rajasthan's textile traditions — reimagined for the modern man. Breathable, soft, and designed for all-day comfort with effortless style. Each piece passes 47 quality checks. No shortcuts. No compromises.",
    basePrice: 799,
    category: "linen",
    tags: ["linen", "premium", "full-sleeve", "bestseller", "new-launch", "summer"],
    images: allImages,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 142,
  })
  console.log(`  ✓ Product created: ${product.name} (${product._id})`)

  // Create variants for each color × size
  console.log("\n🎨 Creating color & size variants...")
  let variantCount = 0

  for (const color of COLORS) {
    for (const size of SIZES) {
      const priceAdj = size === "XXL" ? 100 : size === "XL" ? 50 : 0
      const stock = size === "M" || size === "L" ? 80 : size === "XL" ? 60 : size === "S" ? 50 : 30

      await ProductVariant.create({
        product: product._id,
        color: { name: color.name, hex: color.hex },
        size,
        fabric: "100% Premium Linen",
        fit: "regular",
        stock,
        priceAdjustment: priceAdj,
        sku: `VC-LINEN-${color.name.replace(/\s+/g, "-").toUpperCase()}-${size}`,
        images: [color.image],
      })
      variantCount++
    }
    console.log(`  ✓ ${color.name}: ${SIZES.length} sizes created`)
  }

  // Print summary
  console.log("\n" + "=".repeat(50))
  console.log("✅ SEED COMPLETE")
  console.log("=".repeat(50))
  console.log(`Product: ${product.name}`)
  console.log(`ID: ${product._id}`)
  console.log(`Price: ₹${product.basePrice}`)
  console.log(`Colors: ${COLORS.map(c => c.name).join(", ")}`)
  console.log(`Sizes: ${SIZES.join(", ")}`)
  console.log(`Total Variants: ${variantCount} (${COLORS.length} colors × ${SIZES.length} sizes)`)
  console.log("=".repeat(50))

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error("❌ Error:", err)
  process.exit(1)
})
