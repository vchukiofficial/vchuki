"use client"

import { useEffect, useState } from "react"
import { MessageCircle, Zap, Send, Plus, Trash2, Eye, EyeOff, Settings, Webhook } from "lucide-react"

interface Template {
  _id?: string
  name: string
  language: string
  category: string
  status: string
  headerType: string
  headerContent?: string
  body: string
  footer?: string
  buttons?: { type: string; text: string; value?: string }[]
  variables?: string[]
}

interface Flow {
  name: string
  trigger: string
  templateName: string
  isActive: boolean
  delay: number
}

interface Config {
  businessId: string
  phoneNumberId: string
  accessToken: string
  webhookVerifyToken: string
  webhookUrl: string
  isActive: boolean
  businessName: string
  templates: Template[]
  flows: Flow[]
  stats: { messagesSent: number; messagesDelivered: number; messagesRead: number; templatesSent: number }
}

export default function WhatsAppSettingsPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"config" | "templates" | "flows" | "analytics">("config")
  const [showAddTemplate, setShowAddTemplate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testPhone, setTestPhone] = useState("")

  useEffect(() => {
    fetch("/api/admin/whatsapp", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setConfig(d.config); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function saveConfig(updates: Partial<Config>) {
    setSaving(true)
    await fetch("/api/admin/whatsapp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    })
    setConfig(prev => prev ? { ...prev, ...updates } : prev)
    setSaving(false)
  }

  async function postAction(body: any) {
    const res = await fetch("/api/admin/whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    })
    return res.json()
  }

  async function toggleFlow(trigger: string) {
    await postAction({ action: "toggle_flow", trigger })
    setConfig(prev => {
      if (!prev) return prev
      return { ...prev, flows: prev.flows.map(f => f.trigger === trigger ? { ...f, isActive: !f.isActive } : f) }
    })
  }

  async function addTemplate(template: Omit<Template, "_id">) {
    const res = await postAction({ action: "add_template", template })
    if (res.template) {
      setConfig(prev => prev ? { ...prev, templates: [...prev.templates, res.template] } : prev)
    }
    setShowAddTemplate(false)
  }

  async function deleteTemplate(id: string) {
    await postAction({ action: "delete_template", templateId: id })
    setConfig(prev => prev ? { ...prev, templates: prev.templates.filter(t => t._id !== id) } : prev)
  }

  async function toggleTemplateStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "inactive" : "active"
    await postAction({ action: "update_template", templateId: id, updates: { status: newStatus } })
    setConfig(prev => prev ? { ...prev, templates: prev.templates.map(t => t._id === id ? { ...t, status: newStatus } : t) } : prev)
  }

  async function sendTestMessage() {
    if (!testPhone) return
    await postAction({ action: "test_message", phone: testPhone })
    setConfig(prev => prev ? { ...prev, stats: { ...prev.stats, messagesSent: prev.stats.messagesSent + 1 } } : prev)
    setTestPhone("")
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading WhatsApp config...</div>
  if (!config) return <div className="text-sm text-red-500 p-4">Failed to load configuration</div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-medium tracking-tight text-foreground">WhatsApp Business</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage templates, automation flows & marketing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium ${config.isActive ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
            <span className={`w-2 h-2 rounded-full ${config.isActive ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
            {config.isActive ? "Connected" : "Disconnected"}
          </span>
          <button onClick={() => {
            if (!config.isActive) {
              // Validate required fields before enabling
              if (!config.businessId || !config.phoneNumberId || !config.accessToken) {
                alert("Cannot enable WhatsApp without WABA ID, Phone Number ID, and Access Token. Please fill in API credentials first.")
                return
              }
            }
            saveConfig({ isActive: !config.isActive })
          }} className="px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            {config.isActive ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sent</p>
          <p className="text-xl font-light text-foreground mt-1">{config.stats.messagesSent}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Delivered</p>
          <p className="text-xl font-light text-foreground mt-1">{config.stats.messagesDelivered}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Read</p>
          <p className="text-xl font-light text-foreground mt-1">{config.stats.messagesRead}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Templates Used</p>
          <p className="text-xl font-light text-foreground mt-1">{config.stats.templatesSent}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-border">
        {(["config", "templates", "flows", "analytics"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-[10px] uppercase tracking-wider font-medium border-b-2 transition-colors ${activeTab === tab ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {tab === "config" ? "API Config" : tab === "templates" ? "Templates" : tab === "flows" ? "Automation" : "Analytics"}
          </button>
        ))}
      </div>

      {/* API Configuration */}
      {activeTab === "config" && (
        <div className="space-y-4">
          <div className="p-4 border border-border bg-card space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Settings className="h-4 w-4 text-[#c4956a]" /> WhatsApp Cloud API Credentials</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Business ID (WABA ID)" value={config.businessId} onChange={v => setConfig({ ...config, businessId: v })} placeholder="Enter WhatsApp Business Account ID" />
              <Field label="Phone Number ID" value={config.phoneNumberId} onChange={v => setConfig({ ...config, phoneNumberId: v })} placeholder="Enter Phone Number ID" />
              <Field label="Permanent Access Token" value={config.accessToken} onChange={v => setConfig({ ...config, accessToken: v })} placeholder="Enter access token" type="password" />
              <Field label="Business Display Name" value={config.businessName} onChange={v => setConfig({ ...config, businessName: v })} placeholder="VCHUKI" />
            </div>
            <button onClick={() => saveConfig({ businessId: config.businessId, phoneNumberId: config.phoneNumberId, accessToken: config.accessToken, businessName: config.businessName })} disabled={saving} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50">
              {saving ? "Saving..." : "Save Credentials"}
            </button>
          </div>

          {/* Webhook */}
          <div className="p-4 border border-border bg-card space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Webhook className="h-4 w-4 text-blue-500" /> Webhook Configuration</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Webhook URL" value={config.webhookUrl || `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/whatsapp`} onChange={v => setConfig({ ...config, webhookUrl: v })} placeholder="https://yourdomain.com/api/webhook/whatsapp" />
              <Field label="Verify Token" value={config.webhookVerifyToken} onChange={v => setConfig({ ...config, webhookVerifyToken: v })} placeholder="Your verify token" />
            </div>
            <div className="p-3 bg-blue-500/5 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Setup Instructions:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                <li>Go to Meta Developer Portal → WhatsApp → Configuration</li>
                <li>Set Callback URL to your webhook URL above</li>
                <li>Set Verify Token to match the token above</li>
                <li>Subscribe to: messages, message_templates, messaging_postbacks</li>
              </ol>
            </div>
            <button onClick={() => saveConfig({ webhookUrl: config.webhookUrl, webhookVerifyToken: config.webhookVerifyToken })} disabled={saving} className="px-4 py-2 border border-border text-[10px] font-medium uppercase tracking-wider hover:border-[#c4956a]/30 text-foreground">
              Save Webhook Config
            </button>
          </div>

          {/* Test Message */}
          <div className="p-4 border border-border bg-card space-y-3">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Send className="h-4 w-4 text-emerald-500" /> Send Test Message</h3>
            <div className="flex gap-2">
              <input type="tel" value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="+91 98765 43210" className="flex-1 px-3 py-2 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50" />
              <button onClick={sendTestMessage} disabled={!testPhone} className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-emerald-700 disabled:opacity-40">
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{config.templates.length} Templates</p>
            <button onClick={() => setShowAddTemplate(!showAddTemplate)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">
              <Plus className="h-3 w-3" /> Add Template
            </button>
          </div>

          {showAddTemplate && <AddTemplateForm onAdd={addTemplate} onCancel={() => setShowAddTemplate(false)} />}

          {config.templates.length === 0 ? (
            <div className="text-center py-12 border border-border">
              <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No templates yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">Create templates to send automated messages</p>
            </div>
          ) : (
            <div className="space-y-2">
              {config.templates.map(template => (
                <div key={template._id} className={`p-4 border bg-card transition-colors ${template.status === "active" ? "border-emerald-500/20" : "border-border"}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{template.name}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 font-medium uppercase ${
                          template.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                          template.status === "pending" ? "bg-amber-500/10 text-amber-600" :
                          template.status === "rejected" ? "bg-red-500/10 text-red-500" :
                          "bg-muted text-muted-foreground"
                        }`}>{template.status}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground capitalize">{template.category}</span>
                      </div>
                      <div className="mt-2 p-2 bg-muted/50 border border-border text-xs text-muted-foreground whitespace-pre-wrap max-h-20 overflow-hidden">
                        {template.body}
                      </div>
                      {template.variables && template.variables.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1.5">Variables: {template.variables.join(", ")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={() => toggleTemplateStatus(template._id!, template.status)} title={template.status === "active" ? "Deactivate" : "Activate"} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        {template.status === "active" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                      <button onClick={() => deleteTemplate(template._id!)} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Automation Flows */}
      {activeTab === "flows" && (
        <div className="space-y-4">
          <div className="p-3 bg-[#c4956a]/5 border border-[#c4956a]/20 text-xs text-foreground">
            <p className="font-medium">Automation Flows</p>
            <p className="text-muted-foreground mt-0.5">Enable/disable automated WhatsApp messages triggered by user actions. Each flow uses a template you&apos;ve created above.</p>
          </div>

          <div className="space-y-2">
            {config.flows.map(flow => (
              <div key={flow.trigger} className={`p-4 border bg-card transition-colors ${flow.isActive ? "border-emerald-500/20" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${flow.isActive ? "bg-emerald-500/10" : "bg-muted"}`}>
                      <Zap className={`h-3.5 w-3.5 ${flow.isActive ? "text-emerald-500" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{flow.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Template: <span className="font-mono text-foreground">{flow.templateName}</span>
                        {flow.delay > 0 && <span className="ml-2">· Delay: {flow.delay >= 60 ? `${Math.floor(flow.delay / 60)}h` : `${flow.delay}m`}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 font-medium ${flow.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {flow.isActive ? "Active" : "Inactive"}
                    </span>
                    <button onClick={() => toggleFlow(flow.trigger)} className={`relative w-10 h-5 rounded-full transition-colors ${flow.isActive ? "bg-emerald-500" : "bg-border"}`}>
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${flow.isActive ? "left-5.5 translate-x-0.5" : "left-0.5"}`} style={{ left: flow.isActive ? "22px" : "2px" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Flow descriptions */}
          <div className="p-4 border border-border bg-card">
            <h4 className="text-xs font-medium text-foreground mb-3">Flow Triggers Explained</h4>
            <div className="space-y-2 text-[11px]">
              <FlowDesc trigger="welcome" desc="Sent when a new user registers or provides their phone number for the first time" />
              <FlowDesc trigger="order_confirmed" desc="Sent immediately after order is placed with order details" />
              <FlowDesc trigger="order_shipped" desc="Sent when admin dispatches the order with tracking info" />
              <FlowDesc trigger="order_delivered" desc="Sent when order is marked as delivered" />
              <FlowDesc trigger="abandoned_cart" desc="Sent after user adds to cart but doesn't checkout (configurable delay)" />
              <FlowDesc trigger="review_request" desc="Sent after delivery asking for product review (24h delay)" />
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 border border-border bg-card text-center">
              <p className="text-2xl font-light text-foreground">{config.stats.messagesSent}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Total Sent</p>
            </div>
            <div className="p-4 border border-border bg-card text-center">
              <p className="text-2xl font-light text-foreground">{config.stats.messagesDelivered}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Delivered</p>
              <p className="text-[9px] text-emerald-600 mt-0.5">{config.stats.messagesSent > 0 ? ((config.stats.messagesDelivered / config.stats.messagesSent) * 100).toFixed(0) : 0}%</p>
            </div>
            <div className="p-4 border border-border bg-card text-center">
              <p className="text-2xl font-light text-foreground">{config.stats.messagesRead}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Read</p>
              <p className="text-[9px] text-blue-600 mt-0.5">{config.stats.messagesDelivered > 0 ? ((config.stats.messagesRead / config.stats.messagesDelivered) * 100).toFixed(0) : 0}%</p>
            </div>
            <div className="p-4 border border-border bg-card text-center">
              <p className="text-2xl font-light text-foreground">{config.templates.filter(t => t.status === "active").length}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Active Templates</p>
            </div>
          </div>

          <div className="p-4 border border-border bg-card">
            <h4 className="text-sm font-medium text-foreground mb-3">Message Performance by Flow</h4>
            <div className="space-y-2">
              {config.flows.map(flow => (
                <div key={flow.trigger} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-foreground">{flow.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] px-1.5 py-0.5 ${flow.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                      {flow.isActive ? "Active" : "Off"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full mt-1 px-3 py-2.5 border border-border bg-background text-xs text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors placeholder:text-muted-foreground/50" />
    </div>
  )
}

function FlowDesc({ trigger, desc }: { trigger: string; desc: string }) {
  return (
    <div className="flex gap-2">
      <span className="font-mono text-[#c4956a] w-32 flex-shrink-0">{trigger}</span>
      <span className="text-muted-foreground">{desc}</span>
    </div>
  )
}

function AddTemplateForm({ onAdd, onCancel }: { onAdd: (t: any) => void; onCancel: () => void }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onAdd({
      name: fd.get("name"),
      language: "en",
      category: fd.get("category"),
      status: "pending",
      headerType: fd.get("headerType"),
      body: fd.get("body"),
      footer: fd.get("footer") || undefined,
      variables: (fd.get("variables") as string)?.split(",").map(v => v.trim()).filter(Boolean) || [],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-[#c4956a]/20 bg-[#c4956a]/5 space-y-3">
      <p className="text-sm font-medium text-foreground">New Template</p>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Template Name</label>
          <input name="name" required className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground" placeholder="welcome_new_customer" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Category</label>
          <select name="category" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground">
            <option value="marketing">Marketing</option>
            <option value="utility">Utility</option>
            <option value="authentication">Authentication</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Header Type</label>
          <select name="headerType" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground">
            <option value="none">None</option>
            <option value="text">Text</option>
            <option value="image">Image</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Body (use &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; for variables)</label>
        <textarea name="body" required rows={3} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground resize-none" placeholder="Hi {{1}}! Welcome to VCHUKI. Use code {{2}} for 10% off your first order." />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Footer (optional)</label>
          <input name="footer" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground" placeholder="Reply STOP to unsubscribe" />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Variables (comma-separated)</label>
          <input name="variables" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs text-foreground" placeholder="customer_name, coupon_code" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">Create Template</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-border text-[10px] font-medium text-foreground">Cancel</button>
      </div>
    </form>
  )
}
