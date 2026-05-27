import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { PageTracker } from "@/components/PageTracker"
import Script from "next/script"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://vchuki.com"),
  title: {
    default: "VCHUKI — Premium Shirts for Men | Buy Formal, Casual & Linen Shirts Online India",
    template: "%s | VCHUKI",
  },
  description: "Shop premium quality shirts for men at VCHUKI. Explore formal shirts, casual shirts, linen shirts, cotton shirts & oversized shirts. Free shipping above ₹999. 30-day returns.",
  keywords: [
    "vchuki", "vchuki shirts", "premium shirts india", "formal shirts for men",
    "linen shirts online", "casual shirts men", "cotton shirts india",
    "buy shirts online", "men fashion india", "premium menswear",
    "oversized shirts", "designer shirts india",
  ],
  authors: [{ name: "VCHUKI" }],
  creator: "VCHUKI",
  publisher: "VCHUKI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vchuki.com",
    siteName: "VCHUKI",
    title: "VCHUKI — Premium Shirts for Men | India's Finest Fashion Brand",
    description: "Discover premium quality shirts crafted for style, comfort & every occasion. Formal, casual, linen & cotton shirts with free shipping.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "VCHUKI Premium Shirts" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VCHUKI — Premium Shirts for Men",
    description: "India's finest premium shirt brand. Shop formal, casual & linen shirts online.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://vchuki.com" },
  verification: {
    google: "your-google-verification-code",
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VCHUKI",
  url: "https://vchuki.com",
  logo: "https://vchuki.com/logo.svg",
  description: "Premium fashion brand offering high-quality shirts for men in India",
  sameAs: ["https://instagram.com/vchuki", "https://twitter.com/vchuki"],
  contactPoint: { "@type": "ContactPoint", telephone: "+91-9876543210", contactType: "customer service" },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VCHUKI",
  url: "https://vchuki.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://vchuki.com/shirts?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${geistMono.variable} font-sans`}>
        <Providers>
          <PageTracker />
          {children}
        </Providers>
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
        <Script id="gtag" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');`}
        </Script>
      </body>
    </html>
  )
}
