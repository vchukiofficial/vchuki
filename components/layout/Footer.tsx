import Link from "next/link"
import Image from "next/image"
import { BUSINESS } from "@/lib/constants"
import { Truck, RotateCcw, Shield, CheckCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-[#c4956a]/15 bg-[#2a1f14] text-[#f5e6d3] pb-24 md:pb-6">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/marko.png" alt="VCHUKI" width={36} height={36} className="invert" />
              <div>
                <span className="text-sm font-bold tracking-[0.2em] block leading-none">VCHUKI</span>
                <span className="text-[7px] tracking-[0.12em] text-[#c4956a] block mt-0.5">PREMIUM MENSWEAR</span>
              </div>
            </div>
            <p className="text-xs text-[#f5e6d3]/50 leading-relaxed">{BUSINESS.tagline}</p>
            <p className="text-[10px] text-[#f5e6d3]/30 mt-2">Crafted with love in Jodhpur, Rajasthan</p>
            {/* Social */}
            <div className="flex gap-4 mt-5">
              {Object.entries(BUSINESS.social).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-[#f5e6d3]/40 hover:text-[#c4956a] transition-colors" aria-label={platform}>
                  <span className="text-xs font-medium">{platform.charAt(0).toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-[10px] uppercase tracking-[0.2em] text-[#c4956a]">Shop</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/shirts" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">All Shirts</Link>
              <Link href="/shirts/linen-half-sleeve" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Half Sleeve Shirts</Link>
              <Link href="/shirts/linen" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Full Sleeve Shirts</Link>
              <Link href="/shirts/kurta-half-sleeve" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Half Kurta</Link>
              <Link href="/shirts/kurta-full-sleeve" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Full Kurta</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-[10px] uppercase tracking-[0.2em] text-[#c4956a]">Company</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/about" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Our Story</Link>
              <Link href="/contact" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Contact</Link>
              <Link href="/blog" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Journal</Link>
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-4 text-[10px] uppercase tracking-[0.2em] text-[#c4956a]">Policies</h4>
            <div className="space-y-2.5 text-sm">
              <Link href="/privacy-policy" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Privacy</Link>
              <Link href="/terms-and-conditions" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Terms</Link>
              <Link href="/refund-policy" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Refunds</Link>
              <Link href="/shipping-policy" className="block text-[#f5e6d3]/60 hover:text-[#f5e6d3] transition-colors">Shipping</Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-[10px] uppercase tracking-[0.2em] text-[#c4956a]">Support</h4>
            <div className="space-y-2.5 text-sm text-[#f5e6d3]/60">
              <p>{BUSINESS.email.support}</p>
              <p className="text-xs text-[#f5e6d3]/40">{BUSINESS.hours}</p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 pt-6 border-t border-[#f5e6d3]/10 flex flex-wrap items-center justify-center gap-5 md:gap-8 text-[10px] md:text-xs text-[#f5e6d3]/40">
          <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> Secure Payments</span>
          <span className="flex items-center gap-1.5"><Truck className="h-3 w-3" /> Free Shipping ₹1,599+</span>
          <span className="flex items-center gap-1.5"><RotateCcw className="h-3 w-3" /> 14-Day Returns</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="h-3 w-3" /> 100% Genuine</span>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-[#f5e6d3]/10 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] text-[#f5e6d3]/30">
          <div className="text-center md:text-left">
            <p>© 2025 {BUSINESS.legalName}. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4 text-[#f5e6d3]/40">
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
