import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const shirtNames = {
  formal: ["Classic Oxford", "French Cuff Dress", "Slim Fit Formal", "Spread Collar", "Pinpoint Oxford", "Herringbone Weave", "Twill Formal", "Poplin Dress", "Dobby Texture", "Royal Oxford", "Cutaway Collar", "Tab Collar", "Wing Tip Formal", "Marcella Dress", "Pleated Front"],
  casual: ["Washed Denim", "Flannel Check", "Brushed Cotton", "Chambray", "Corduroy", "Camp Collar", "Cuban Collar", "Bowling", "Utility Pocket", "Garment Dyed", "Acid Wash", "Distressed Denim", "Patch Work", "Color Block", "Tie Dye"],
  linen: ["Pure Linen", "Linen Blend", "Washed Linen", "Crinkle Linen", "Linen Mandarin", "Resort Linen", "Beach Linen", "Relaxed Linen", "Linen Camp", "Linen Kurta", "Linen Band Collar", "Linen Henley", "Summer Linen", "Coastal Linen", "Tropical Linen"],
  cotton: ["Premium Cotton", "Egyptian Cotton", "Supima Cotton", "Organic Cotton", "Pima Cotton", "Sea Island Cotton", "Brushed Cotton", "Cotton Twill", "Cotton Satin", "Cotton Voile", "Cotton Dobby", "Cotton Jacquard", "Cotton Chambray", "Cotton Flannel", "Cotton Poplin"],
  oversized: ["Drop Shoulder", "Boxy Fit", "Street Oversized", "Relaxed Drop", "Wide Body", "Skater Fit", "Urban Oversized", "Layered Oversized", "Graphic Oversized", "Minimal Oversized", "Washed Oversized", "Vintage Oversized", "Raw Hem", "Cropped Oversized", "Longline"],
  premium: ["Silk Blend", "Cashmere Touch", "Italian Weave", "Japanese Selvedge", "Swiss Cotton", "Limited Edition", "Artisan Craft", "Hand Stitched", "Monogram", "Bespoke Fit", "Gold Thread", "Midnight Luxe", "Platinum Series", "Heritage Collection", "Signature Series"],
  ethnic: ["Mandarin Collar", "Nehru Collar", "Kurta Style", "Indo Western", "Bandhgala", "Angrakha", "Pathani", "Jodhpuri", "Sherwani Style", "Ikat Print", "Block Print", "Kalamkari", "Chikankari", "Lucknowi", "Ajrakh"],
}

