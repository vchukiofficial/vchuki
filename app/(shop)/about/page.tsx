import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About VCHUKI — India's Premium Shirt Brand",
  description: "Learn about VCHUKI's journey to become India's finest premium shirt brand. Our mission, values, and commitment to quality craftsmanship.",
  alternates: { canonical: "https://vchuki.com/about" },
}

export default function AboutPage() {
  return (
    <div className="container py-8 md:py-16 max-w-3xl">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">About</span>
      </nav>

      <h1 className="text-2xl md:text-4xl font-bold mb-6">About VCHUKI</h1>

      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p className="text-lg text-foreground font-medium">
          We believe every man deserves to feel confident in what he wears.
        </p>

        <p>
          VCHUKI was born from a simple observation — finding premium quality shirts in India that combine
          international design standards with fabrics suited for our climate was nearly impossible.
          So we decided to create them ourselves.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">Our Mission</h2>
        <p>
          To make premium fashion accessible to every Indian man. We source the finest fabrics,
          work with skilled artisans, and deliver shirts that look, feel, and last like luxury —
          without the luxury price tag.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">Quality Promise</h2>
        <p>
          Every VCHUKI shirt goes through 47 quality checkpoints before reaching you. From fabric
          selection to final stitching, we obsess over every detail. Our shirts are pre-washed,
          pre-shrunk, and color-tested to ensure they look perfect wash after wash.
        </p>

        <h2 className="text-xl font-bold text-foreground pt-4">Sustainability</h2>
        <p>
          We&apos;re committed to responsible fashion. Our packaging is 100% recyclable, we use
          eco-friendly dyes, and we&apos;re working towards carbon-neutral shipping by 2027.
        </p>

        <div className="grid grid-cols-3 gap-4 py-8 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">50K+</p>
            <p className="text-xs">Happy Customers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">4.8★</p>
            <p className="text-xs">Average Rating</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">30 Day</p>
            <p className="text-xs">Easy Returns</p>
          </div>
        </div>
      </div>
    </div>
  )
}
