"use client"

import { useState } from "react"
import { Globe, CheckCircle, AlertTriangle } from "lucide-react"

export default function MetaPixelSettingsPage() {
  const [config, setConfig] = useState({
    fbPixelId: "",
    fbAccessToken: "",
    gaId: "",
    gaMeasurementId: "",
    conversionApiEnabled: false,
    isActive: false,
  })
  const [saving, setSaving] = useState(false)

  function handleEnable() {
    if (!config.isActive && !config.fbPixelId && !config.gaId) {
      alert("Cannot enable without at least one tracking ID (Facebook Pixel ID or Google Analytics ID).")
      return
    }
    setConfig({ ...config, isActive: !config.isActive })
  }

  function handleSave() {
    setSaving(true)
    setTimeout(() => setSaving(false), 600)
  }

  const events = [
    { name: "PageView", desc: "Track all page views", active: true },
    { name: "ViewContent", desc: "Product page views", active: true },
    { name: "AddToCart", desc: "Add to cart actions", active: true },
    { name: "InitiateCheckout", desc: "Checkout started", active: true },
    { name: "Purchase", desc: "Completed purchases", active: true },
    { name: "Search", desc: "Product searches", active: false },
    { name: "AddToWishlist", desc: "Wishlist additions", active: false },
    { name: "CompleteRegistration", desc: "New user signups", active: true },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
            <Globe className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">Meta Pixel & Analytics</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Facebook Pixel, Google Analytics, Conversion API</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium ${config.isActive ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
            <span className={`w-2 h-2 rounded-full ${config.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            {config.isActive ? "Active" : "Inactive"}
          </span>
          <button onClick={handleEnable} className="px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            {config.isActive ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      {/* Facebook Pixel */}
      <div className="p-4 border border-border bg-card space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">f</span>
          Facebook Pixel
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pixel ID *</label>
            <input value={config.fbPixelId} onChange={e => setConfig({ ...config, fbPixelId: e.target.value })} placeholder="123456789012345" className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Conversion API Access Token</label>
            <input type="password" value={config.fbAccessToken} onChange={e => setConfig({ ...config, fbAccessToken: e.target.value })} placeholder="EAAx..." className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
          <input type="checkbox" checked={config.conversionApiEnabled} onChange={e => setConfig({ ...config, conversionApiEnabled: e.target.checked })} className="accent-[#c4956a]" />
          Enable Conversion API (Server-side tracking)
        </label>
        {config.conversionApiEnabled && !config.fbAccessToken && (
          <p className="text-[10px] text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Access Token required for Conversion API</p>
        )}
      </div>

      {/* Google Analytics */}
      <div className="p-4 border border-border bg-card space-y-4">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center text-white text-[9px] font-bold">G</span>
          Google Analytics 4
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Measurement ID *</label>
            <input value={config.gaMeasurementId} onChange={e => setConfig({ ...config, gaMeasurementId: e.target.value })} placeholder="G-XXXXXXXXXX" className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Stream ID</label>
            <input value={config.gaId} onChange={e => setConfig({ ...config, gaId: e.target.value })} placeholder="1234567890" className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
        {saving ? "Saving..." : "Save All Configuration"}
      </button>

      {/* Tracked Events */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground">Tracked Events</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {events.map(event => (
            <div key={event.name} className={`flex items-center justify-between p-2.5 border ${event.active ? "border-emerald-500/20" : "border-border"}`}>
              <div className="flex items-center gap-2">
                {event.active ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <Globe className="h-3 w-3 text-muted-foreground/30" />}
                <div>
                  <p className="text-[10px] font-medium text-foreground font-mono">{event.name}</p>
                  <p className="text-[9px] text-muted-foreground">{event.desc}</p>
                </div>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 font-medium ${event.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {event.active ? "ON" : "OFF"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Guide */}
      <div className="p-4 border border-border bg-card">
        <div className="p-3 bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Setup Guide:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
            <li>Facebook Pixel: Go to Events Manager → Create Pixel → Copy Pixel ID</li>
            <li>Conversion API: Generate System User Token in Business Settings</li>
            <li>Google Analytics: Create GA4 property → Get Measurement ID (G-XXXX)</li>
            <li>Verify events are firing using Facebook Pixel Helper & GA Debugger</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
