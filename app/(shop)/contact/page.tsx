import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"
import { Mail, Clock, MapPin, MessageCircle, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us — VCHUKI Customer Support",
  description: "Get in touch with VCHUKI. Customer support for orders, returns, exchanges. Email: support@vchuki.com. Mon-Sat 10AM-7PM IST.",
  alternates: { canonical: "https://vchuki.com/contact" },
}

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "VCHUKI Contact",
    url: "https://vchuki.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: BUSINESS.legalName,
      email: BUSINESS.email.support,
      address: { "@type": "PostalAddress", streetAddress: BUSINESS.address.street, addressLocality: BUSINESS.address.city, addressRegion: BUSINESS.address.state, postalCode: BUSINESS.address.zip, addressCountry: "IN" },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />

      {/* Hero */}
      <section className="relative py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[#2a1f14]" />
        <div className="absolute inset-0 heritage-pattern opacity-20" />
        <div className="container relative z-10 text-center px-5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-[#c4956a] font-medium mb-3">Get in Touch</p>
          <h1 className="text-2xl md:text-4xl font-light text-[#f5e6d3] tracking-tight">
            We&apos;re Here to <span className="font-semibold text-[#c4956a]">Help</span>
          </h1>
          <p className="text-xs md:text-sm text-[#f5e6d3]/50 mt-3 max-w-md mx-auto">
            Questions about orders, products, or partnerships? Reach out and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>

      <div className="container py-10 md:py-16 px-5 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-1.5 text-border">/</span>
          <span className="text-foreground">Contact</span>
        </nav>

        <div className="grid md:grid-cols-5 gap-8 md:gap-12">
          {/* Left - Contact Info */}
          <div className="md:col-span-2 space-y-5">
            {/* Support */}
            <div className="p-5 border border-border hover:border-[#c4956a]/30 transition-colors">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#c4956a] font-medium mb-3">Customer Support</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#c4956a] flex-shrink-0" />
                  <a href="mailto:support@vchuki.com" className="text-sm text-foreground hover:text-[#c4956a] transition-colors">support@vchuki.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-4 w-4 text-[#c4956a] flex-shrink-0" />
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground hover:text-[#c4956a] transition-colors">WhatsApp Us</a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#c4956a] flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Mon – Sat, 10AM – 7PM IST</span>
                </div>
              </div>
            </div>

            {/* Business */}
            <div className="p-5 border border-border hover:border-[#c4956a]/30 transition-colors">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#c4956a] font-medium mb-3">Business & Partnerships</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#c4956a] flex-shrink-0" />
                  <a href="mailto:hello@vchuki.com" className="text-sm text-foreground hover:text-[#c4956a] transition-colors">hello@vchuki.com</a>
                </div>
                <p className="text-xs text-muted-foreground pl-7">Wholesale, collaborations & media</p>
              </div>
            </div>

            {/* Address */}
            <div className="p-5 border border-border hover:border-[#c4956a]/30 transition-colors">
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#c4956a] font-medium mb-3">Our Office</p>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#c4956a] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{BUSINESS.legalName}</p>
                  <p className="text-sm text-muted-foreground mt-1">{BUSINESS.fullAddress}</p>
                </div>
              </div>
            </div>

            {/* Map - Jodhpur */}
            <div className="overflow-hidden border border-border h-44">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d228627.0!2d72.9!3d26.28!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418c4eaa06ccb9%3A0x8114ea5b0ae1abb8!2sJodhpur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="VCHUKI Office - Jodhpur, Rajasthan"
              />
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="md:col-span-3">
            <div className="p-6 md:p-8 border border-border">
              <h2 className="text-lg font-light tracking-tight text-foreground mb-1">Send us a message</h2>
              <p className="text-xs text-muted-foreground mb-6">We typically respond within 24 hours on business days.</p>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Full Name *</label>
                    <input type="text" required className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email *</label>
                    <input type="email" required className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50" placeholder="you@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Phone</label>
                    <input type="tel" className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Subject *</label>
                    <select required className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors">
                      <option value="">Select a topic</option>
                      <option>Order Query</option>
                      <option>Return / Exchange</option>
                      <option>Product Question</option>
                      <option>Payment Issue</option>
                      <option>Feedback</option>
                      <option>Business Inquiry</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Order Number (if applicable)</label>
                  <input type="text" className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50" placeholder="#VCHUKI-XXXXX" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Message *</label>
                  <textarea required rows={4} className="w-full mt-1.5 px-4 py-3 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors resize-none placeholder:text-muted-foreground/50" placeholder="How can we help?" />
                </div>

                <button type="submit" className="w-full py-3.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  Send Message <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
