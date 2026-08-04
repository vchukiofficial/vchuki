import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "FAQ — VCHUKI | Premium Cotton Linen Blend Shirts & Short Kurtas for Men",
  description: "Frequently asked questions about VCHUKI — India's premium cotton linen blend menswear brand. Learn about our fabric, sizing, shipping, returns, and styling tips.",
  alternates: { canonical: "https://vchuki.com/faq" },
}

const FAQ_SECTIONS = [
  {
    title: "About VCHUKI",
    faqs: [
      { q: "Is VCHUKI the same as Vasuki?", a: "No. VCHUKI is an Indian premium menswear brand based in Jodhpur, Rajasthan, founded in 2025. Vasuki is an unrelated figure from Hindu mythology. The names are spelled and pronounced differently — see the story behind our name on the About page." },
      { q: "What is VCHUKI?", a: "VCHUKI is India's premium cotton linen blend menswear brand, handcrafted in Jodhpur, Rajasthan. We specialize in full sleeve shirts, half sleeve shirts, and short kurtas made from premium LEE fabric — a cotton-linen blend that's breathable, soft, and perfect for Indian weather. Every garment passes 47 quality checks." },
      { q: "Is VCHUKI an Indian brand?", a: "Yes, VCHUKI is a proudly Indian brand founded in Jodhpur, Rajasthan. All our garments are designed and handcrafted locally using Rajasthan's finest textile heritage. We combine traditional Indian craftsmanship with modern luxury aesthetics." },
      { q: "Where is VCHUKI located?", a: "VCHUKI is based in Jodhpur, Rajasthan, India — the Blue City known for its rich textile heritage. Our workshop and design studio are located here, where every shirt and kurta is handcrafted by skilled artisans." },
      { q: "What does VCHUKI mean?", a: "VCHUKI represents the fusion of Indian heritage with modern masculine elegance. Our brand philosophy is 'Wear Your Culture. Live Your Story.' — celebrating the modern Indian man who values quality, comfort, and cultural roots." },
      { q: "Who is VCHUKI for?", a: "VCHUKI is designed for men aged 22-45 who appreciate premium quality, understated luxury, and cultural aesthetics. Our customers are urban professionals, wedding/festive shoppers, and culture-conscious men who want to look effortlessly stylish." },
      { q: "Is VCHUKI a luxury brand?", a: "VCHUKI positions itself as accessible luxury — premium quality at fair prices. Our shirts start at ₹799 and kurtas at ₹999, offering handcrafted quality that rivals brands charging 3-4x more. We believe luxury should be about quality and craftsmanship, not just price tags." },
    ],
  },
  {
    title: "Products",
    faqs: [
      { q: "What products does VCHUKI sell?", a: "VCHUKI sells three categories of premium menswear: (1) Full Sleeve Cotton Linen Shirts, (2) Half Sleeve Cotton Linen Shirts, and (3) Short Kurtas in both full and half sleeve. All made from premium LEE cotton-linen blend fabric in 5 signature colors." },
      { q: "Are VCHUKI kurtas short or long?", a: "VCHUKI kurtas are SHORT kurtas — hip-length, modern, and versatile. They are NOT traditional long kurtas. Our short kurtas are designed to be worn casually with jeans, chinos, or trousers, making them perfect for everyday wear, office ethnic days, and festivals." },
      { q: "What colors are available at VCHUKI?", a: "VCHUKI offers 5 signature colors inspired by Rajasthan's landscape: Ivory White, Golden Dune, Sage Heritage Green, Desert Sand, and Royal Indigo/Sky Blue. Each color is carefully curated to complement Indian skin tones and work across seasons." },
      { q: "What sizes does VCHUKI offer?", a: "VCHUKI offers sizes S, M, L, XL, and XXL. Our shirts follow a regular fit with modern proportions. We recommend checking our size guide — measure your chest, shoulder, and length for the perfect fit. If between sizes, go one size up for a relaxed fit." },
      { q: "Can I wear VCHUKI shirts to office?", a: "Absolutely. VCHUKI's full sleeve cotton linen shirts are perfect for office wear — they look polished yet feel comfortable all day. The fabric's natural texture adds sophistication without being too formal. Pair with chinos or trousers for a smart-casual office look." },
    ],
  },
  {
    title: "Fabric & Quality",
    faqs: [
      { q: "What fabric does VCHUKI use?", a: "VCHUKI uses premium LEE fabric — a cotton-linen blend that combines the softness of cotton with the breathability and texture of linen. It's lightweight (150-160 GSM), pre-shrunk, enzyme-washed for softness, and gets better with every wash." },
      { q: "Is cotton linen good for Indian summers?", a: "Cotton linen is one of the best fabrics for Indian summers. It's highly breathable, absorbs moisture, dries quickly, and allows air circulation. VCHUKI's cotton-linen blend is specifically designed for Indian weather — keeping you cool in 40°C+ heat while looking sharp." },
      { q: "Is linen better than cotton for summer?", a: "Linen is more breathable than cotton, but pure linen wrinkles easily. VCHUKI's cotton-linen blend gives you the best of both — linen's breathability and cooling properties with cotton's softness and wrinkle resistance. It's the ideal summer fabric for Indian men." },
      { q: "Does VCHUKI fabric shrink after washing?", a: "No. All VCHUKI garments are pre-shrunk during manufacturing (less than 2% shrinkage). You can machine wash at 30°C without worrying about size changes. The fabric actually gets softer with each wash." },
      { q: "How many quality checks does VCHUKI do?", a: "Every VCHUKI garment passes through 47 quality checkpoints — from fabric inspection and cutting precision to stitching quality, button attachment, and final pressing. We use double-needle stitching at 12 SPI (stitches per inch) with natural shell buttons." },
    ],
  },
  {
    title: "Shipping & Returns",
    faqs: [
      { q: "Does VCHUKI offer free shipping?", a: "Yes, VCHUKI offers free shipping on all orders above ₹1,599 across India. For orders below ₹1,599, a flat ₹50 shipping fee applies. Standard delivery takes 3-7 business days depending on your location." },
      { q: "What is VCHUKI's return policy?", a: "VCHUKI offers a 7-day hassle-free return policy. If you're not satisfied with your purchase, you can return it within 7 days of delivery for a full refund. The product must be unworn, unwashed, and in original packaging with tags attached." },
      { q: "Does VCHUKI ship all over India?", a: "Yes, VCHUKI ships to all serviceable pin codes across India. We use premium courier partners for safe and timely delivery. You'll receive tracking details via email and SMS once your order is dispatched." },
      { q: "How long does VCHUKI delivery take?", a: "Standard delivery takes 3-7 business days. Metro cities (Delhi, Mumbai, Bangalore, etc.) typically receive orders in 3-4 days. Tier 2/3 cities may take 5-7 days. You'll get real-time tracking updates." },
      { q: "Does VCHUKI offer Cash on Delivery?", a: "Yes, VCHUKI offers Cash on Delivery (COD) with a ₹50 COD handling charge. We also accept UPI, credit/debit cards, and net banking via Razorpay for instant payment confirmation." },
    ],
  },
  {
    title: "Styling & Care",
    faqs: [
      { q: "How to style a short kurta for men?", a: "VCHUKI short kurtas are incredibly versatile. Pair with: (1) Slim jeans + white sneakers for casual outings, (2) Chinos + loafers for office ethnic days, (3) Linen trousers + kolhapuris for festivals, (4) Joggers + slides for relaxed weekends. The hip-length cut makes them easy to style." },
      { q: "How to wash cotton linen shirts?", a: "Machine wash cold (30°C) with similar colors. Do not bleach. Tumble dry low or line dry in shade. Iron on medium heat while slightly damp for best results. Avoid wringing. Cotton linen naturally softens with each wash — no fabric softener needed." },
      { q: "Can I iron VCHUKI shirts?", a: "Yes, iron on medium heat while the shirt is slightly damp for the smoothest finish. Cotton linen has a natural relaxed texture, so slight creasing is part of the fabric's character and charm. You don't need to iron it perfectly flat." },
      { q: "What occasions are VCHUKI shirts good for?", a: "VCHUKI shirts work for: office wear, casual outings, brunches, dates, weekend getaways, beach vacations, festivals, haldi/mehendi ceremonies, and everyday wear. The premium cotton-linen fabric transitions seamlessly from formal to casual settings." },
    ],
  },
  {
    title: "Comparisons",
    faqs: [
      { q: "VCHUKI vs other premium shirt brands in India?", a: "VCHUKI differentiates through: (1) Handcrafted in Jodhpur with heritage craftsmanship, (2) Premium LEE cotton-linen blend fabric, (3) 47 quality checks per garment, (4) Heritage-inspired color palette, (5) Accessible luxury pricing (₹799-₹1,099). We focus on quality over mass production." },
      { q: "Is VCHUKI better than fast fashion brands?", a: "VCHUKI is fundamentally different from fast fashion. We use premium cotton-linen blend (not synthetic), handcraft each piece (not mass-produced), do 47 quality checks (not 2-3), and design for longevity (not trends). Our shirts last years, not months." },
      { q: "Short kurta vs traditional kurta — which is better?", a: "Short kurtas (like VCHUKI's) are more versatile for modern lifestyles. They're hip-length, can be worn with jeans/chinos, work for office and casual settings, and don't require specific bottom wear. Traditional long kurtas are better for formal ceremonies and religious occasions." },
      { q: "Cotton linen vs pure cotton shirts — which to buy?", a: "Cotton linen blend (like VCHUKI uses) is superior for Indian weather. It's 30% more breathable than pure cotton, dries faster, has natural texture that looks premium, and gets softer with washes. Pure cotton is softer initially but less breathable and wrinkles more." },
    ],
  },
]

