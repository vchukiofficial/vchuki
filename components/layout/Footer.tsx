import Link from "next/link"
import Image from "next/image"
import { BUSINESS } from "@/lib/constants"

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 pb-20 md:pb-6">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo-mark.svg" alt="VCHUKI" width={22} height={22} className="dark:invert" />
              <div>
                <span className="text-sm font-semibold tracking-[0.15em] block leading-none">VCHUKI</span>
                <span className="text-[7px] tracking-[0.1em] text-muted-foreground block mt-0.5">PREMIUM MENSWEAR</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{BUSINESS.tagline}</p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-4">
              {Object.entries(BUSINESS.social).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label={platform}>
                  <span className="text-xs capitalize">{platform.charAt(0).toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Shop</h4>
            <div className="space-y-2 text-sm">
              <Link href="/shirts" className="block text-muted-foreground hover:text-foreground transition-colors">All Shirts</Link>
              <Link href="/shirts/formal" className="block text-muted-foreground hover:text-foreground transition-colors">Formal</Link>
              <Link href="/shirts/casual" className="block text-muted-foreground hover:text-foreground transition-colors">Casual</Link>
              <Link href="/shirts/linen" className="block text-muted-foreground hover:text-foreground transition-colors">Linen</Link>
              <Link href="/shirts/premium" className="block text-muted-foreground hover:text-foreground transition-colors">Premium</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Company</h4>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
              <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link href="/blog" className="block text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Policies</h4>
            <div className="space-y-2 text-sm">
              <Link href="/privacy-policy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="block text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</Link>
              <Link href="/refund-policy" className="block text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
              <Link href="/shipping-policy" className="block text-muted-foreground hover:text-foreground transition-colors">Shipping Policy</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{BUSINESS.email.support}</p>
              <p>{BUSINESS.phone}</p>
              <p className="text-xs">{BUSINESS.hours}</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t flex flex-wrap items-center justify-center gap-4 md:gap-6 text-[10px] md:text-xs text-muted-foreground">
          <span className="flex items-center gap-1">🔒 Secure Payments</span>
          <span className="flex items-center gap-1">🚚 Free Shipping ₹999+</span>
          <span className="flex items-center gap-1">↩️ 30-Day Returns</span>
          <span className="flex items-center gap-1">✓ 100% Genuine</span>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] md:text-xs text-muted-foreground">
          <div className="text-center md:text-left">
            <p>© 2026 {BUSINESS.legalName}. All rights reserved.</p>
            <p className="mt-0.5">GSTIN: {BUSINESS.gstin} | CIN: {BUSINESS.cin}</p>
          </div>
          <div className="flex items-center gap-3">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>UPI</span>
            <span>Razorpay</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
