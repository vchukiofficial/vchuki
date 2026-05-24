"use client"

import { useState } from "react"
import { Bell, CheckCircle } from "lucide-react"

export default function PushNotificationsSettingsPage() {
  const [config, setConfig] = useState({
    projectId: "",
    serverKey: "",
    vapidKey: "",
    isActive: false,
  })
  const [saving, setSaving] = useState(false)

  function handleEnable() {
    if (!config.isActive && (!config.projectId || !config.serverKey)) {
      alert("Cannot enable Push Notifications without Firebase Project ID and Server Key.")
      return
    }
    setConfig({ ...config, isActive: !config.isActive })
  }

  function handleSave() {
    if (!config.projectId || !config.serverKey) { alert("Project ID and Server Key are required."); return }
    setSaving(true)
    setTimeout(() => setSaving(false), 600)
  }

  const notificationTypes = [
    { name: "Order Placed", desc: "Notify when order is confirmed", active: true },
    { name: "Order Shipped", desc: "Notify when order is dispatched", active: true },
    { name: "Order Delivered", desc: "Notify on delivery", active: true },
    { name: "Flash Sale Alert", desc: "Notify about flash sales", active: false },
    { name: "Back in Stock", desc: "Notify when wishlist item restocks", active: false },
    { name: "Price Drop", desc: "Notify on price reduction", active: false },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">Push Notifications</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Firebase Cloud Messaging configuration</p>
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

      {/* Firebase Config */}
      <div className="p-4 border border-border bg-card space-y-4">
        <h3 className="text-sm font-medium text-foreground">Firebase Configuration</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Project ID *</label>
            <input value={config.projectId} onChange={e => setConfig({ ...config, projectId: e.target.value })} placeholder="vchuki-app" className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Server Key (FCM) *</label>
            <input type="password" value={config.serverKey} onChange={e => setConfig({ ...config, serverKey: e.target.value })} placeholder="AAAA..." className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">VAPID Key (Web Push)</label>
            <input value={config.vapidKey} onChange={e => setConfig({ ...config, vapidKey: e.target.value })} placeholder="BN..." className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      {/* Notification Types */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground">Notification Types</h3>
        <div className="space-y-2">
          {notificationTypes.map(n => (
            <div key={n.name} className={`flex items-center justify-between p-3 border ${n.active ? "border-emerald-500/20" : "border-border"}`}>
              <div className="flex items-center gap-2">
                {n.active ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Bell className="h-3.5 w-3.5 text-muted-foreground/40" />}
                <div>
                  <p className="text-xs font-medium text-foreground">{n.name}</p>
                  <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 font-medium ${n.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {n.active ? "Active" : "Inactive"}
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
            <li>Create a Firebase project at console.firebase.google.com</li>
            <li>Enable Cloud Messaging in project settings</li>
            <li>Copy Server Key from Cloud Messaging tab</li>
            <li>Generate VAPID key pair for web push</li>
            <li>Add Firebase config to your app</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
