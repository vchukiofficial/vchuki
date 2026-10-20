import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { PageTracker } from "@/components/PageTracker"
import Script from "next/script"
import { BUSINESS } from "@/lib/constants"

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
    default: "VCHUKI — Premium Cotton Linen Shirts for Men | Handcrafted in Jodhpur, India",
    template: "%s",
  },
  description: "VCHUKI is India's premium cotton-linen shirt brand for men. Shop handcrafted full sleeve shirts, half sleeve shirts & short kurtas. Made in Jodhpur, Rajasthan. Free shipping above ₹1,599. 7-day easy returns. Wear Your Culture. Live Your Story.",
  keywords: [
    "vchuki", "vchuki.com", "vchuki shirts", "vchuki brand", "vchuki india",
    "premium cotton linen shirts", "cotton linen shirts india", "linen shirts for men",
    "half sleeve linen shirt", "full sleeve shirt men", "premium shirts for men india",
    "short kurta for men", "premium kurta men", "luxury ethnic wear men",
    "summer shirts men india", "linen shirts online india", "cotton linen half sleeve",
    "jodhpur fashion brand", "premium menswear india", "linen kurta men",
    "buy shirts online india", "designer shirts india", "heritage menswear",
  ],
  authors: [{ name: "VCHUKI", url: "https://vchuki.com" }],
  creator: "VCHUKI",
  publisher: "VCHUKI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vchuki.com",
    siteName: "VCHUKI",
    title: "VCHUKI — Premium Cotton Linen Blend Shirts for Men | Handcrafted in Jodhpur",
    description: "India's finest premium linen shirt brand. Handcrafted in Jodhpur with 47 quality checks. Shop formal, casual, linen shirts & short kurtas. Free shipping above ₹1,599.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "VCHUKI - Premium Cotton Linen Blend Shirts for Men, Crafted in Jodhpur India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VCHUKI — Premium Cotton Linen Blend Shirts for Men",
    description: "India's finest premium linen shirt brand. Handcrafted in Jodhpur. Shop formal, casual & linen shirts online.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://vchuki.com" },
  verification: {
    google: "PqJO-cCKPqtA2eGmiFW__qf34keqaKqFQUoqVYVzwFo",
  },
  other: {
    "google-site-verification": "PqJO-cCKPqtA2eGmiFW__qf34keqaKqFQUoqVYVzwFo",
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VCHUKI",
  alternateName: ["Vchuki", "vchuki.com", "VCHUKI India", "Vchuki Fashion"],
  url: "https://vchuki.com",
  logo: "https://vchuki.com/logo.svg",
  image: "https://vchuki.com/og-image.png",
  description: "VCHUKI is India's premium linen shirt brand for men. Handcrafted in Jodhpur, Rajasthan with 47 quality checks. Shop formal, casual, linen shirts & short kurtas.",
  disambiguatingDescription: "VCHUKI is an Indian premium menswear brand based in Jodhpur, Rajasthan — not to be confused with Vasuki, the serpent deity of Hindu mythology.",
  foundingDate: "2025",
  foundingLocation: { "@type": "Place", name: "Jodhpur, Rajasthan, India" },
  sameAs: Object.values(BUSINESS.social),
  contactPoint: [
    { "@type": "ContactPoint", telephone: "+91-9252891189", contactType: "customer service", areaServed: "IN", availableLanguage: ["English", "Hindi"] },
    { "@type": "ContactPoint", email: "support@vchuki.com", contactType: "customer support" },
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jodhpur",
    addressLocality: "Jodhpur",
    addressRegion: "Rajasthan",
    postalCode: "342001",
    addressCountry: "IN",
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VCHUKI",
  alternateName: "Vchuki",
  url: "https://vchuki.com",
  description: "India's premium linen shirt brand for men. Handcrafted in Jodhpur.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://vchuki.com/shirts?search={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
  publisher: { "@type": "Organization", name: "VCHUKI", url: "https://vchuki.com" },
}

const brandSchema = {
  "@context": "https://schema.org",
  "@type": "Brand",
  name: "VCHUKI",
  alternateName: ["Vchuki", "vchuki.com"],
  url: "https://vchuki.com",
  logo: "https://vchuki.com/logo.svg",
  description: "Premium linen shirt brand for men, handcrafted in Jodhpur, India.",
  slogan: "Premium Linen Blend Shirts \u2014 Crafted in Jodhpur",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Regular + apple-touch icons are auto-injected by app/icon.tsx and app/apple-icon.tsx */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2a1f14" />
        <meta name="apple-mobile-web-app-title" content="VCHUKI" />
        <meta name="application-name" content="VCHUKI" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${geistMono.variable} font-sans`}>
        <Providers>
          <PageTracker />
          {children}
        </Providers>
        {/* Google Analytics */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-SSR2JS2VWN" strategy="afterInteractive" />
        <Script id="gtag" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-SSR2JS2VWN');`}
        </Script>
        {/* Meta Pixel — set NEXT_PUBLIC_META_PIXEL_ID in Vercel to switch it on. Page views on
            client-side navigation are sent from PageTracker. */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${process.env.NEXT_PUBLIC_META_PIXEL_ID}');`}
          </Script>
        )}
      </body>
    </html>
  )
}
