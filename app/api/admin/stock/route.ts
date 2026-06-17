import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ProductVariant from "@/models/ProductVariant"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  await connectDB()

  const [totalVariants, soldOut, lowStock, allVariants] = await Promise.all([
    ProductVariant.countDocuments(),
    ProductVariant.countDocuments({ stock: 0 }),
    ProductVariant.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    ProductVariant.find({ stock: { $lte: 10 } }).populate("product", "name slug").sort({ stock: 1 }).limit(50).lean(),
  ])

  const totalStock = await ProductVariant.aggregate([{ $group: { _id: null, total: { $sum: "$stock" } } }])

  return NextResponse.json({
    stats: {
      totalVariants,
      totalStock: totalStock[0]?.total || 0,
      soldOut,
      lowStock,
      healthy: totalVariants - soldOut - lowStock,
    },
    alerts: allVariants.map((v: any) => ({
      _id: v._id,
      product: v.product?.name || "Unknown",
      productSlug: v.product?.slug || "",
      color: v.color?.name || "Default",
      size: v.size,
      stock: v.stock,
      sku: v.sku,
    })),
  })
}
