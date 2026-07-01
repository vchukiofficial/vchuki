"use client"

import { useEffect, useState } from "react"
import { Crown, Download, Mail, Trash2, Users, Zap } from "lucide-react"
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

  useEffect(() => { fetchEntries() }, [])

  async function fetchEntries() {
    setLoading(true)
    const res = await fetch("/api/admin/vip")
    const data = await res.json()
    setEntries(data.entries || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this entry?")) return
    await fetch(`/api/admin/vip?id=${id}`, { method: "DELETE" })
    fetchEntries()
  }

  async function handleSendEmail(email: string) {
    const subject = prompt("Email subject:", "Exclusive Drop Alert — VCHUKI")
    if (!subject) return
    const message = prompt("Email body (plain text):", "Your VIP early access is live! Shop now at https://vchuki.com/shirts")
    if (!message) return
    await fetch("/api/admin/vip/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, subject, message }),
    })
    alert(`Email sent to ${email}`)
  }

  async function handleBulkEmail() {
    const subject = prompt("Email subject for ALL VIP members:", "VIP Early Access is LIVE!")
    if (!subject) return
    const message = prompt("Email body:", "Your exclusive early access is now live. Shop the new collection before anyone else at https://vchuki.com/shirts")
    if (!message) return
    if (!confirm(`Send email to ${entries.length} VIP members?`)) return
    await fetch("/api/admin/vip/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulk: true, subject, message }),
    })
    alert(`Email sent to ${entries.length} members!`)
  }

  async function handleSendLaunchEmail() {
    if (!confirm(`Send LAUNCH DAY early access email to all ${entries.length} VIP members?\n\nThis will notify them that the new collection is live at 9 AM, 3 hours before public launch at 12 PM.`)) return
    const res = await fetch("/api/admin/vip/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bulk: true,
        subject: "Your VIP Early Access is LIVE - Shop Before Everyone Else!",
        message: `You're one of our exclusive VIP members, and your early access to the new VCHUKI collection is NOW LIVE!\n\nYour access: NOW (9:00 AM)\nPublic launch: 12:00 PM\n\nYou have 3 hours of exclusive access before anyone else can shop.\n\nWhat's new:\n- Fresh Rajasthan-inspired colors\n- Premium linen blend shirts\n- New short kurta styles\n- Limited quantities per color\n\nAs a VIP, you also get:\n- 10% OFF your first order\n- Free shipping (no minimum)\n- Priority customer support\n\nDon't wait - the best sizes sell out fast!`,
      }),
    })
    const data = await res.json()
    alert(`Launch access email sent to ${data.sent || entries.length} VIP members!`)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground flex items-center gap-2">
            <Crown className="h-5 w-5 text-[#c4956a]" /> VIP Waitlist
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{entries.length} signups · Manage early access members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSendLaunchEmail} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-medium uppercase tracking-wider">
            <Zap className="h-3 w-3" /> Send Launch Access
          </button>
          <button onClick={handleBulkEmail} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider">
            <Mail className="h-3 w-3" /> Email All
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium text-foreground">
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
      <div className="border border-border overflow-hidden">
        <table className="w-full text-xs">
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
                    <button onClick={() => handleSendEmail(entry.email)} className="h-6 w-6 border border-border flex items-center justify-center text-muted-foreground hover:text-[#c4956a] hover:border-[#c4956a]/30" title="Send Email">
                      <Mail className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleDelete(entry._id)} className="h-6 w-6 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/30" title="Delete">
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
    </div>
  )
}
