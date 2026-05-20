import { Metadata } from "next"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Contact Us — VCHUKI Customer Support",
  description: "Get in touch with VCHUKI. Customer support for orders, returns, exchanges. Email: support@vchuki.com. Phone: +91 98765 43210. Mon-Sat 10AM-7PM.",
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
      telephone: BUSINESS.phone,
      email: BUSINESS.email.support,
      address: { "@type": "PostalAddress", streetAddress: BUSINESS.address.street, addressLocality: BUSINESS.address.city, addressRegion: BUSINESS.address.state, postalCode: BUSINESS.address.zip, addressCountry: "IN" },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />

      <div className="container py-8 md:py-16 max-w-4xl">
        <nav className="text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Contact</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground text-sm mb-8">We&apos;re here to help. Reach out for any queries about orders, products, or partnerships.</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold text-sm mb-2">Customer Support</h3>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>📧 {BUSINESS.email.support}</p>
                <p>📞 {BUSINESS.phone}</p>
                <p>⏰ {BUSINESS.hours}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold text-sm mb-2">Business & Partnerships</h3>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>📧 {BUSINESS.email.business}</p>
                <p>For wholesale, collaborations & media inquiries</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold text-sm mb-2">Registered Office</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{BUSINESS.legalName}</p>
                <p>{BUSINESS.fullAddress}</p>
                <p>GSTIN: {BUSINESS.gstin}</p>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.9!2d72.83!3d19.13!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA3JzQ4LjAiTiA3MsKwNDknNDguMCJF!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="VCHUKI Office Location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-bold mb-4">Send us a message</h2>
            <form className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Full Name *</label>
                <input type="text" required className="w-full mt-1 px-4 py-2.5 rounded-lg border bg-background text-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email *</label>
                <input type="email" required className="w-full mt-1 px-4 py-2.5 rounded-lg border bg-background text-sm" placeholder="you@example.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone</label>
                <input type="tel" className="w-full mt-1 px-4 py-2.5 rounded-lg border bg-background text-sm" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Subject *</label>
                <select required className="w-full mt-1 px-4 py-2.5 rounded-lg border bg-background text-sm">
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
              <div>
                <label className="text-xs font-medium text-muted-foreground">Order Number (if applicable)</label>
                <input type="text" className="w-full mt-1 px-4 py-2.5 rounded-lg border bg-background text-sm" placeholder="#VCHUKI-XXXXX" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Message *</label>
                <textarea required rows={4} className="w-full mt-1 px-4 py-2.5 rounded-lg border bg-background text-sm resize-none" placeholder="How can we help?" />
              </div>
              <button type="submit" className="w-full px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Send Message
              </button>
              <p className="text-[10px] text-muted-foreground text-center">We typically respond within 24 hours on business days.</p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
