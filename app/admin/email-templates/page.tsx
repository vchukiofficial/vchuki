"use client"

import { useEffect, useState } from "react"
import { Mail, Save, Plus, Trash2, Eye, EyeOff, Code, Palette, RefreshCw } from "lucide-react"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

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
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Template | null>(null)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false })

  function fetchTemplates() {
    setLoading(true)
    fetch("/api/admin/email-templates", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setTemplates(d.templates || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchTemplates() }, [])

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
          <button onClick={handleNew} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90">
            <Plus className="h-3 w-3" /> New Template
          </button>
          <button onClick={fetchTemplates} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
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
                <div className="bg-muted/30 px-3 py-2 border-b border-border flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Preview — Subject: <span className="text-foreground font-medium">{editing.subject.replace(/\{\{orderId\}\}/g, "A7F2B3C1")}</span></span>
                </div>
                <div className="p-4 bg-[#f5f5f5]">
                  <div className="max-w-[600px] mx-auto bg-white shadow-sm">
                    {/* Header */}
                    <div style={{ background: "#2a1f14", padding: "24px", textAlign: "center" }}>
                      <span style={{ color: "#f5e6d3", fontSize: "18px", fontWeight: 600, letterSpacing: "4px" }}>VCHUKI</span>
                      <p style={{ color: "#c4956a", fontSize: "10px", textTransform: "uppercase", letterSpacing: "2px", margin: "4px 0 0" }}>Premium Linen — Crafted in Jodhpur</p>
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
