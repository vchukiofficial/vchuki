import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await connectDB()
  const body = await request.json()

  const allowedUpdates: any = {}
  if (body.role && ["user", "admin"].includes(body.role)) {
    allowedUpdates.role = body.role
  }
  if (body.name) allowedUpdates.name = body.name

  const user = await User.findByIdAndUpdate(params.id, allowedUpdates, { new: true }).select("-password")
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(user)
}
