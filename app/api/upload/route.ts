import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { sessionFor } from "@/lib/mobileAuth"

export async function POST(request: NextRequest) {
  const session = await sessionFor(request)
  if (!session || session.user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const blob = await put(`products/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  return NextResponse.json({ url: blob.url })
}
