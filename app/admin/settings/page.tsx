"use client"

import Link from "next/link"
import { BUSINESS } from "@/lib/constants"
import { MessageCircle, CreditCard, Truck, Mail, Bell, Shield, Globe, ChevronRight } from "lucide-react"

const integrations = [
  { href: "/admin/settings/whatsapp", icon: MessageCircle, label: "WhatsApp Business", desc: "Templates, automation flows, webhook & marketing", color: "text-emerald-600", bg: "bg-emerald-500/10" },
  { href: "#", icon: CreditCard, label: "Razorpay", desc: "Payment gateway configuration", color: "text-blue-600", bg: "bg-blue-500/10" },
  { href: "#", icon: Truck, label: "Shipping Partners", desc: "Delhivery, Shiprocket, Blue Dart, DTDC", color: "text-amber-600", bg: "bg-amber-500/10" },
  { href: "#", icon: Mail, label: "Email (Resend)", desc: "Transactional & marketing emails", color: "text-purple-600", bg: "bg-purple-500/10" },
  { href: "#", icon: Bell, label: "Push Notifications", desc: "Firebase push notifications", color: "text-red-600", bg: "bg-red-500/10" },
  { href: "#", icon: Globe, label: "Meta Pixel & Analytics", desc: "Facebook Pixel, Google Analytics, Conversion API", color: "text-indigo-600", bg: "bg-indigo-500/10" },
]

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Store configuration, integrations & business details</p>
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

      {/* Business Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground">Business Information</h3>
          <div className="space-y-2 text-xs">
            <Row label="Legal Name" value={BUSINESS.legalName} />
            <Row label="GSTIN" value={BUSINESS.gstin} mono />
            <Row label="CIN" value={BUSINESS.cin} mono />
            <Row label="Address" value={BUSINESS.fullAddress} />
            <Row label="Phone" value={BUSINESS.phone} />
            <Row label="Support Email" value={BUSINESS.email.support} />
          </div>
        </div>

        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground">Store Settings</h3>
          <div className="space-y-2 text-xs">
            <Row label="Currency" value="INR (₹)" />
            <Row label="Free Shipping Above" value="₹999" />
            <Row label="Shipping Fee" value="₹49" />
            <Row label="COD Fee" value="₹30" />
            <Row label="Return Window" value="30 days" />
            <Row label="Payment Gateway" value="Razorpay" />
          </div>
        </div>

        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground">SEO & Performance</h3>
          <div className="space-y-2 text-xs">
            <Row label="Sitemap" value="Active" status="active" />
            <Row label="Robots.txt" value="Active" status="active" />
            <Row label="Schema Markup" value="Active" status="active" />
            <Row label="Google Analytics" value="Pending" status="pending" />
            <Row label="Meta Pixel" value="Pending" status="pending" />
            <Row label="Core Web Vitals" value="Passing" status="active" />
          </div>
        </div>

        <div className="p-4 border border-border bg-card space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-[#c4956a]" /> Security</h3>
          <div className="space-y-2 text-xs">
            <Row label="SSL/HTTPS" value="Enabled" status="active" />
            <Row label="Auth Strategy" value="NextAuth + JWT" />
            <Row label="Password Hashing" value="bcrypt (10 rounds)" />
            <Row label="Admin Protection" value="Middleware" status="active" />
            <Row label="Rate Limiting" value="Configured" status="active" />
            <Row label="CORS" value="Restricted" status="active" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono, status }: { label: string; value: string; mono?: boolean; status?: "active" | "pending" }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${status === "active" ? "text-emerald-600 dark:text-emerald-400" : status === "pending" ? "text-amber-600" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}
