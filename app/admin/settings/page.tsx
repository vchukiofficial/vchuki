"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BUSINESS } from "@/lib/constants"
import { MessageCircle, CreditCard, Truck, Mail, Bell, Shield, Globe, ChevronRight, FileText, Store, Palette, Server, Database, Settings2 } from "lucide-react"

const integrations = [
  { href: "/admin/settings/whatsapp", icon: MessageCircle, label: "WhatsApp Business", desc: "Templates, automation flows, webhook & marketing", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { href: "/admin/settings/razorpay", icon: CreditCard, label: "Razorpay", desc: "Payment gateway configuration", color: "text-blue-600", bg: "bg-blue-500/10" },
  { href: "/admin/settings/shipping", icon: Truck, label: "Shipping Partners", desc: "Delhivery, Shiprocket, Blue Dart, DTDC", color: "text-amber-600", bg: "bg-amber-500/10" },
  { href: "/admin/settings/email", icon: Mail, label: "Email (Resend)", desc: "Transactional & marketing emails", color: "text-purple-600", bg: "bg-purple-500/10" },
  { href: "/admin/settings/push-notifications", icon: Bell, label: "Push Notifications", desc: "Firebase push notifications", color: "text-red-600", bg: "bg-red-500/10" },
  { href: "/admin/settings/meta-pixel", icon: Globe, label: "Meta Pixel & Analytics", desc: "Facebook Pixel, Google Analytics, Conversion API", color: "text-indigo-600", bg: "bg-indigo-500/10" },
]

export default function AdminSettingsPage() {
  const [productCount, setProductCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    fetch("/api/products?limit=1").then(r => r.json()).then(d => setProductCount(d.total || d.products?.length || 0)).catch(() => {})
    fetch("/api/orders", { credentials: "include" }).then(r => r.json()).then(d => setOrderCount(d.orders?.length || 0)).catch(() => {})
    fetch("/api/reviews", { credentials: "include" }).then(r => r.json()).then(d => setReviewCount(d.reviews?.length || 0)).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Store configuration, integrations & all system content</p>
      </div>

      {/* System Overview */}
      <div className="p-4 border border-[#c4956a]/20 bg-[#c4956a]/5">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-[#c4956a]" />
          <h2 className="text-sm font-medium text-foreground">System Content Overview</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-background border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Products</p>
            <p className="text-lg font-semibold text-foreground mt-1">{productCount}</p>
          </div>
          <div className="p-3 bg-background border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Orders</p>
            <p className="text-lg font-semibold text-foreground mt-1">{orderCount}</p>
          </div>
          <div className="p-3 bg-background border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Reviews</p>
            <p className="text-lg font-semibold text-foreground mt-1">{reviewCount}</p>
          </div>
          <div className="p-3 bg-background border border-border">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pages</p>
            <p className="text-lg font-semibold text-foreground mt-1">12</p>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div>
        <h2 className="text-sm font-medium text-foreground mb-3">Integrations</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {integrations.map(item => (
            <Link key={item.label} href={item.href} className="p-4 border border-border bg-card hover:border-[#c4956a]/20 transition-colors flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Business Info + Store Settings */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Store className="h-3.5 w-3.5 text-[#c4956a]" /> Business Information</h3>
          <div className="space-y-2 text-xs">
            <Row label="Legal Name" value={BUSINESS.legalName} />
            <Row label="Brand Name" value={BUSINESS.name} />
            <Row label="GSTIN" value={BUSINESS.gstin} mono />
            <Row label="CIN" value={BUSINESS.cin} mono />
            <Row label="Address" value={BUSINESS.fullAddress} />
            <Row label="Phone" value={BUSINESS.phone} />
            <Row label="Support Email" value={BUSINESS.email.support} />
            <Row label="Business Email" value={BUSINESS.email.business} />
            <Row label="Returns Email" value={BUSINESS.email.returns} />
            <Row label="Business Hours" value={BUSINESS.hours} />
            <Row label="Founded" value={BUSINESS.founded} />
            <Row label="Domain" value={BUSINESS.domain} />
            <Row label="Tagline" value={BUSINESS.tagline} />
          </div>
        </div>

        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Settings2 className="h-3.5 w-3.5 text-[#c4956a]" /> Store Configuration</h3>
          <div className="space-y-2 text-xs">
            <Row label="Currency" value="INR (₹)" />
            <Row label="Free Shipping Above" value="₹1,599" />
            <Row label="Shipping Fee" value="₹49" />
            <Row label="COD Fee" value="₹30" />
            <Row label="Return Window" value="30 days" />
            <Row label="Payment Gateway" value="Razorpay" />
            <Row label="Shipping Partners" value="Delhivery, Shiprocket, Blue Dart, DTDC" />
            <Row label="COD Available" value="Yes" status="active" />
            <Row label="Guest Checkout" value="Enabled" status="active" />
            <Row label="Wishlist" value="Enabled" status="active" />
            <Row label="Reviews" value="Enabled" status="active" />
            <Row label="Combo Offers" value="Enabled" status="active" />
          </div>
        </div>
      </div>

      {/* Content Pages & Policies */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-[#c4956a]" /> Content Pages & Policies</h3>
        <div className="grid md:grid-cols-3 gap-2">
          {[
            { name: "Homepage", path: "/", status: "live" },
            { name: "Products Listing", path: "/shirts", status: "live" },
            { name: "Product Detail", path: "/product/[slug]", status: "live" },
            { name: "Cart", path: "/cart", status: "live" },
            { name: "Checkout", path: "/checkout", status: "live" },
            { name: "About Us", path: "/about", status: "live" },
            { name: "Contact", path: "/contact", status: "live" },
            { name: "Privacy Policy", path: "/privacy-policy", status: "live" },
            { name: "Terms & Conditions", path: "/terms-and-conditions", status: "live" },
            { name: "Refund Policy", path: "/refund-policy", status: "live" },
            { name: "Shipping Policy", path: "/shipping-policy", status: "live" },
            { name: "Blog", path: "/blog", status: "live" },
          ].map(page => (
            <div key={page.path} className="flex items-center justify-between p-2 border border-border hover:border-[#c4956a]/20 transition-colors">
              <div>
                <p className="text-xs font-medium text-foreground">{page.name}</p>
                <p className="text-[9px] text-muted-foreground font-mono">{page.path}</p>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium uppercase">{page.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Social Media */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-[#c4956a]" /> Social Media Links</h3>
        <div className="space-y-2 text-xs">
          <Row label="Instagram" value={BUSINESS.social.instagram} />
          <Row label="Twitter/X" value={BUSINESS.social.twitter} />
          <Row label="Facebook" value={BUSINESS.social.facebook} />
          <Row label="YouTube" value={BUSINESS.social.youtube} />
          <Row label="Pinterest" value={BUSINESS.social.pinterest} />
        </div>
      </div>

      {/* SEO & Tech */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Server className="h-3.5 w-3.5 text-[#c4956a]" /> SEO & Performance</h3>
          <div className="space-y-2 text-xs">
            <Row label="Sitemap" value="Active" status="active" />
            <Row label="Robots.txt" value="Active" status="active" />
            <Row label="Schema Markup" value="Product + Org + BreadcrumbList" status="active" />
            <Row label="Open Graph" value="Active" status="active" />
            <Row label="Twitter Cards" value="Active" status="active" />
            <Row label="Canonical URLs" value="Active" status="active" />
            <Row label="Google Analytics" value="Pending" status="pending" />
            <Row label="Meta Pixel" value="Pending" status="pending" />
            <Row label="Core Web Vitals" value="Passing" status="active" />
            <Row label="Image Optimization" value="Next/Image" status="active" />
          </div>
        </div>

        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-[#c4956a]" /> Security & Tech Stack</h3>
          <div className="space-y-2 text-xs">
            <Row label="SSL/HTTPS" value="Enabled" status="active" />
            <Row label="Auth Strategy" value="NextAuth + JWT" />
            <Row label="Password Hashing" value="bcrypt (10 rounds)" />
            <Row label="Admin Protection" value="Middleware + Role Check" status="active" />
            <Row label="Rate Limiting" value="Configured" status="active" />
            <Row label="CORS" value="Restricted" status="active" />
            <Row label="Framework" value="Next.js 15" />
            <Row label="Language" value="TypeScript" />
            <Row label="Styling" value="Tailwind CSS" />
            <Row label="Database" value="MongoDB + Mongoose" />
            <Row label="Hosting" value="Vercel" />
            <Row label="Animations" value="Framer Motion" />
          </div>
        </div>
      </div>

      {/* Product Categories in System */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Palette className="h-3.5 w-3.5 text-[#c4956a]" /> Product Categories & Taxonomy</h3>
        <div className="flex flex-wrap gap-2">
          {["Full Sleeve Shirt", "Half Sleeve Shirt", "Full Sleeve Kurta", "Half Sleeve Kurta", "Linen", "Premium Collection", "New Arrivals", "Best Sellers"].map(cat => (
            <span key={cat} className="text-[10px] px-2.5 py-1 border border-border text-foreground">{cat}</span>
          ))}
        </div>
        <div className="pt-2 border-t border-border space-y-2 text-xs">
          <Row label="Size Options" value="S, M, L, XL, XXL" />
          <Row label="Fit Types" value="Slim, Regular, Relaxed" />
          <Row label="Fabric Types" value="Linen, Cotton, Blended" />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono, status }: { label: string; value: string; mono?: boolean; status?: "active" | "pending" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${status === "active" ? "text-emerald-600 dark:text-emerald-400" : status === "pending" ? "text-amber-600" : "text-foreground"} text-right max-w-[60%] truncate`}>
        {value}
      </span>
    </div>
  )
}
