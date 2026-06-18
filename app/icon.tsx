import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 32, height: 32, background: "#0a0a0a", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3 C7 9, 8.5 13, 10 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M15 3 C13 9, 11.5 13, 10 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
