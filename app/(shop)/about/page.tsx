import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"
import { Gem, MapPin, ClipboardCheck, Wind, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "About VCHUKI — Premium Linen Shirts Handcrafted in Jodhpur",
  description: "Learn about VCHUKI's journey — India's premium linen shirt brand for men. Handcrafted in Jodhpur, Rajasthan with 47 quality checks per garment.",
  alternates: { canonical: "https://vchuki.com/about" },
}

export default function AboutPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: BUSINESS.domain,
    logo: `${BUSINESS.domain}/logo.svg`,
    description: "Premium linen shirt brand for men, handcrafted in Jodhpur, Rajasthan, India.",
    address: { "@type": "PostalAddress", streetAddress: BUSINESS.address.street, addressLocality: BUSINESS.address.city, addressRegion: BUSINESS.address.state, postalCode: BUSINESS.address.zip, addressCountry: "IN" },
    telephone: BUSINESS.phone,
    email: BUSINESS.email.support,
    openingHours: "Mo-Sa 10:00-19:00",
    priceRange: "₹₹",
    sameAs: Object.values(BUSINESS.social),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      {/* Hero */}
      <section className="relative py-16 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#2a1f14]" />
        <div className="absolute inset-0 heritage-pattern opacity-20" />
        <div className="container relative z-10 text-center px-5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-[#c4956a] font-medium mb-4">Our Story</p>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-light text-[#f5e6d3] tracking-tight leading-[1.1]">
            Born in Jodhpur.<br />
            <span className="font-semibold text-[#c4956a]">Crafted for You.</span>
          </h1>
          <p className="text-sm md:text-base text-[#f5e6d3]/50 mt-4 md:mt-6 max-w-lg mx-auto leading-relaxed">
            Every VCHUKI shirt carries the heritage of Rajasthan&apos;s finest textile traditions — reimagined for the modern man.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container py-12 md:py-20 px-5 max-w-3xl mx-auto">
        <div className="space-y-12 md:space-y-16">

          {/* Mission */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-3">The Mission</p>
            <h2 className="text-xl md:text-2xl font-light tracking-tight text-foreground leading-snug">
              Premium linen shirts at honest prices — no middlemen, no markups.
            </h2>
            <p className="text-sm md:text-[15px] text-muted-foreground mt-4 leading-[1.8]">
              VCHUKI was founded in {BUSINESS.founded} with a clear purpose: to make premium quality linen shirts accessible to every Indian man. We noticed that finding breathable, well-crafted shirts suited for our climate was either impossible or unreasonably expensive.
            </p>
            <p className="text-sm md:text-[15px] text-muted-foreground mt-3 leading-[1.8]">
              So we built VCHUKI from the ground up. Direct-to-consumer, sourced from the finest mills, handcrafted in Jodhpur. Just premium shirts at fair prices.
            </p>
          </div>

          {/* USP Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-border">
            {[
              { icon: Gem, label: "Premium Linen", sub: "Finest mills" },
              { icon: MapPin, label: "Made in Jodhpur", sub: "Rajasthan heritage" },
              { icon: ClipboardCheck, label: "47 Quality Checks", sub: "Zero compromise" },
              { icon: Wind, label: "Breathable", sub: "All-day comfort" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className="h-5 w-5 text-[#c4956a] mx-auto" />
                <p className="text-[11px] font-semibold text-foreground mt-2 tracking-wide">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Quality */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-3">Craftsmanship</p>
            <h2 className="text-xl md:text-2xl font-light tracking-tight text-foreground leading-snug">
              47 quality checks. Zero shortcuts.
            </h2>
            <p className="text-sm md:text-[15px] text-muted-foreground mt-4 leading-[1.8]">
              Every VCHUKI shirt passes through 47 rigorous quality checkpoints before reaching you:
            </p>
            <ul className="mt-4 space-y-2.5">
              {[
                "Premium linen blend sourced from India's finest mills",
                "Pre-washed & pre-shrunk for perfect fit after every wash",
                "Color-fast dyes tested for 50+ wash cycles",
                "Reinforced stitching at collar, cuffs & stress points",
                "Individual quality inspection before packaging",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm md:text-[15px] text-muted-foreground leading-relaxed">
                  <span className="w-5 h-5 flex-shrink-0 border border-[#c4956a]/30 flex items-center justify-center mt-0.5">
                    <span className="text-[9px] text-[#c4956a] font-medium">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-3">By the Numbers</p>
            <h2 className="text-xl md:text-2xl font-light tracking-tight text-foreground leading-snug mb-6">
              What sets us apart
            </h2>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { stat: "47", label: "Quality Checks" },
                { stat: "100%", label: "Premium Linen" },
                { stat: "14 Day", label: "Easy Returns" },
                { stat: "5", label: "Curated Colors" },
                { stat: "4.8★", label: "Avg Rating" },
                { stat: "COD", label: "Available" },
              ].map((item) => (
                <div key={item.label} className="p-4 border border-border text-center hover:border-[#c4956a]/30 transition-colors">
                  <p className="text-lg md:text-xl font-light text-[#c4956a]">{item.stat}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sustainability */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-3">Responsibility</p>
            <h2 className="text-xl md:text-2xl font-light tracking-tight text-foreground leading-snug">
              Premium fashion meets responsibility.
            </h2>
            <p className="text-sm md:text-[15px] text-muted-foreground mt-4 leading-[1.8]">
              We&apos;re committed to responsible fashion. Our packaging is 100% recyclable, we use eco-friendly dyes wherever possible, and we believe premium fashion and environmental responsibility can coexist.
            </p>
          </div>

          {/* Company Info */}
          <div className="border-t border-border pt-10">
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-4">Company Information</p>
            <div className="p-5 md:p-6 border border-border bg-card/50 space-y-2 text-sm text-muted-foreground">
              <p><span className="text-foreground font-medium">Registered Name:</span> {BUSINESS.legalName}</p>
              <p><span className="text-foreground font-medium">Address:</span> {BUSINESS.fullAddress}</p>
              <p><span className="text-foreground font-medium">Email:</span> {BUSINESS.email.support}</p>
              <p><span className="text-foreground font-medium">Hours:</span> {BUSINESS.hours}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link
              href="/shirts"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-bold tracking-wider uppercase hover:opacity-90 transition-opacity"
            >
              Shop the Collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>
      </section>
    </>
  )
}
