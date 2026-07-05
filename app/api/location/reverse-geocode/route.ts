import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ valid: false, error: "missing_coordinates" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "VCHUKI-Ecommerce/1.0 (support@vchuki.com)",
        },
      }
    )
    const data = await res.json()
    const address = data?.address

    if (!address) {
      return NextResponse.json({ valid: false, error: "not_found" })
    }

    return NextResponse.json({
      valid: true,
      street: [address.house_number, address.road].filter(Boolean).join(" ") || address.suburb || "",
      city: address.city || address.town || address.village || address.county || "",
      state: address.state || "",
      zip: address.postcode || "",
    })
  } catch {
    return NextResponse.json({ valid: false, error: "lookup_failed" })
  }
}
