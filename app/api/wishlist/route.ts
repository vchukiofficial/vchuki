import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ wishlist: [] })

  await connectDB()
  const user = await User.findById(session.user.id).select("wishlist").lean()
  return NextResponse.json({ wishlist: user?.wishlist || [] })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 })

  await connectDB()
  const { productId } = await request.json()
  if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 })

  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const index = user.wishlist.indexOf(productId)
  if (index > -1) {
    user.wishlist.splice(index, 1)
  } else {
    user.wishlist.push(productId)
  }
  await user.save()

  return NextResponse.json({ wishlist: user.wishlist, added: index === -1 })
}
