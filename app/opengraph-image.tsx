import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "VCHUKI — Premium Cotton Linen Blend Shirts for Men | Handcrafted in Jodhpur, India"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: "#2a1f14", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "48px", fontWeight: 700, color: "#f5e6d3", letterSpacing: "12px" }}>VCHUKI</div>
          <div style={{ fontSize: "16px", color: "#c4956a", letterSpacing: "4px", textTransform: "uppercase" }}>Premium Cotton Linen Blend — Crafted in Jodhpur</div>
          <div style={{ marginTop: "24px", fontSize: "22px", color: "#f5e6d3", opacity: 0.7, textAlign: "center", maxWidth: "700px" }}>
            India&apos;s finest handcrafted shirts & short kurtas for men
          </div>
          <div style={{ marginTop: "32px", display: "flex", gap: "24px", fontSize: "13px", color: "#c4956a" }}>
            <span>Full Sleeve Shirts</span>
            <span>•</span>
            <span>Half Sleeve Shirts</span>
            <span>•</span>
            <span>Short Kurtas</span>
          </div>
          <div style={{ marginTop: "20px", fontSize: "12px", color: "#f5e6d3", opacity: 0.4 }}>vchuki.com</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
