import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import ComboOffer from "@/models/ComboOffer"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  const body = await request.json()
  const offer = await ComboOffer.findByIdAndUpdate(params.id, body, { new: true })
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(offer)
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()
  await ComboOffer.findByIdAndDelete(params.id)
  return NextResponse.json({ success: true })
}
