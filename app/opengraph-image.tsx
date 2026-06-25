import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "VCHUKI - Premium Linen Shirts for Men, Crafted in Jodhpur India"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2a1f14",
          position: "relative",
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            backgroundImage: "repeating-linear-gradient(45deg, #c4956a 0, #c4956a 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#f5e6d3",
            }}
          >
            VCHUKI
          </div>
          <div
            style={{
              fontSize: 18,
              letterSpacing: "0.3em",
              color: "#c4956a",
              textTransform: "uppercase",
            }}
          >
            Premium Linen Shirts for Men
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#f5e6d3",
              opacity: 0.6,
              marginTop: 8,
            }}
          >
            Handcrafted in Jodhpur, Rajasthan • Free Shipping above ₹1,599
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            gap: "32px",
            fontSize: 12,
            color: "#c4956a",
            letterSpacing: "0.1em",
          }}
        >
          <span>vchuki.com</span>
          <span>•</span>
          <span>47 Quality Checks</span>
          <span>•</span>
          <span>14-Day Returns</span>
          <span>•</span>
          <span>100% Premium Linen</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
