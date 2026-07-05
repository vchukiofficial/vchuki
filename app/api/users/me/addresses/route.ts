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
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const makeDefault = address.isDefault || user.addresses.length === 0
  if (makeDefault) {
    user.addresses.forEach((a: any) => { a.isDefault = false })
  }
  user.addresses.push({ ...address, isDefault: makeDefault })
  await user.save()

  return NextResponse.json({ addresses: user.addresses })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { addressId } = await request.json()
  await connectDB()
  const user = await User.findById(session.user.id)
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const target = user.addresses.id(addressId)
  if (!target) return NextResponse.json({ error: "Address not found" }, { status: 404 })

  user.addresses.forEach((a: any) => { a.isDefault = false })
  target.isDefault = true
  await user.save()

  return NextResponse.json({ addresses: user.addresses })
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const addressId = searchParams.get("addressId")

  await connectDB()
  const user = await User.findById(session.user.id)
  if (user && addressId) {
    const wasDefault = user.addresses.id(addressId)?.isDefault
    user.addresses.pull({ _id: addressId })
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true
    }
    await user.save()
  }

  return NextResponse.json({ addresses: user?.addresses || [] })
}
