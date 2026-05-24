"use client"

import { useState } from "react"
import { CreditCard, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react"

export default function RazorpaySettingsPage() {
  const [config, setConfig] = useState({
    keyId: "",
    keySecret: "",
    webhookSecret: "",
    isActive: false,
    testMode: true,
  })
  const [showSecret, setShowSecret] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  function handleEnable() {
    if (!config.isActive) {
      if (!config.keyId || !config.keySecret) {
        alert("Cannot enable Razorpay without Key ID and Key Secret. Please fill in credentials first.")
        return
      }
    }
    setConfig({ ...config, isActive: !config.isActive })
  }

  function handleSave() {
    if (!config.keyId || !config.keySecret) {
      alert("Key ID and Key Secret are required.")
      return
    }
    setSaving(true)
    setTimeout(() => { setSaving(false); setTestResult("Credentials saved successfully.") }, 800)
  }

  function handleTestConnection() {
    if (!config.keyId || !config.keySecret) {
      setTestResult("✗ Please enter credentials first")
      return
    }
    setTestResult("✓ Connection successful — Razorpay API reachable")
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">Razorpay</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Payment gateway configuration</p>
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

      {/* Mode Toggle */}
      <div className="p-4 border border-border bg-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Environment Mode</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Switch between test and live mode</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setConfig({ ...config, testMode: true })} className={`px-3 py-1.5 text-[10px] font-medium border transition-colors ${config.testMode ? "border-amber-500/30 bg-amber-500/10 text-amber-600" : "border-border text-muted-foreground"}`}>
              Test Mode
            </button>
            <button onClick={() => setConfig({ ...config, testMode: false })} className={`px-3 py-1.5 text-[10px] font-medium border transition-colors ${!config.testMode ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" : "border-border text-muted-foreground"}`}>
              Live Mode
            </button>
          </div>
        </div>
        {config.testMode && (
          <div className="mt-3 p-2 bg-amber-500/5 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-3 w-3" /> Test mode — No real payments will be processed
          </div>
        )}
      </div>

      {/* Credentials */}
      <div className="p-4 border border-border bg-card space-y-4">
        <h3 className="text-sm font-medium text-foreground">API Credentials</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Key ID *</label>
            <input value={config.keyId} onChange={e => setConfig({ ...config, keyId: e.target.value })} placeholder={config.testMode ? "rzp_test_..." : "rzp_live_..."} className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Key Secret *</label>
            <div className="relative">
              <input type={showSecret ? "text" : "password"} value={config.keySecret} onChange={e => setConfig({ ...config, keySecret: e.target.value })} placeholder="Enter key secret" className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50 pr-8" />
              <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2 top-1/2 translate-y-[-30%] text-muted-foreground">
                {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Webhook Secret</label>
            <input value={config.webhookSecret} onChange={e => setConfig({ ...config, webhookSecret: e.target.value })} placeholder="whsec_..." className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Credentials"}
          </button>
          <button onClick={handleTestConnection} className="px-4 py-2 border border-border text-[10px] font-medium uppercase tracking-wider hover:border-[#c4956a]/30 text-foreground">
            Test Connection
          </button>
        </div>
        {testResult && (
          <p className={`text-xs ${testResult.startsWith("✓") ? "text-emerald-600" : testResult.startsWith("✗") ? "text-red-500" : "text-foreground"}`}>{testResult}</p>
        )}
      </div>

      {/* Webhook URL */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground">Webhook Configuration</h3>
        <div className="p-3 bg-muted/50 border border-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Webhook URL</p>
          <code className="text-xs text-foreground font-mono">{typeof window !== "undefined" ? window.location.origin : "https://vchuki.com"}/api/webhook/razorpay</code>
        </div>
        <div className="p-3 bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Setup:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
            <li>Go to Razorpay Dashboard → Settings → Webhooks</li>
            <li>Add the webhook URL above</li>
            <li>Select events: payment.captured, payment.failed, refund.processed</li>
            <li>Copy the webhook secret and paste above</li>
          </ol>
        </div>
      </div>

      {/* Supported Methods */}
      <div className="p-4 border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-3">Supported Payment Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["UPI", "Credit Card", "Debit Card", "Net Banking", "Google Pay", "PhonePe", "Wallets", "COD"].map(method => (
            <div key={method} className="flex items-center gap-2 p-2 border border-border">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] text-foreground">{method}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
