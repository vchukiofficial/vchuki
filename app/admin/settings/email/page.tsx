"use client"

import { useState } from "react"
import { Mail, Send, CheckCircle, AlertTriangle } from "lucide-react"

export default function EmailSettingsPage() {
  const [config, setConfig] = useState({
    apiKey: "",
    fromEmail: "noreply@vchuki.com",
    fromName: "VCHUKI",
    replyTo: "support@vchuki.com",
    isActive: false,
  })
  const [saving, setSaving] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testResult, setTestResult] = useState<string | null>(null)

  function handleEnable() {
    if (!config.isActive && !config.apiKey) {
      alert("Cannot enable Email without Resend API Key. Please add your API key first.")
      return
    }
    setConfig({ ...config, isActive: !config.isActive })
  }

  function handleSave() {
    if (!config.apiKey) { alert("API Key is required."); return }
    setSaving(true)
    setTimeout(() => { setSaving(false); setTestResult("Configuration saved.") }, 600)
  }

  function handleTestEmail() {
    if (!testEmail) return
    setTestResult(`✓ Test email sent to ${testEmail}`)
    setTestEmail("")
  }

  const emailFlows = [
    { name: "Order Confirmation", trigger: "After order placed", active: true },
    { name: "Shipping Update", trigger: "When order shipped", active: true },
    { name: "Delivery Confirmation", trigger: "When delivered", active: true },
    { name: "Abandoned Cart", trigger: "1 hour after cart abandon", active: false },
    { name: "Welcome Email", trigger: "After registration", active: true },
    { name: "Review Request", trigger: "3 days after delivery", active: false },
    { name: "Refund Processed", trigger: "When refund initiated", active: true },
    { name: "Newsletter", trigger: "Weekly/Monthly", active: false },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">Email (Resend)</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Transactional & marketing email configuration</p>
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

      {/* API Config */}
      <div className="p-4 border border-border bg-card space-y-4">
        <h3 className="text-sm font-medium text-foreground">Resend API Configuration</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">API Key *</label>
            <input type="password" value={config.apiKey} onChange={e => setConfig({ ...config, apiKey: e.target.value })} placeholder="re_..." className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">From Email</label>
            <input value={config.fromEmail} onChange={e => setConfig({ ...config, fromEmail: e.target.value })} className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">From Name</label>
            <input value={config.fromName} onChange={e => setConfig({ ...config, fromName: e.target.value })} className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Reply-To Email</label>
            <input value={config.replyTo} onChange={e => setConfig({ ...config, replyTo: e.target.value })} className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save Configuration"}
        </button>
        {testResult && !testResult.startsWith("✓") && <p className="text-xs text-foreground">{testResult}</p>}
      </div>

      {/* Test Email */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Send className="h-4 w-4 text-purple-500" /> Send Test Email</h3>
        <div className="flex gap-2">
          <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com" className="flex-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
          <button onClick={handleTestEmail} disabled={!testEmail} className="px-4 py-2 bg-purple-600 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-purple-700 disabled:opacity-40">Send Test</button>
        </div>
        {testResult?.startsWith("✓") && <p className="text-xs text-emerald-600">{testResult}</p>}
      </div>

      {/* Email Flows */}
      <div className="p-4 border border-border bg-card space-y-3">
        <h3 className="text-sm font-medium text-foreground">Email Automation Flows</h3>
        <div className="space-y-2">
          {emailFlows.map(flow => (
            <div key={flow.name} className={`flex items-center justify-between p-3 border transition-colors ${flow.active ? "border-emerald-500/20" : "border-border"}`}>
              <div className="flex items-center gap-2">
                {flow.active ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/40" />}
                <div>
                  <p className="text-xs font-medium text-foreground">{flow.name}</p>
                  <p className="text-[10px] text-muted-foreground">{flow.trigger}</p>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-0.5 font-medium ${flow.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {flow.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
