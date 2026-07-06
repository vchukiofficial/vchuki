"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Mail, Save, Plus, Trash2, Eye, EyeOff, Code, Palette, RefreshCw, Send } from "lucide-react"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { buildProductCarouselHtml } from "@/lib/email/productCarousel"

const SAMPLE_CAROUSEL_PRODUCTS = [
  { name: "Golden Dune Linen Half Sleeve Shirt", price: 699, image: "/shortsleevgoldenduneshortkurta.png", slug: "golden-dune-linen-half-sleeve-shirt" },
  { name: "Desert Sand Linen Full Sleeve Shirt", price: 799, image: "/shortsleevdesertsandshortkurta.png", slug: "desert-sand-linen-full-sleeve-shirt" },
  { name: "Ivory White Short Kurta Half Sleeve", price: 699, image: "/shortsleevwhiteshortkurta.png", slug: "ivory-white-short-kurta-half-sleeve" },
  { name: "Olive Green Linen Half Sleeve Shirt", price: 699, image: "/shortsleevolivegreenshortkurta.png", slug: "olive-green-linen-half-sleeve-shirt" },
]

interface Template {
  _id: string
  slug: string
  name: string
  subject: string
  body: string
  variables: string[]
  isActive: boolean
}

export default function AdminEmailTemplatesPage() {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Template | null>(null)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false })
  const [testEmail, setTestEmail] = useState("")
  const [testSendState, setTestSendState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  function fetchTemplates(selectFirst = false) {
    setLoading(true)
    fetch("/api/admin/email-templates", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const list = d.templates || []
        setTemplates(list)
        if (selectFirst && list.length > 0) setEditing({ ...list[0] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchTemplates(true) }, [])
  useEffect(() => {
    if (session?.user?.email && !testEmail) setTestEmail(session.user.email)
  }, [session, testEmail])

  async function seedDefaults() {
    const defaults = [
      { slug: "otp-verification", name: "OTP Verification", subject: "Your VCHUKI Verification Code — {{otp}}", variables: ["name", "otp"], body: '<h2 style="color:#2a1f14;">Verification Code</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, use this code to verify your identity:</p>\n<div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">\n  <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">{{otp}}</span>\n</div>\n<p style="color:#999;font-size:12px;">This code expires in 10 minutes. If you didn\'t request this, ignore this email.</p>' },
      { slug: "password-reset", name: "Password Reset", subject: "Reset Your VCHUKI Password", variables: ["name", "otp"], body: '<h2 style="color:#2a1f14;">Password Reset</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, use this code to reset your password:</p>\n<div style="background:#f5e6d3;padding:20px;text-align:center;margin:20px 0;border-left:4px solid #c4956a;">\n  <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#2a1f14;">{{otp}}</span>\n</div>\n<p style="color:#999;font-size:12px;">If you didn\'t request this, ignore this email.</p>' },
      { slug: "welcome", name: "Welcome Email", subject: "Welcome to VCHUKI, {{name}}!", variables: ["name"], body: '<h2 style="color:#2a1f14;">Welcome, {{name}}!</h2>\n<p style="color:#666;font-size:14px;">Thank you for joining VCHUKI. Explore our premium linen collection crafted in Jodhpur.</p>\n<div style="margin:24px 0;"><a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Collection</a></div>\n<p style="color:#999;font-size:12px;">Use code <strong>WELCOME10</strong> for 10% off your first order.</p>' },
      { slug: "order-confirmation", name: "Order Confirmation", subject: "Order Confirmed — #{{orderId}}", variables: ["orderId", "itemsTable", "discountLine", "finalAmount", "paymentMethod", "shippingAddress"], body: '<h2 style="color:#2a1f14;">Order Confirmed! \ud83c\udf89</h2>\n<p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #{{orderId}}</p>\n{{itemsTable}}\n{{discountLine}}\n<p style="font-size:16px;font-weight:bold;color:#2a1f14;">Total: \u20b9{{finalAmount}}</p>\n<p style="color:#666;font-size:12px;">Payment: {{paymentMethod}}</p>\n<div style="background:#f9f9f9;padding:12px;margin:16px 0;border-left:3px solid #c4956a;"><p style="font-size:11px;color:#c4956a;margin-bottom:4px;">DELIVERING TO</p><p style="font-size:13px;color:#333;margin:0;">{{shippingAddress}}</p></div>\n<a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;">Track Order</a>' },
      { slug: "shipping-update", name: "Shipping Update", subject: "Order Update — #{{orderId}}", variables: ["orderId", "statusMessage", "trackingInfo"], body: '<h2 style="color:#2a1f14;">Shipping Update</h2>\n<p style="color:#c4956a;font-size:12px;font-weight:bold;">Order #{{orderId}}</p>\n<div style="background:#f5e6d3;padding:16px;margin:16px 0;border-left:4px solid #c4956a;"><p style="font-size:14px;color:#2a1f14;margin:0;">{{statusMessage}}</p></div>\n{{trackingInfo}}\n<a href="https://vchuki.com/account/orders" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;margin-top:12px;">Track Order</a>' },
      { slug: "waitlist-confirmation", name: "VIP Waitlist Welcome", subject: "Welcome to VCHUKI VIP, #{{position}}! 🎉", variables: ["position", "perks"], body: '<h2 style="color:#2a1f14;">You\'re VIP #{{position}}!</h2>\n<p style="color:#666;font-size:14px;">Welcome to the VCHUKI inner circle. You\'ll get exclusive early access to our July collection drop.</p>\n{{perks}}\n<p style="color:#2a1f14;font-size:13px;font-weight:bold;">What happens next:</p>\n<ul style="color:#666;font-size:13px;padding-left:20px;"><li>We\'ll email you 2 hours before public launch</li><li>Your VIP discount will be auto-applied</li><li>Priority access to limited stock</li></ul>\n<div style="margin:24px 0;"><a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Preview Collection</a></div>\n<p style="color:#999;font-size:11px;">You\'re part of an exclusive group. Thank you for believing in VCHUKI.</p>' },
      { slug: "vip-launch-alert", name: "VIP Launch Alert", subject: "🚨 Your VIP Early Access is LIVE — 3 Hours Before Everyone!", variables: ["name", "discountCode", "shopLink", "productCarousel"], body: '<h2 style="color:#2a1f14;">It\'s GO Time! 🚀</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, as a VIP member your early access to our new collection is now <strong>LIVE</strong>. You have 3 hours before the public launch.</p>\n<div style="background:#f5e6d3;padding:20px;margin:20px 0;border-left:4px solid #c4956a;text-align:center;"><p style="font-size:11px;color:#c4956a;margin:0;text-transform:uppercase;letter-spacing:2px;">Your VIP Code</p><p style="font-size:28px;font-weight:bold;color:#2a1f14;margin:8px 0;letter-spacing:4px;">{{discountCode}}</p><p style="font-size:12px;color:#666;margin:0;">10% off + Free Shipping</p></div>\n<div style="margin:24px 0;text-align:center;"><a href="{{shopLink}}" style="background:#2a1f14;color:#f5e6d3;padding:14px 32px;text-decoration:none;font-size:13px;text-transform:uppercase;font-weight:bold;">Shop Now →</a></div>\n{{productCarousel}}\n<p style="color:#999;font-size:11px;text-align:center;">Limited stock. First come, first served.</p>' },
      { slug: "account-created", name: "Account Created", subject: "Your VCHUKI Account is Ready!", variables: ["name", "email", "phone"], body: '<h2 style="color:#2a1f14;">Account Created, {{name}}!</h2>\n<p style="color:#666;font-size:14px;">Your VCHUKI account has been created automatically.</p>\n<div style="background:#f5e6d3;padding:16px;margin:16px 0;border-left:4px solid #c4956a;"><p style="font-size:12px;color:#2a1f14;margin:0;"><strong>Login Details:</strong></p><p style="font-size:13px;color:#333;margin:4px 0 0;">Email: {{email}}<br>Password: Your phone number ({{phone}})</p></div>\n<div style="margin:24px 0;"><a href="https://vchuki.com/auth/login" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Login Now</a></div>' },
      { slug: "abandoned-cart", name: "Abandoned Cart Reminder", subject: "You left something behind, {{name}}!", variables: ["name", "itemsList", "cartLink"], body: '<h2 style="color:#2a1f14;">Still thinking it over?</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, you left some premium items in your bag:</p>\n{{itemsList}}\n<p style="color:#666;font-size:13px;">Complete your order before they sell out.</p>\n<div style="margin:24px 0;"><a href="{{cartLink}}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Complete Purchase</a></div>\n<p style="color:#999;font-size:11px;">Free shipping on orders above \u20b91,599</p>' },
      { slug: "order-cancelled", name: "Order Cancelled", subject: "Order #{{orderId}} Cancelled", variables: ["name", "orderId", "reason", "refundInfo"], body: '<h2 style="color:#2a1f14;">Order Cancelled</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, your order <strong>#{{orderId}}</strong> has been cancelled.</p>\n<div style="background:#fef2f2;padding:16px;margin:16px 0;border-left:4px solid #ef4444;"><p style="font-size:13px;color:#333;margin:0;">Reason: {{reason}}</p></div>\n{{refundInfo}}\n<p style="color:#666;font-size:13px;">If this was a mistake, you can place a new order anytime.</p>\n<div style="margin:24px 0;"><a href="https://vchuki.com/shirts" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Again</a></div>' },
      { slug: "refund-processed", name: "Refund Processed", subject: "Refund Processed \u2014 #{{orderId}}", variables: ["name", "orderId", "refundAmount", "refundMethod"], body: '<h2 style="color:#2a1f14;">Refund Processed</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, your refund for order <strong>#{{orderId}}</strong> has been processed.</p>\n<div style="background:#f0fdf4;padding:16px;margin:16px 0;border-left:4px solid #22c55e;"><p style="font-size:14px;color:#166534;margin:0;font-weight:bold;">\u20b9{{refundAmount}} refunded</p><p style="font-size:12px;color:#666;margin:6px 0 0;">Via: {{refundMethod}}</p></div>\n<p style="color:#999;font-size:12px;">Please allow 5-7 business days for the amount to reflect.</p>' },
      { slug: "payment-failed", name: "Payment Failed", subject: "Payment Failed \u2014 Action Required", variables: ["name", "orderId", "amount"], body: '<h2 style="color:#2a1f14;">Payment Failed</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, your payment of <strong>\u20b9{{amount}}</strong> for order #{{orderId}} could not be processed.</p>\n<div style="background:#fef2f2;padding:16px;margin:16px 0;border-left:4px solid #ef4444;"><p style="font-size:13px;color:#333;margin:0;">Please try again with a different payment method.</p></div>\n<div style="margin:24px 0;"><a href="https://vchuki.com/cart" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Retry Payment</a></div>\n<p style="color:#999;font-size:11px;">Your items are reserved for 30 minutes.</p>' },
      { slug: "review-request", name: "Review Request", subject: "How was your VCHUKI order, {{name}}?", variables: ["name", "orderId", "productName", "reviewLink"], body: '<h2 style="color:#2a1f14;">How was your order?</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, we hope you\'re loving your <strong>{{productName}}</strong>!</p>\n<p style="color:#666;font-size:13px;">Your feedback helps other customers and helps us improve. It only takes a minute.</p>\n<div style="margin:24px 0;"><a href="{{reviewLink}}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Write a Review</a></div>\n<p style="color:#c4956a;font-size:12px;">\u2b50 Reviewers get 5% off their next order!</p>' },
      { slug: "back-in-stock", name: "Back in Stock", subject: "Good News! {{productName}} is Back in Stock", variables: ["name", "productName", "productLink"], body: '<h2 style="color:#2a1f14;">It\'s Back! \ud83c\udf89</h2>\n<p style="color:#666;font-size:14px;">Hi {{name}}, great news! <strong>{{productName}}</strong> is back in stock.</p>\n<p style="color:#666;font-size:13px;">Don\'t miss it this time \u2014 our popular items sell out fast.</p>\n<div style="margin:24px 0;"><a href="{{productLink}}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;">Shop Now</a></div>\n<p style="color:#999;font-size:11px;">Limited stock available.</p>' },
      { slug: "promo-blast", name: "Promotional / Newsletter", subject: "{{subject}}", variables: ["subject", "heading", "content", "productCarousel", "ctaText", "ctaLink"], body: '<h2 style="color:#2a1f14;font-size:22px;font-weight:300;">{{heading}}</h2>\n<div style="color:#666;font-size:14px;line-height:1.6;">{{content}}</div>\n{{productCarousel}}\n<div style="margin:28px 0 12px;text-align:center;"><a href="{{ctaLink}}" style="background:#2a1f14;color:#f5e6d3;padding:14px 32px;text-decoration:none;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;display:inline-block;">{{ctaText}}</a></div>\n<p style="color:#999;font-size:11px;text-align:center;margin-top:16px;">Free shipping on orders above ₹1,599 · 7-day easy returns</p>' },
    ]
    for (const tpl of defaults) {
      await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...tpl, isActive: true }),
      })
    }
    fetchTemplates()
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    const method = editing._id ? "PUT" : "POST"
    const url = editing._id ? `/api/admin/email-templates/${editing._id}` : "/api/admin/email-templates"
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(editing),
    })
    if (res.ok) {
      setEditing(null)
      fetchTemplates()
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteDialog.id) return
    await fetch(`/api/admin/email-templates/${deleteDialog.id}`, { method: "DELETE", credentials: "include" })
    setDeleteDialog({ open: false })
    setEditing(null)
    fetchTemplates()
  }

  function handleNew() {
    setEditing({
      _id: "",
      slug: "",
      name: "",
      subject: "",
      body: "",
      variables: [],
      isActive: true,
    })
  }

  function renderPreview(body: string) {
    // Replace variables with sample data for preview
    return body
      .replace(/\{\{name\}\}/g, "Rahul Sharma")
      .replace(/\{\{otp\}\}/g, "1111")
      .replace(/\{\{orderId\}\}/g, "A7F2B3C1")
      .replace(/\{\{finalAmount\}\}/g, "1,598")
      .replace(/\{\{paymentMethod\}\}/g, "Cash on Delivery")
      .replace(/\{\{shippingAddress\}\}/g, "Rahul Sharma<br>45 Nehru Nagar<br>Delhi, Delhi - 110001<br>📞 9876543211")
      .replace(/\{\{statusMessage\}\}/g, "Your order has been shipped and is in transit.")
      .replace(/\{\{trackingInfo\}\}/g, '<p style="color:#666;font-size:12px;">Tracking: Delhivery — DL7892345</p>')
      .replace(/\{\{itemsTable\}\}/g, '<table style="width:100%;border-collapse:collapse;margin:16px 0;"><tr style="background:#f5e6d3;"><th style="padding:8px;text-align:left;font-size:11px;">Item</th><th style="padding:8px;">Qty</th><th style="padding:8px;text-align:right;">Price</th></tr><tr><td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;">Desert Sand Linen Shirt (M/Desert Sand)</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">×2</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">₹799</td></tr></table>')
      .replace(/\{\{discountLine\}\}/g, '<p style="color:#059669;font-size:13px;">Discount: -₹100</p>')
      .replace(/\{\{itemsList\}\}/g, '<ul style="color:#333;font-size:13px;"><li>Desert Sand Linen Shirt — ₹799</li><li>Royal Indigo Kurta — ₹899</li></ul>')
      .replace(/\{\{productCarousel\}\}/g, buildProductCarouselHtml(SAMPLE_CAROUSEL_PRODUCTS))
  }

  function fullPreviewHtml(body: string) {
    return `<div style="background:#2a1f14;padding:28px 24px;text-align:center;">
      <img src="https://vchuki.com/marko-white.png" alt="VCHUKI" width="36" height="36" style="display:block;margin:0 auto 10px;" />
      <span style="color:#f5e6d3;font-size:20px;font-weight:600;letter-spacing:5px;display:block;">VCHUKI</span>
      <p style="color:#c4956a;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:6px 0 0;">Premium Linen Blend — Crafted in Jodhpur</p>
    </div>
    <div style="padding:24px;">${renderPreview(body)}</div>
    <div style="background:#f9f6f3;padding:16px;text-align:center;border-top:1px solid #eee;">
      <p style="color:#999;font-size:11px;margin:0;">VCHUKI Fashion Private Limited · Jodhpur, Rajasthan 342001</p>
    </div>`
  }

  async function handleSendTest() {
    if (!editing || !testEmail.trim()) return
    setTestSendState("sending")
    try {
      const res = await fetch("/api/admin/email-templates/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: testEmail.trim(),
          subject: renderPreview(editing.subject),
          html: fullPreviewHtml(editing.body),
        }),
      })
      setTestSendState(res.ok ? "sent" : "error")
    } catch {
      setTestSendState("error")
    }
    setTimeout(() => setTestSendState("idle"), 3000)
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading templates...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#c4956a]" /> Email Templates
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{templates.length} templates · Edit HTML, preview live, manage all transactional emails</p>
        </div>
        <div className="flex gap-2">
          <button onClick={seedDefaults} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <RefreshCw className="h-3 w-3" /> Seed Defaults
          </button>
          <button onClick={handleNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90">
            <Plus className="h-3 w-3" /> New Template
          </button>
          <button onClick={() => fetchTemplates()} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        {/* Template List */}
        <div className="space-y-1.5 border border-border p-3 bg-card max-h-[70vh] overflow-y-auto">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">All Templates</p>
          {templates.map(t => (
            <button
              key={t._id}
              onClick={() => { setEditing({ ...t }); setPreview(false) }}
              className={`w-full text-left p-3 border transition-colors ${editing?._id === t._id ? "border-[#c4956a] bg-[#c4956a]/5" : "border-border hover:border-[#c4956a]/30"}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-foreground">{t.name}</p>
                {!t.isActive && <EyeOff className="h-3 w-3 text-muted-foreground" />}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{t.slug}</p>
            </button>
          ))}
        </div>

        {/* Editor */}
        {editing ? (
          <div className="border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">{editing._id ? "Edit Template" : "New Template"}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(!preview)} className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium border transition-colors ${preview ? "border-[#c4956a] text-[#c4956a]" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  <Eye className="h-3 w-3" /> {preview ? "Editor" : "Preview"}
                </button>
                {editing._id && (
                  <button onClick={() => setDeleteDialog({ open: true, id: editing._id })} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider disabled:opacity-50">
                  <Save className="h-3 w-3" /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {!preview ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Template Name</label>
                    <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" placeholder="OTP Verification" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Slug (unique ID)</label>
                    <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground font-mono focus:outline-none focus:border-[#c4956a]/50" placeholder="otp-verification" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Subject Line</label>
                  <input value={editing.subject} onChange={e => setEditing({ ...editing, subject: e.target.value })} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" placeholder="Your VCHUKI Verification Code" />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1"><Code className="h-3 w-3" /> HTML Body</label>
                    <span className="text-[9px] text-muted-foreground">Use {"{{variable}}"} for dynamic content</span>
                  </div>
                  <textarea
                    value={editing.body}
                    onChange={e => setEditing({ ...editing, body: e.target.value })}
                    rows={16}
                    className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground font-mono focus:outline-none focus:border-[#c4956a]/50 resize-y leading-relaxed"
                    placeholder='<h2 style="color:#2a1f14;">Hello {{name}}</h2>'
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Variables (comma-separated)</label>
                  <input value={editing.variables.join(", ")} onChange={e => setEditing({ ...editing, variables: e.target.value.split(",").map(v => v.trim()).filter(Boolean) })} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground font-mono focus:outline-none focus:border-[#c4956a]/50" placeholder="name, otp, orderId" />
                </div>

                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" checked={editing.isActive} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} className="accent-[#c4956a]" />
                  Active
                </label>
              </div>
            ) : (
              /* Live Preview */
              <div className="border border-border">
                <div className="bg-muted/30 px-3 py-2 border-b border-border flex items-center gap-2 flex-wrap">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Preview — Subject: <span className="text-foreground font-medium">{editing.subject.replace(/\{\{orderId\}\}/g, "A7F2B3C1")}</span></span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={e => setTestEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="px-2 py-1 border border-border bg-background text-[10px] text-foreground w-40 focus:outline-none focus:border-[#c4956a]/50"
                    />
                    <button
                      onClick={handleSendTest}
                      disabled={testSendState === "sending" || !testEmail.trim()}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium border transition-colors disabled:opacity-50 ${
                        testSendState === "sent" ? "border-emerald-500/40 text-emerald-600" : testSendState === "error" ? "border-red-500/40 text-red-500" : "border-[#c4956a]/40 text-[#c4956a] hover:bg-[#c4956a]/5"
                      }`}
                    >
                      <Send className="h-3 w-3" />
                      {testSendState === "sending" ? "Sending…" : testSendState === "sent" ? "Sent!" : testSendState === "error" ? "Failed" : "Send Test"}
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-[#f5f5f5]">
                  <div className="max-w-[600px] mx-auto bg-white shadow-sm">
                    {/* Header */}
                    <div style={{ background: "#2a1f14", padding: "28px 24px", textAlign: "center" }}>
                      <img src="/marko-white.png" alt="VCHUKI" width={36} height={36} style={{ display: "block", margin: "0 auto 10px" }} />
                      <span style={{ color: "#f5e6d3", fontSize: "20px", fontWeight: 600, letterSpacing: "5px", display: "block" }}>VCHUKI</span>
                      <p style={{ color: "#c4956a", fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "6px 0 0" }}>Premium Linen Blend — Crafted in Jodhpur</p>
                    </div>
                    {/* Body */}
                    <div className="p-6" dangerouslySetInnerHTML={{ __html: renderPreview(editing.body) }} />
                    {/* Footer */}
                    <div style={{ background: "#f9f6f3", padding: "16px", textAlign: "center", borderTop: "1px solid #eee" }}>
                      <p style={{ color: "#999", fontSize: "11px", margin: 0 }}>VCHUKI Fashion Private Limited · Jodhpur, Rajasthan 342001</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-border flex items-center justify-center py-20 text-center">
            <div>
              <Mail className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Select a template to edit</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Or create a new one</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleDelete}
        title="Delete Template?"
        description="This email template will be permanently deleted."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
