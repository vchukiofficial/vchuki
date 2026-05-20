import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact Us — VCHUKI Customer Support",
  description: "Get in touch with VCHUKI. Customer support, order queries, returns & exchanges. We're here to help.",
  alternates: { canonical: "https://vchuki.com/contact" },
}

export default function ContactPage() {
  return (
    <div className="container py-8 md:py-16 max-w-2xl">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">Contact</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">We&apos;d love to hear from you. Reach out for any queries.</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 rounded-xl border bg-card">
          <h3 className="font-semibold text-sm mb-2">Customer Support</h3>
          <p className="text-sm text-muted-foreground">support@vchuki.com</p>
          <p className="text-sm text-muted-foreground">+91 98765 43210</p>
          <p className="text-xs text-muted-foreground mt-2">Mon-Sat, 10am - 7pm IST</p>
        </div>
        <div className="p-4 rounded-xl border bg-card">
          <h3 className="font-semibold text-sm mb-2">Business Inquiries</h3>
          <p className="text-sm text-muted-foreground">business@vchuki.com</p>
          <p className="text-xs text-muted-foreground mt-2">For partnerships & wholesale</p>
        </div>
      </div>

      <div className="p-6 rounded-xl border bg-card">
        <h2 className="font-bold mb-4">Send us a message</h2>
        <form className="space-y-3">
          <input type="text" placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm" />
          <input type="email" placeholder="Email Address" className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm" />
          <select className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm text-muted-foreground">
            <option>Order Query</option>
            <option>Return/Exchange</option>
            <option>Product Question</option>
            <option>Feedback</option>
            <option>Other</option>
          </select>
          <textarea placeholder="Your message..." rows={4} className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm resize-none" />
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}
