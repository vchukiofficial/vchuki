import { NextRequest, NextResponse } from "next/server"
import { httpsGetJson } from "@/lib/httpsGetJson"

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  const code = params.code

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ valid: false, error: "invalid_pincode" }, { status: 400 })
  }

  try {
    const data = await httpsGetJson(`https://api.postalpincode.in/pincode/${code}`)
    const result = Array.isArray(data) ? data[0] : null
    const postOffice = result?.Status === "Success" ? result.PostOffice?.[0] : null

    if (!postOffice) {
      return NextResponse.json({ valid: false, error: "not_found" })
    }

    return NextResponse.json({
      valid: true,
      city: postOffice.District,
      state: postOffice.State,
    })
  } catch {
    return NextResponse.json({ valid: false, error: "lookup_failed" })
  }
}
