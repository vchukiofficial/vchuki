"use client"
import { BUSINESS } from "@/lib/constants"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold tracking-tight">Settings</h1><p className="text-xs text-muted-foreground mt-0.5">Store configuration & business details</p></div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <h3 className="text-sm font-medium">Business Information</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Legal Name</span><span>{BUSINESS.legalName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">GSTIN</span><span className="font-mono">{BUSINESS.gstin}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">CIN</span><span className="font-mono">{BUSINESS.cin}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-right max-w-[200px]">{BUSINESS.fullAddress}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{BUSINESS.phone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Support Email</span><span>{BUSINESS.email.support}</span></div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card space-y-3">
          <h3 className="text-sm font-medium">Store Settings</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>INR (₹)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Free Shipping Above</span><span>₹999</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping Fee</span><span>₹49</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">COD Fee</span><span>₹30</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Return Window</span><span>30 days</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Gateway</span><span>Razorpay</span></div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card space-y-3">
          <h3 className="text-sm font-medium">SEO & Integrations</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Sitemap</span><span className="text-green-600">Active</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Robots.txt</span><span className="text-green-600">Active</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Schema Markup</span><span className="text-green-600">Active</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Google Analytics</span><span className="text-yellow-600">Pending</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Meta Pixel</span><span className="text-yellow-600">Pending</span></div>
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card space-y-3">
          <h3 className="text-sm font-medium">Security</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">SSL/HTTPS</span><span className="text-green-600">Enabled</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Auth Strategy</span><span>JWT</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Password Hashing</span><span>bcrypt (10 rounds)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Admin Protection</span><span className="text-green-600">Middleware</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
