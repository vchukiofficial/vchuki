import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import ComboOffer from "@/models/ComboOffer"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  await connectDB()
  const offers = await ComboOffer.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json({ offers })
}

export async function POST(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const body = await request.json()

  const offer = await ComboOffer.create({
    title: body.title,
    description: body.description,
    discount: body.discount,
    categories: body.categories,
    sizeGroup: body.sizeGroup || "all",
    minQty: body.minQty || 2,
    isActive: body.isActive ?? true,
    validFrom: body.validFrom || new Date(),
    validTo: body.validTo,
  })

  return NextResponse.json(offer, { status: 201 })
}
