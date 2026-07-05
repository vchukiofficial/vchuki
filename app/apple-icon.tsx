import { readFile } from "fs/promises"
import { join } from "path"
import { NextResponse } from "next/server"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default async function AppleIcon() {
  // v2: white/gradient mark on dark brand background (was black-on-transparent)
  const data = await readFile(join(process.cwd(), "public", "apple-touch-icon.png"))
  return new NextResponse(data, { headers: { "Content-Type": "image/png" } })
}