const colors = [
  { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" },
  { name: "Navy", hex: "#1B2A4A" }, { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Olive", hex: "#556B2F" }, { name: "Maroon", hex: "#800000" },
  { name: "Charcoal", hex: "#36454F" }, { name: "Beige", hex: "#F5F5DC" },
  { name: "Sage Green", hex: "#9CAF88" }, { name: "Dusty Rose", hex: "#DCAE96" },
  { name: "Lavender", hex: "#E6E6FA" }, { name: "Terracotta", hex: "#E2725B" },
]

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"]

const images: Record<string, string[]> = {
  formal: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  ],
  casual: [
    "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600",
    "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
  ],
  linen: [
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
  ],
  cotton: [
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  ],
  oversized: [
    "https://images.unsplash.com/photo-1625910513413-5fc421e0fd4f?w=600",
    "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600",
    "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600",
  ],
  premium: [
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
    "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600",
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600",
  ],
  ethnic: [
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
  ],
}

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pickAny(arr: any[]): any { return arr[Math.floor(Math.random() * arr.length)] }

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== "vchuki-seed-2026-CONFIRM-DELETE-ALL") {
    return NextResponse.json({ error: "Unauthorized. This will DELETE ALL DATA. Use correct secret." }, { status: 401 })
  }

  await connectDB()
  const db = mongoose.connection.db!

  await Promise.all([
    db.collection("products").deleteMany({}),
    db.collection("productvariants").deleteMany({}),
    db.collection("users").deleteMany({}),
    db.collection("orders").deleteMany({}),
    db.collection("coupons").deleteMany({}),
    db.collection("reviews").deleteMany({}),
  ])

  // Users
  const hash = await bcrypt.hash("password123", 10)
  const usersResult = await db.collection("users").insertMany([
    { name: "Admin", email: "admin@vchuki.com", password: hash, role: "admin", addresses: [{ name: "VCHUKI HQ", street: "123 Fashion Street", city: "Mumbai", state: "Maharashtra", zip: "400001", phone: "9252891189" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
    { name: "Rahul Sharma", email: "rahul@example.com", password: hash, role: "user", addresses: [{ name: "Home", street: "45 Nehru Nagar", city: "Delhi", state: "Delhi", zip: "110001", phone: "9876543211" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
    { name: "Priya Patel", email: "priya@example.com", password: hash, role: "user", addresses: [{ name: "Home", street: "78 Koramangala", city: "Bangalore", state: "Karnataka", zip: "560034", phone: "9876543212" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
    { name: "Amit Kumar", email: "amit@example.com", password: hash, role: "user", addresses: [{ name: "Home", street: "12 Salt Lake", city: "Kolkata", state: "West Bengal", zip: "700091", phone: "9876543213" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
    { name: "Vikram Singh", email: "vikram@example.com", password: hash, role: "user", addresses: [{ name: "Home", street: "56 Civil Lines", city: "Jaipur", state: "Rajasthan", zip: "302001", phone: "9876543214" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
  ])
  const userIds = Object.values(usersResult.insertedIds)

  // Generate 500 products
  const allProducts: any[] = []
  const cats = Object.keys(shirtNames) as (keyof typeof shirtNames)[]
  let productIndex = 0

  for (const category of cats) {
    const names = shirtNames[category]
    const suffixes = ["Shirt", "Shirt", "Shirt", "Shirt", "Shirt"]
    const adjectives = ["Premium", "Classic", "Modern", "Signature", "Essential", "Luxe", "Elite", "Royal", "Urban", "Heritage"]
    const colorNames = ["White", "Navy", "Black", "Blue", "Olive", "Beige", "Grey", "Sage", "Rust", "Cream"]

    for (let i = 0; i < names.length; i++) {
      for (let v = 0; v < 5; v++) {
        productIndex++
        const adj = pick(adjectives)
        const colorName = colorNames[v % colorNames.length]
        const name = `${adj} ${names[i]} ${suffixes[0]} - ${colorName}`
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

        const basePrice = category === "premium" ? rand(2499, 4999) :
          category === "linen" ? rand(1499, 2999) :
          category === "formal" ? rand(1299, 2499) :
          category === "ethnic" ? rand(1199, 2299) :
          category === "oversized" ? rand(999, 1999) :
          rand(799, 1799)

        const isFeatured = productIndex % 5 === 0
        const isBestseller = productIndex % 7 === 0
        const isNewLaunch = productIndex % 3 === 0

        const tags: string[] = [category]
        if (isBestseller) tags.push("bestseller")
        if (isNewLaunch) tags.push("new-launch", "new")
        if (isFeatured) tags.push("featured")
        if (category === "linen") tags.push("linen", "summer")
        if (category === "cotton") tags.push("cotton", "comfort")
        if (category === "formal") tags.push("office", "business")
        if (category === "casual") tags.push("weekend", "relaxed")
        if (category === "premium") tags.push("luxury", "exclusive")
        if (category === "oversized") tags.push("streetwear", "trendy")
        if (category === "ethnic") tags.push("traditional", "indian")

        const catImages = images[category] || images.formal
        const productImages = [catImages[v % catImages.length]]

        allProducts.push({
          name,
          slug: slug + "-" + productIndex,
          description: `${name} from VCHUKI's ${category} collection. Crafted with premium ${category === "linen" ? "linen" : category === "cotton" ? "100% cotton" : "fabric"} for exceptional comfort and style. Perfect for ${category === "formal" ? "office and business meetings" : category === "casual" ? "everyday wear and weekends" : category === "ethnic" ? "traditional occasions and festivals" : "making a statement"}. Available in multiple sizes.`,
          basePrice,
          category: ["formal", "casual", "ethnic"].includes(category) ? category : category === "linen" || category === "cotton" ? "casual" : category === "premium" ? "formal" : "casual",
          tags,
          images: productImages,
          isFeatured,
          isActive: true,
          rating: (rand(35, 50) / 10),
          reviewCount: rand(5, 150),
          createdAt: isNewLaunch ? new Date(Date.now() - rand(0, 7) * 86400000) : new Date(Date.now() - rand(7, 90) * 86400000),
          updatedAt: new Date(),
        })
      }
    }
  }

  // Insert in batches
  for (let i = 0; i < allProducts.length; i += 100) {
    await db.collection("products").insertMany(allProducts.slice(i, i + 100))
  }

  // Generate variants for first 100 products (to keep it manageable)
  const insertedProducts = await db.collection("products").find().limit(100).toArray()
  const variants: any[] = []
  for (const product of insertedProducts) {
    const productColors = colors.slice(0, rand(3, 5))
    for (const color of productColors) {
      for (const size of sizes.slice(1, 6)) { // S to XXL
        variants.push({
          product: product._id,
          color,
          size,
          fabric: product.tags?.includes("linen") ? "100% Linen" : product.tags?.includes("cotton") ? "100% Cotton" : "Cotton Blend",
          fit: product.tags?.includes("oversized") ? "relaxed" : product.tags?.includes("slim") ? "slim" : "regular",
          stock: rand(5, 100),
          priceAdjustment: size === "XXL" ? 100 : size === "3XL" ? 200 : 0,
          sku: `${product.slug}-${color.name.toLowerCase()}-${size}`.replace(/\s/g, "-"),
          images: product.images,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }
  for (let i = 0; i < variants.length; i += 500) {
    await db.collection("productvariants").insertMany(variants.slice(i, i + 500))
  }

  // Coupons
  const now = new Date()
  const future = new Date("2026-07-31")
  await db.collection("coupons").insertMany([
    { code: "LAUNCH20", type: "percentage", value: 20, maxValue: 500, minAmount: 999, validFrom: now, validTo: future, usageLimit: 10000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "WELCOME10", type: "percentage", value: 10, maxValue: 300, minAmount: 500, validFrom: now, validTo: future, usageLimit: 50000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "FLAT300", type: "flat", value: 300, minAmount: 1999, validFrom: now, validTo: future, usageLimit: 5000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "FIRST50", type: "first_order", value: 50, maxValue: 1000, minAmount: 999, validFrom: now, validTo: future, usageLimit: 100000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "FREESHIP", type: "free_shipping", value: 0, minAmount: 499, validFrom: now, validTo: future, usageLimit: 100000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "PREMIUM15", type: "percentage", value: 15, maxValue: 750, minAmount: 2499, validFrom: now, validTo: future, usageLimit: 2000, usedBy: [], categories: ["premium"], isActive: true, createdAt: now, updatedAt: now },
    { code: "JULY7", type: "percentage", value: 7, maxValue: 200, minAmount: 700, validFrom: new Date("2026-07-07"), validTo: new Date("2026-07-08"), usageLimit: 7777, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
  ])

  // Reviews
  const reviewProducts = await db.collection("products").find().limit(50).toArray()
  const reviewComments = [
    "Absolutely love this shirt! The fabric quality is outstanding.",
    "Perfect fit, exactly as described. Will buy more colors.",
    "Best shirt I've bought online. Premium feel at a great price.",
    "The stitching quality is top-notch. Very impressed with VCHUKI.",
    "Comfortable all day long. Great for Indian weather.",
    "Received so many compliments wearing this. Highly recommend!",
    "Color is exactly as shown. No fading after multiple washes.",
    "Excellent value for money. Better than many expensive brands.",
    "The fit is perfect for Indian body types. Finally!",
    "Ordered 3 more after trying the first one. Addicted to VCHUKI.",
    "Breathable fabric, perfect for Mumbai summers.",
    "Office colleagues asked where I got this. Premium look!",
    "Gift for my husband, he absolutely loves it.",
    "Fast delivery, great packaging, amazing product.",
    "This is now my go-to brand for shirts. Quality is consistent.",
  ]

  const reviews: any[] = []
  for (const product of reviewProducts) {
    const numReviews = rand(2, 6)
    for (let i = 0; i < numReviews; i++) {
      reviews.push({
        product: product._id,
        user: pick(userIds),
        rating: rand(4, 5),
        comment: pick(reviewComments),
        verifiedPurchase: true,
        createdAt: new Date(Date.now() - rand(1, 60) * 86400000),
        updatedAt: new Date(),
      })
    }
  }
  await db.collection("reviews").insertMany(reviews)

  // Orders
  const orderProducts = await db.collection("products").find().limit(20).toArray()
  const orders: any[] = []
  for (let i = 0; i < 25; i++) {
    const user = pick(userIds)
    const numItems = rand(1, 3)
    const items = []
    let total = 0
    for (let j = 0; j < numItems; j++) {
      const p = pick(orderProducts)
      const qty = rand(1, 2)
      items.push({ product: p._id, name: p.name, price: p.basePrice, quantity: qty, size: pick(sizes.slice(1, 5)), color: pick(colors).name })
      total += p.basePrice * qty
    }
    const discount = rand(0, 300)
    const statuses: string[] = ["pending", "shipped", "delivered", "delivered", "delivered"]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    orders.push({
      user,
      items,
      totalAmount: total,
      discountAmount: discount,
      finalAmount: total - discount,
      shippingAddress: { name: "Customer", street: `${rand(1, 200)} Street`, city: pick(["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad"]), state: "India", zip: `${rand(100000, 999999)}`, phone: `98${rand(10000000, 99999999)}` },
      paymentMethod: pick(["razorpay", "cod", "razorpay"]),
      paymentStatus: status === "delivered" ? "paid" : pick(["paid", "pending"]),
      shippingStatus: status,
      timeline: [
        { event: "Order placed", timestamp: new Date(Date.now() - rand(5, 30) * 86400000) },
        ...(status !== "pending" ? [{ event: "Shipped", timestamp: new Date(Date.now() - rand(2, 5) * 86400000) }] : []),
        ...(status === "delivered" ? [{ event: "Delivered", timestamp: new Date(Date.now() - rand(0, 2) * 86400000) }] : []),
      ],
      createdAt: new Date(Date.now() - rand(5, 30) * 86400000),
      updatedAt: new Date(),
    })
  }
  await db.collection("orders").insertMany(orders)

  return NextResponse.json({
    success: true,
    data: {
      users: 5,
      products: allProducts.length,
      variants: variants.length,
      coupons: 7,
      orders: 25,
      reviews: reviews.length,
    },
    message: `Seeded ${allProducts.length} products for July 7 launch!`
  })
}
