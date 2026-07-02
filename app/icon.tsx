import { readFile } from "fs/promises"
import { join } from "path"
import { NextResponse } from "next/server"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default async function Icon() {
  const data = await readFile(join(process.cwd(), "public", "favicon-32.png"))
  return new NextResponse(data, { headers: { "Content-Type": "image/png" } })
}
