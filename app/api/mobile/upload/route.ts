import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { getRequestUser } from "@/lib/mobileAuth"

const MAX_BYTES = 6 * 1024 * 1024
const TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"])

/** Customer review-photo upload (the existing /api/upload is admin-only). */
export async function POST(req: NextRequest) {
  const me = await getRequestUser(req)
  if (!me) return NextResponse.json({ error: "Please sign in" }, { status: 401 })

  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (!TYPES.has(file.type)) return NextResponse.json({ error: "Photos only (JPG, PNG, WebP)" }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Photo must be under 6 MB" }, { status: 400 })

  const ext = file.type.split("/")[1].replace("jpeg", "jpg")
  const blob = await put(`reviews/${me.id}/${Date.now()}.${ext}`, file, { access: "public", contentType: file.type })
  return NextResponse.json({ url: blob.url })
}
