import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "About VCHUKI — India's Premium Men's Shirt Brand",
  description: "Learn about VCHUKI's journey, mission, and commitment to premium quality menswear. Handcrafted shirts made in India with world-class standards.",
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
    image: `${BUSINESS.domain}/og-image.jpg`,
    description: "Premium men's fashion brand offering formal, casual, linen & cotton shirts online in India.",
    address: { "@type": "PostalAddress", streetAddress: BUSINESS.address.street, addressLocality: BUSINESS.address.city, addressRegion: BUSINESS.address.state, postalCode: BUSINESS.address.zip, addressCountry: "IN" },
    telephone: BUSINESS.phone,
    email: BUSINESS.email.support,
    openingHours: "Mo-Sa 10:00-19:00",
    priceRange: "₹799 - ₹4999",
    sameAs: Object.values(BUSINESS.social),
    taxID: BUSINESS.gstin,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <div className="container py-8 md:py-16 max-w-3xl">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">About</span>
        </nav>

        <h1 className="text-2xl md:text-4xl font-bold mb-6">About VCHUKI</h1>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <p className="text-lg text-foreground font-medium">
            We believe every man deserves to feel confident, comfortable, and stylish — without compromise.
          </p>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Our Story</h2>
            <p>VCHUKI was founded in {BUSINESS.founded} with a clear mission: to bridge the gap between luxury fashion and accessibility for Indian men. We noticed that finding premium quality shirts — ones that combine international design standards with fabrics suited for our climate — was either impossible or unreasonably expensive.</p>
            <p className="mt-3">So we built VCHUKI from the ground up. Direct-to-consumer, no middlemen, no inflated markups. Just premium shirts at honest prices.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Manufacturing Quality</h2>
            <p>Every VCHUKI shirt passes through 47 quality checkpoints before reaching you:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fabrics sourced from India&apos;s finest mills — Arvind, Raymond, and Bombay Dyeing</li>
              <li>Pre-washed and pre-shrunk to ensure perfect fit after every wash</li>
              <li>Color-fast dyes tested for 50+ wash cycles</li>
              <li>Reinforced stitching at stress points (collar, cuffs, buttons)</li>
              <li>Mother-of-pearl buttons on premium collection</li>
              <li>Individual quality inspection before packaging</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Our Mission</h2>
            <p>To make premium fashion accessible to every Indian man. We&apos;re not a discount brand, and we&apos;re not a luxury brand with inflated prices. We&apos;re the sweet spot — exceptional quality at fair prices, delivered with a world-class experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">What Sets Us Apart</h2>
            <div className="grid grid-cols-2 gap-4 mt-3">
              {[
                { stat: "500+", label: "Premium Shirts" },
                { stat: "50K+", label: "Happy Customers" },
                { stat: "4.8★", label: "Average Rating" },
                { stat: "30 Day", label: "Easy Returns" },
                { stat: "47", label: "Quality Checks" },
                { stat: "100%", label: "Genuine Products" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg border bg-card text-center">
                  <p className="text-xl font-bold text-primary">{item.stat}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Company Information</h2>
            <div className="p-4 rounded-lg border bg-card text-sm space-y-1.5">
              <p><strong>Registered Name:</strong> {BUSINESS.legalName}</p>
              <p><strong>GSTIN:</strong> {BUSINESS.gstin}</p>
              <p><strong>CIN:</strong> {BUSINESS.cin}</p>
              <p><strong>Registered Address:</strong> {BUSINESS.fullAddress}</p>
              <p><strong>Email:</strong> {BUSINESS.email.support}</p>
              <p><strong>Phone:</strong> {BUSINESS.phone}</p>
              <p><strong>Business Hours:</strong> {BUSINESS.hours}</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">Sustainability</h2>
            <p>We&apos;re committed to responsible fashion. Our packaging is 100% recyclable, we use eco-friendly dyes wherever possible, and we&apos;re working towards carbon-neutral shipping by 2027. We believe premium fashion and environmental responsibility can coexist.</p>
          </section>
        </div>
      </div>
    </>
  )
}
