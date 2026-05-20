import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import mongoose from "mongoose"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== "vchuki-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const db = mongoose.connection.db!

  // Clear
  await Promise.all([
    db.collection("products").deleteMany({}),
    db.collection("productvariants").deleteMany({}),
    db.collection("users").deleteMany({}),
    db.collection("orders").deleteMany({}),
    db.collection("coupons").deleteMany({}),
    db.collection("reviews").deleteMany({}),
  ])

  // Users
  const hashedPassword = await bcrypt.hash("password123", 10)
  const usersResult = await db.collection("users").insertMany([
    { name: "Admin", email: "admin@vchuki.com", password: hashedPassword, role: "admin", addresses: [{ name: "Admin Office", street: "123 MG Road", city: "Mumbai", state: "Maharashtra", zip: "400001", phone: "9876543210" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
    { name: "Rahul Sharma", email: "rahul@example.com", password: hashedPassword, role: "user", addresses: [{ name: "Home", street: "45 Nehru Nagar", city: "Delhi", state: "Delhi", zip: "110001", phone: "9876543211" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
    { name: "Priya Patel", email: "priya@example.com", password: hashedPassword, role: "user", addresses: [{ name: "Home", street: "78 Koramangala", city: "Bangalore", state: "Karnataka", zip: "560034", phone: "9876543212" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
    { name: "Amit Kumar", email: "amit@example.com", password: hashedPassword, role: "user", addresses: [{ name: "Home", street: "12 Salt Lake", city: "Kolkata", state: "West Bengal", zip: "700091", phone: "9876543213" }], wishlist: [], createdAt: new Date(), updatedAt: new Date() },
  ])
  const userIds = Object.values(usersResult.insertedIds)

  // Products
  const productsData = [
    { name: "Classic Oxford Shirt", slug: "classic-oxford-shirt", description: "Premium cotton oxford shirt with button-down collar. Perfect for both casual and semi-formal occasions.", basePrice: 1499, category: "formal", tags: ["oxford", "cotton", "classic"], images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: "Slim Fit Linen Shirt", slug: "slim-fit-linen-shirt", description: "Breathable linen shirt ideal for summer. Slim fit with a modern spread collar.", basePrice: 1799, category: "casual", tags: ["linen", "summer", "slim"], images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: "Denim Casual Shirt", slug: "denim-casual-shirt", description: "Washed denim shirt with a relaxed fit. Great for weekend outings.", basePrice: 1299, category: "casual", tags: ["denim", "casual", "weekend"], images: ["https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: "Mandarin Collar Shirt", slug: "mandarin-collar-shirt", description: "Contemporary mandarin collar shirt in premium cotton. A modern twist on traditional style.", basePrice: 1599, category: "ethnic", tags: ["mandarin", "cotton", "modern"], images: ["https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: "Printed Hawaiian Shirt", slug: "printed-hawaiian-shirt", description: "Vibrant tropical print shirt for vacation vibes. Relaxed fit in rayon fabric.", basePrice: 999, category: "casual", tags: ["printed", "hawaiian", "vacation"], images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: "Formal White Shirt", slug: "formal-white-shirt", description: "Crisp white formal shirt with French cuffs. Essential for every wardrobe.", basePrice: 1899, category: "formal", tags: ["white", "formal", "french-cuff"], images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: "Flannel Check Shirt", slug: "flannel-check-shirt", description: "Warm flannel shirt with classic check pattern. Perfect for winter layering.", basePrice: 1399, category: "casual", tags: ["flannel", "check", "winter"], images: ["https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: "Polo Collar T-Shirt", slug: "polo-collar-tshirt", description: "Premium pique cotton polo with embroidered logo. Smart casual essential.", basePrice: 899, category: "casual", tags: ["polo", "cotton", "smart-casual"], images: ["https://images.unsplash.com/photo-1625910513413-5fc421e0fd4f?w=600"], isFeatured: true, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]
  const productsResult = await db.collection("products").insertMany(productsData)
  const productIds = Object.values(productsResult.insertedIds)

  // Variants
  const sizes = ["S", "M", "L", "XL", "XXL"]
  const colors = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#1B2A4A" },
    { name: "Sky Blue", hex: "#87CEEB" },
  ]
  const variants: any[] = []
  for (let pi = 0; pi < productIds.length; pi++) {
    for (const color of colors) {
      for (const size of sizes) {
        variants.push({
          product: productIds[pi],
          color,
          size,
          fabric: productsData[pi].category === "formal" ? "100% Cotton" : "Cotton Blend",
          fit: productsData[pi].tags.includes("slim") ? "slim" : "regular",
          stock: Math.floor(Math.random() * 50) + 5,
          priceAdjustment: size === "XXL" ? 100 : 0,
          sku: `${productsData[pi].slug}-${color.name.toLowerCase()}-${size}`.replace(/\s/g, "-"),
          images: productsData[pi].images,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }
  }
  await db.collection("productvariants").insertMany(variants)

  // Coupons
  const now = new Date()
  const future = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  await db.collection("coupons").insertMany([
    { code: "WELCOME10", type: "percentage", value: 10, maxValue: 200, minAmount: 500, validFrom: now, validTo: future, usageLimit: 1000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "FLAT200", type: "flat", value: 200, minAmount: 1500, validFrom: now, validTo: future, usageLimit: 500, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "SUMMER25", type: "percentage", value: 25, maxValue: 500, minAmount: 2000, validFrom: now, validTo: future, usageLimit: 200, usedBy: [], categories: ["casual"], isActive: true, createdAt: now, updatedAt: now },
    { code: "FREESHIP", type: "free_shipping", value: 0, minAmount: 999, validFrom: now, validTo: future, usageLimit: 1000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
    { code: "FIRST50", type: "first_order", value: 50, maxValue: 1000, minAmount: 1000, validFrom: now, validTo: future, usageLimit: 5000, usedBy: [], isActive: true, createdAt: now, updatedAt: now },
  ])

  // Orders
  await db.collection("orders").insertMany([
    { user: userIds[1], items: [{ product: productIds[0], variant: variants[0]._id, name: "Classic Oxford Shirt", price: 1499, quantity: 2, size: "M", color: "White" }], totalAmount: 2998, discountAmount: 200, finalAmount: 2798, couponCode: "FLAT200", shippingAddress: { name: "Rahul Sharma", street: "45 Nehru Nagar", city: "Delhi", state: "Delhi", zip: "110001", phone: "9876543211" }, paymentMethod: "razorpay", paymentStatus: "paid", shippingStatus: "delivered", timeline: [{ event: "Order placed", timestamp: new Date(Date.now() - 7 * 86400000) }, { event: "Shipped", timestamp: new Date(Date.now() - 4 * 86400000) }, { event: "Delivered", timestamp: new Date(Date.now() - 86400000) }], createdAt: new Date(Date.now() - 7 * 86400000), updatedAt: new Date() },
    { user: userIds[2], items: [{ product: productIds[1], name: "Slim Fit Linen Shirt", price: 1799, quantity: 1, size: "S", color: "Navy" }], totalAmount: 1799, discountAmount: 179, finalAmount: 1620, couponCode: "WELCOME10", shippingAddress: { name: "Priya Patel", street: "78 Koramangala", city: "Bangalore", state: "Karnataka", zip: "560034", phone: "9876543212" }, paymentMethod: "cod", paymentStatus: "pending", shippingStatus: "shipped", timeline: [{ event: "Order placed", timestamp: new Date(Date.now() - 3 * 86400000) }, { event: "Shipped", timestamp: new Date(Date.now() - 86400000) }], createdAt: new Date(Date.now() - 3 * 86400000), updatedAt: new Date() },
    { user: userIds[3], items: [{ product: productIds[5], name: "Formal White Shirt", price: 1899, quantity: 3, size: "L", color: "White" }], totalAmount: 5697, discountAmount: 500, finalAmount: 5197, couponCode: "SUMMER25", shippingAddress: { name: "Amit Kumar", street: "12 Salt Lake", city: "Kolkata", state: "West Bengal", zip: "700091", phone: "9876543213" }, paymentMethod: "razorpay", paymentStatus: "paid", shippingStatus: "pending", timeline: [{ event: "Order placed", timestamp: new Date() }], createdAt: new Date(), updatedAt: new Date() },
  ])

  // Reviews
  await db.collection("reviews").insertMany([
    { product: productIds[0], user: userIds[1], rating: 5, comment: "Excellent quality oxford shirt! Fabric feels premium and the fit is perfect.", verifiedPurchase: true, createdAt: new Date(), updatedAt: new Date() },
    { product: productIds[0], user: userIds[2], rating: 4, comment: "Good shirt, slightly tight around shoulders. Quality is great though.", verifiedPurchase: true, createdAt: new Date(), updatedAt: new Date() },
    { product: productIds[1], user: userIds[2], rating: 5, comment: "Perfect for summers! Very breathable and looks stylish.", verifiedPurchase: true, createdAt: new Date(), updatedAt: new Date() },
    { product: productIds[4], user: userIds[3], rating: 4, comment: "Fun print, great for beach trips. Fabric could be slightly better.", verifiedPurchase: true, createdAt: new Date(), updatedAt: new Date() },
    { product: productIds[5], user: userIds[3], rating: 5, comment: "Best formal shirt I own. French cuffs add a classy touch.", verifiedPurchase: true, createdAt: new Date(), updatedAt: new Date() },
    { product: productIds[7], user: userIds[1], rating: 4, comment: "Comfortable polo, good for daily wear. Color is vibrant.", verifiedPurchase: true, createdAt: new Date(), updatedAt: new Date() },
  ])

  return NextResponse.json({
    success: true,
    data: {
      users: 4,
      products: 8,
      variants: variants.length,
      coupons: 5,
      orders: 3,
      reviews: 6,
    }
  })
}
