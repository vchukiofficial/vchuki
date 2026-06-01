import { Metadata } from "next"
import { EarlyAccessClient } from "./client"

export const metadata: Metadata = {
  title: "VIP Access — VCHUKI | Premium Linen Shirts",
  description: "Be the first to shop VCHUKI's debut collection. First 100 signups get 10% off + free shipping. Handcrafted linen shirts from Jodhpur.",
  openGraph: {
    title: "VIP Access — VCHUKI",
    description: "First 100 people get 10% off + free shipping. Premium linen shirts dropping July 7.",
    type: "website",
  },
}

export default function EarlyAccessPage() {
  return <EarlyAccessClient />
}
