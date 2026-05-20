import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id).select("addresses").lean()
  return NextResponse.json({ addresses: (user as any)?.addresses || [] })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const address = await request.json()
  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $push: { addresses: address } },
    { new: true }
  ).select("addresses")

  return NextResponse.json({ addresses: user?.addresses || [] })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const index = Number(searchParams.get("index"))

  await connectDB()
  const user = await User.findById(session.user.id)
  if (user) {
    user.addresses.splice(index, 1)
    await user.save()
  }

  return NextResponse.json({ addresses: user?.addresses || [] })
}