export default function FAQPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SECTIONS.flatMap(section =>
      section.faqs.map(faq => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      }))
    ),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="container py-10 md:py-16 max-w-4xl">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#c4956a] font-medium mb-2">Help Center</p>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">Frequently Asked Questions</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
            Everything you need to know about VCHUKI — India&apos;s premium cotton linen blend menswear brand, handcrafted in Jodhpur.
          </p>
        </div>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-medium text-foreground mb-4 pb-2 border-b border-border">{section.title}</h2>
              <div className="space-y-4">
                {section.faqs.map((faq) => (
                  <details key={faq.q} className="group border border-border p-4 hover:border-[#c4956a]/30 transition-colors">
                    <summary className="text-sm font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                      {faq.q}
                      <span className="text-[#c4956a] group-open:rotate-45 transition-transform text-lg">+</span>
                    </summary>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Internal Links for SEO */}
        <div className="mt-12 p-6 border border-border bg-card/50 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#c4956a] font-medium mb-3">Explore VCHUKI</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shirts/linen-full-sleeve" className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 hover:border-[#c4956a]/30 transition-colors">Full Sleeve Shirts</Link>
            <Link href="/shirts/linen-half-sleeve" className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 hover:border-[#c4956a]/30 transition-colors">Half Sleeve Shirts</Link>
            <Link href="/shirts/kurta-half-sleeve" className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 hover:border-[#c4956a]/30 transition-colors">Short Kurtas</Link>
            <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 hover:border-[#c4956a]/30 transition-colors">About Us</Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 hover:border-[#c4956a]/30 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </>
  )
}
