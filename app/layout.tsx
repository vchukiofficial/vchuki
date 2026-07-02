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
    site: "@vchuki",
    creator: "@vchuki",
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
  foundingDate: "2025",
  foundingLocation: { "@type": "Place", name: "Jodhpur, Rajasthan, India" },
  sameAs: [
    "https://instagram.com/vchuki",
    "https://twitter.com/vchuki",
    "https://facebook.com/vchuki",
    "https://youtube.com/@vchuki",
    "https://pinterest.com/vchuki",
  ],
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

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "VCHUKI",
  image: "https://vchuki.com/og-image.png",
  url: "https://vchuki.com",
  telephone: "+91-9252891189",
  email: "support@vchuki.com",
  priceRange: "\u20b9\u20b9",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jodhpur",
    addressLocality: "Jodhpur",
    addressRegion: "Rajasthan",
    postalCode: "342001",
    addressCountry: "IN",
  },
  geo: { "@type": "GeoCoordinates", latitude: 26.2389, longitude: 73.0243 },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "10:00",
    closes: "19:00",
  },
  areaServed: { "@type": "Country", name: "India" },
  brand: { "@type": "Brand", name: "VCHUKI", url: "https://vchuki.com" },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is VCHUKI?",
      acceptedAnswer: { "@type": "Answer", text: "VCHUKI is India's premium linen shirt brand for men, handcrafted in Jodhpur, Rajasthan. We offer formal shirts, casual shirts, linen shirts, and short kurtas with 47 quality checks per garment." },
    },
    {
      "@type": "Question",
      name: "Where is VCHUKI located?",
      acceptedAnswer: { "@type": "Answer", text: "VCHUKI is based in Jodhpur, Rajasthan, India. All our shirts are handcrafted locally using Rajasthan's finest textile heritage." },
    },
    {
      "@type": "Question",
      name: "Does VCHUKI offer free shipping?",
      acceptedAnswer: { "@type": "Answer", text: "Yes, VCHUKI offers free shipping on all orders above \u20b91,599 across India. Standard delivery takes 3-7 business days." },
    },
    {
      "@type": "Question",
      name: "What is VCHUKI's return policy?",
      acceptedAnswer: { "@type": "Answer", text: "VCHUKI offers a 7-day hassle-free return policy. If you're not satisfied with your purchase, you can return it within 7 days for a full refund." },
    },
    {
      "@type": "Question",
      name: "What types of shirts does VCHUKI sell?",
      acceptedAnswer: { "@type": "Answer", text: "VCHUKI sells premium linen full sleeve shirts, linen half sleeve shirts, short kurtas (full & half sleeve), all handcrafted in Jodhpur with premium linen blend fabric." },
    },
  ],
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
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
      </body>
    </html>
  )
}
