import { NextRequest, NextResponse } from "next/server"
import { sessionFor } from "@/lib/mobileAuth"
import connectDB from "@/lib/mongodb"
import HeroVideo from "@/models/HeroVideo"

export async function GET(request: NextRequest) {
  await connectDB()
  const videos = await HeroVideo.find().sort({ order: 1 }).lean()
  return NextResponse.json({ videos })
}

export async function POST(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const body = await request.json()
  const video = await HeroVideo.create(body)
  return NextResponse.json({ video }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const body = await request.json()
  const { id, ...update } = body
  const video = await HeroVideo.findByIdAndUpdate(id, update, { new: true })
  return NextResponse.json({ video })
}

export async function DELETE(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  await HeroVideo.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
