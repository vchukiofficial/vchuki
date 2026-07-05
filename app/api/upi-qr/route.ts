import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { buildUpiLink, isUpiConfigured } from "@/lib/upi"

export async function GET(request: NextRequest) {
  if (!isUpiConfigured()) {
    return NextResponse.json({ error: "UPI not configured" }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const amount = Number(searchParams.get("amount"))
  const note = searchParams.get("note") || "VCHUKI Order"

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
  }

  const link = buildUpiLink({ amount, note })
  const png = await QRCode.toBuffer(link, { width: 300, margin: 1 })

  return new NextResponse(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  })
}
