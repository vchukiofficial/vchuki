"use client"

import { useEffect, useState } from "react"
import { Crown, Download, Mail, Trash2, Users, Zap, X, Send, AlertTriangle } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"

interface WaitlistEntry {
  _id: string
  email: string
  phone?: string
  source: string
  position: number
  earlyAccess: boolean
  createdAt: string
}

export default function AdminVIPPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [emailModal, setEmailModal] = useState<{ type: "single" | "bulk" | "launch"; email?: string } | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [includeCarousel, setIncludeCarousel] = useState(true)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { fetchEntries() }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast])

  async function fetchEntries() {
    setLoading(true)
    const res = await fetch("/api/admin/vip")
    const data = await res.json()
    setEntries(data.entries || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/vip?id=${id}`, { method: "DELETE" })
    setDeleteConfirm(null)
    setToast({ message: "Entry removed", type: "success" })
    fetchEntries()
  }

  function openSingleEmail(email: string) {
    setEmailSubject("Exclusive Drop Alert - VCHUKI")
    setEmailMessage("Your VIP early access is live! Shop now at https://vchuki.com/shirts")
    setEmailModal({ type: "single", email })
  }

  function openBulkEmail() {
    setEmailSubject("VIP Early Access is LIVE!")
    setEmailMessage("Your exclusive early access is now live. Shop the new collection before anyone else at https://vchuki.com/shirts")
    setEmailModal({ type: "bulk" })
  }

  function openLaunchEmail() {
    setEmailSubject("Your VIP Early Access is LIVE - Shop Before Everyone Else!")
    setEmailMessage(`You're one of our exclusive VIP members, and your early access to the new VCHUKI collection is NOW LIVE!

Your access: NOW (9:00 AM)
Public launch: 12:00 PM

You have 3 hours of exclusive access before anyone else can shop.

What's new:
- Fresh Rajasthan-inspired colors
- Premium linen blend shirts
- New short kurta styles
- Limited quantities per color

As a VIP, you also get:
- 10% OFF your first order
- Free shipping (no minimum)
- Priority customer support

Don't wait - the best sizes sell out fast!`)
    setEmailModal({ type: "launch" })
  }

  async function handleSendEmail() {
    if (!emailSubject || !emailMessage) return
    setSending(true)
    try {
      const body: any = { subject: emailSubject, message: emailMessage, includeCarousel }
      if (emailModal?.type === "single") {
        body.email = emailModal.email
      } else {
        body.bulk = true
      }
      const res = await fetch("/api/admin/vip/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      const count = data.sent || (emailModal?.type === "single" ? 1 : entries.length)
      setToast({ message: `Email sent to ${count} ${count === 1 ? "member" : "members"}!`, type: "success" })
      setEmailModal(null)
    } catch {
      setToast({ message: "Failed to send email", type: "error" })
    }
    setSending(false)
  }

  async function handleExport() {
    await exportToExcel({
      title: "VIP Waitlist",
      sheetName: "Waitlist",
      filename: "VCHUKI_VIP_Waitlist",
      columns: [
        { header: "#", key: "position", width: 6 },
        { header: "Email", key: "email", width: 30 },
        { header: "Phone", key: "phone", width: 15 },
        { header: "Source", key: "source", width: 12 },
        { header: "Early Access", key: "earlyAccess", width: 12 },
        { header: "Date", key: "date", width: 18 },
      ],
      data: entries.map(e => ({
        position: e.position,
        email: e.email,
        phone: e.phone || "—",
        source: e.source,
        earlyAccess: e.earlyAccess ? "Yes" : "No",
        date: new Date(e.createdAt).toLocaleDateString("en-IN"),
      })),
    })
  }

  const earlyAccessCount = entries.filter(e => e.earlyAccess).length

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading...</div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#c4956a]" /> VIP Waitlist
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{entries.length} signups · Manage early access members</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={openLaunchEmail} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-emerald-700 transition-colors">
            <Zap className="h-3 w-3" /> Send Launch Access
          </button>
          <button onClick={openBulkEmail} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">
            <Mail className="h-3 w-3" /> Email All
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium text-foreground hover:bg-muted/50 transition-colors">
            <Download className="h-3 w-3" /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-[#c4956a]" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</span></div>
          <p className="text-xl font-light text-foreground mt-1">{entries.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-amber-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Early Access</span></div>
          <p className="text-xl font-light text-foreground mt-1">{earlyAccessCount}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><Crown className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Spots Left</span></div>
          <p className="text-xl font-light text-foreground mt-1">{Math.max(0, 100 - entries.length)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">#</th>
              <th className="p-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Email</th>
              <th className="p-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Phone</th>
              <th className="p-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Source</th>
              <th className="p-2.5 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium">VIP</th>
              <th className="p-2.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Date</th>
              <th className="p-2.5 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map(entry => (
              <tr key={entry._id} className="hover:bg-muted/30">
                <td className="p-2.5 text-muted-foreground">{entry.position}</td>
                <td className="p-2.5 font-medium text-foreground">{entry.email}</td>
                <td className="p-2.5 text-muted-foreground">{entry.phone || "—"}</td>
                <td className="p-2.5"><span className="text-[9px] px-1.5 py-0.5 bg-muted text-muted-foreground capitalize">{entry.source}</span></td>
                <td className="p-2.5 text-center">{entry.earlyAccess ? <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 font-medium">VIP</span> : "—"}</td>
                <td className="p-2.5 text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="p-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openSingleEmail(entry.email)} className="h-6 w-6 border border-border flex items-center justify-center text-muted-foreground hover:text-[#c4956a] hover:border-[#c4956a]/30 transition-colors" title="Send Email">
                      <Mail className="h-3 w-3" />
                    </button>
                    <button onClick={() => setDeleteConfirm(entry._id)} className="h-6 w-6 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors" title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No VIP signups yet</p>}
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !sending && setEmailModal(null)} />
          <div className="relative w-full max-w-lg bg-background border border-border shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {emailModal.type === "launch" ? <Zap className="h-4 w-4 text-emerald-500" /> : <Mail className="h-4 w-4 text-[#c4956a]" />}
                <h2 className="text-sm font-medium text-foreground">
                  {emailModal.type === "launch" ? "Send Launch Day Access" : emailModal.type === "bulk" ? `Email All (${entries.length} members)` : `Email ${emailModal.email}`}
                </h2>
              </div>
              <button onClick={() => !sending && setEmailModal(null)} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              {emailModal.type === "launch" && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                  This will send the pre-written launch day email to all {entries.length} VIP members with early access details (9 AM access, 12 PM public launch).
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={emailModal.type === "launch" ? 12 : 5}
                  className="w-full mt-1.5 px-3 py-2.5 border border-border bg-background text-sm text-foreground focus:outline-none focus:border-[#c4956a]/50 transition-colors resize-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={includeCarousel} onChange={(e) => setIncludeCarousel(e.target.checked)} className="accent-[#c4956a]" />
                Include a product carousel (4 random featured products, picked fresh at send time)
              </label>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
              <button
                onClick={() => setEmailModal(null)}
                disabled={sending}
                className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sending || !emailSubject || !emailMessage}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-xs font-medium tracking-wider uppercase disabled:opacity-50 transition-opacity"
              >
                <Send className="h-3 w-3" />
                {sending ? "Sending..." : emailModal.type === "single" ? "Send Email" : `Send to ${entries.length} Members`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm bg-background border border-border shadow-xl p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-3 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h3 className="text-sm font-medium text-foreground">Remove this entry?</h3>
            <p className="text-xs text-muted-foreground mt-1">This will permanently delete this VIP signup.</p>
            <div className="flex gap-2 mt-5 justify-center">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-xs border border-border text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-xs bg-red-500 text-white hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 border shadow-lg text-xs font-medium animate-in slide-in-from-bottom-2 ${
          toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}
