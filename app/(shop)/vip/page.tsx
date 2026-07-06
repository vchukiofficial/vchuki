import { Metadata } from "next"
import { EarlyAccessClient } from "./client"

export const metadata: Metadata = {
  title: "VIP Access — VCHUKI | Premium Linen Blend Shirts",
  description: "Be the first to shop VCHUKI's debut collection. First 100 signups get 10% off + free shipping. Handcrafted premium linen blend shirts from Jodhpur.",
  openGraph: {
    title: "VIP Access — VCHUKI",
    description: "First 100 people get 10% off + free shipping. Premium linen shirts, handcrafted in Jodhpur.",
    type: "website",
  },
}

export default function EarlyAccessPage() {
  return <EarlyAccessClient />
}
