"use client"

import { useState } from "react"
import { Truck, Settings } from "lucide-react"

interface ShippingPartner {
  id: string
  name: string
  logo: string
  isActive: boolean
  apiKey: string
  apiSecret: string
  webhookUrl: string
  features: string[]
}

const DEFAULT_PARTNERS: ShippingPartner[] = [
  { id: "delhivery", name: "Delhivery", logo: "🚚", isActive: false, apiKey: "", apiSecret: "", webhookUrl: "", features: ["Surface", "Express", "Same Day", "Reverse Pickup"] },
  { id: "shiprocket", name: "Shiprocket", logo: "🚀", isActive: false, apiKey: "", apiSecret: "", webhookUrl: "", features: ["Multi-Courier", "Auto AWB", "NDR Management", "COD Remittance"] },
  { id: "bluedart", name: "Blue Dart", logo: "📦", isActive: false, apiKey: "", apiSecret: "", webhookUrl: "", features: ["Express", "Dart Apex", "Smart Box", "Temperature Controlled"] },
  { id: "dtdc", name: "DTDC", logo: "📬", isActive: false, apiKey: "", apiSecret: "", webhookUrl: "", features: ["Lite", "Priority", "Express", "Reverse Logistics"] },
]

export default function ShippingSettingsPage() {
  const [partners, setPartners] = useState<ShippingPartner[]>(DEFAULT_PARTNERS)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function handleToggle(id: string) {
    const partner = partners.find(p => p.id === id)
    if (partner && !partner.isActive && (!partner.apiKey || !partner.apiSecret)) {
      alert(`Cannot enable ${partner.name} without API Key and API Secret. Please configure credentials first.`)
      return
    }
    setPartners(partners.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSave(_id: string) {
    setSaving(true)
    setTimeout(() => { setSaving(false); setEditing(null) }, 600)
  }

  function updatePartner(id: string, field: string, value: string) {
    setPartners(partners.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Truck className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Shipping Partners</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Configure delivery partners — Delhivery, Shiprocket, Blue Dart, DTDC</p>
        </div>
      </div>

      {/* Partners */}
      <div className="space-y-3">
        {partners.map(partner => (
          <div key={partner.id} className={`border bg-card transition-colors ${partner.isActive ? "border-emerald-500/20" : "border-border"}`}>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{partner.logo}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{partner.name}</p>
                    {partner.isActive ? (
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 font-medium">Active</span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground font-medium">Inactive</span>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-1">
                    {partner.features.map(f => (
                      <span key={f} className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(editing === partner.id ? null : partner.id)} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="h-3 w-3" />
                </button>
                <button onClick={() => handleToggle(partner.id)} className={`relative w-10 h-5 rounded-full transition-colors ${partner.isActive ? "bg-emerald-500" : "bg-border"}`}>
                  <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform" style={{ left: partner.isActive ? "22px" : "2px" }} />
                </button>
              </div>
            </div>

            {/* Config Panel */}
            {editing === partner.id && (
              <div className="border-t border-border p-4 bg-card/50 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">API Key *</label>
                    <input value={partner.apiKey} onChange={e => updatePartner(partner.id, "apiKey", e.target.value)} placeholder="Enter API key" className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">API Secret / Token *</label>
                    <input type="password" value={partner.apiSecret} onChange={e => updatePartner(partner.id, "apiSecret", e.target.value)} placeholder="Enter API secret" className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Webhook URL</label>
                    <input value={partner.webhookUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/${partner.id}`} onChange={e => updatePartner(partner.id, "webhookUrl", e.target.value)} className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
                  </div>
                </div>
                <button onClick={() => handleSave(partner.id)} disabled={saving} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
                  {saving ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Default Shipping Rules */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground">Shipping Rules</h3>
        <div className="grid md:grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between items-center p-2 border border-border">
            <span className="text-muted-foreground">Free Shipping Above</span>
            <span className="font-medium text-foreground">₹999</span>
          </div>
          <div className="flex justify-between items-center p-2 border border-border">
            <span className="text-muted-foreground">Default Shipping Fee</span>
            <span className="font-medium text-foreground">₹49</span>
          </div>
          <div className="flex justify-between items-center p-2 border border-border">
            <span className="text-muted-foreground">COD Fee</span>
            <span className="font-medium text-foreground">₹30</span>
          </div>
          <div className="flex justify-between items-center p-2 border border-border">
            <span className="text-muted-foreground">Default Courier</span>
            <span className="font-medium text-foreground">Delhivery</span>
          </div>
        </div>
      </div>
    </div>
  )
}
