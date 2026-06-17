"use client"

import { useEffect, useState } from "react"
import { Mail, Send, RefreshCw, Key, Truck, ShoppingCart, Megaphone, AlertTriangle, Search, Download } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"
import { AdminPagination } from "@/components/admin/AdminPagination"

interface Log { _id: string; type: string; channel: string; to: string; subject: string; status: string; metadata: any; error?: string; createdAt: string }
interface Counts { total: number; otp: number; order: number; shipping: number; marketing: number; reset: number; failed: number }

const PER_PAGE = 20

export default function AdminCommunicationsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [counts, setCounts] = useState<Counts>({ total: 0, otp: 0, order: 0, shipping: 0, marketing: 0, reset: 0, failed: 0 })
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)

  function fetchLogs() {
    setLoading(true)
    fetch(`/api/admin/communications?type=${filter}&limit=500`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setCounts(d.counts || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [filter])
  useEffect(() => { setPage(1) }, [search, filter])

  const filtered = logs.filter(l => {
    if (search && !l.to.toLowerCase().includes(search.toLowerCase()) && !l.subject.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  async function handleExport() {
    await exportToExcel({
      title: "Communications Log", sheetName: "Logs", filename: "VCHUKI_Communications",
      columns: [
        { header: "Type", key: "type", width: 12 }, { header: "To", key: "to", width: 28 },
        { header: "Subject", key: "subject", width: 35 }, { header: "Status", key: "status", width: 10 },
        { header: "OTP", key: "otp", width: 8 }, { header: "Date", key: "date", width: 18 },
      ],
      data: filtered.map(l => ({ type: l.type, to: l.to, subject: l.subject, status: l.status, otp: l.metadata?.otp || "", date: new Date(l.createdAt).toLocaleString("en-IN") })),
    })
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    setSending(true); setSendResult(null)
    try {
      const res = await fetch("/api/admin/communications", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody }) })
      const data = await res.json()
      if (res.ok) { setSendResult("✅ Sent!"); setEmailTo(""); setEmailSubject(""); setEmailBody(""); fetchLogs() }
      else setSendResult(`❌ ${data.error}`)
    } catch { setSendResult("❌ Network error") }
    setSending(false)
  }

  const typeIcon: Record<string, any> = { otp: Key, order: ShoppingCart, shipping: Truck, marketing: Megaphone, reset: Key, welcome: Mail }
  const typeColor: Record<string, string> = { otp: "text-blue-600 bg-blue-500/10", order: "text-emerald-600 bg-emerald-500/10", shipping: "text-amber-600 bg-amber-500/10", marketing: "text-purple-600 bg-purple-500/10", reset: "text-orange-600 bg-orange-500/10", welcome: "text-[#c4956a] bg-[#c4956a]/10" }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Communications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">OTP logs, email transactions, marketing</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCompose(!showCompose)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase tracking-wider hover:opacity-90">
            <Send className="h-3 w-3" /> Compose
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <Download className="h-3 w-3" /> Export
          </button>
          <button onClick={fetchLogs} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 text-foreground">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        <Stat label="Total" value={counts.total} color="text-foreground" />
        <Stat label="OTP" value={counts.otp} color="text-blue-600" />
        <Stat label="Orders" value={counts.order} color="text-emerald-600" />
        <Stat label="Shipping" value={counts.shipping} color="text-amber-600" />
        <Stat label="Marketing" value={counts.marketing} color="text-purple-600" />
        <Stat label="Reset" value={counts.reset} color="text-orange-600" />
        <Stat label="Failed" value={counts.failed} color="text-red-500" />
      </div>

      {/* Compose */}
      {showCompose && (
        <form onSubmit={handleSendEmail} className="p-4 border border-[#c4956a]/20 bg-[#c4956a]/5 space-y-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Send className="h-3.5 w-3.5 text-[#c4956a]" /> Send Email</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">To</label><input value={emailTo} onChange={e => setEmailTo(e.target.value)} required placeholder="email@example.com" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" /></div>
            <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Subject</label><input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required placeholder="Subject" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" /></div>
          </div>
          <div><label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Body (HTML)</label><textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} required rows={4} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground resize-none font-mono" /></div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={sending} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase disabled:opacity-50">{sending ? "Sending..." : "Send"}</button>
            {sendResult && <span className="text-xs">{sendResult}</span>}
          </div>
        </form>
      )}

      {/* Search + Filter Tabs */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email or subject..." className="w-full pl-9 pr-4 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" />
        </div>
      </div>
      <div className="flex gap-0.5 border-b overflow-x-auto no-scrollbar">
        {["all", "otp", "reset", "order", "shipping", "marketing"].map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`px-3 py-2.5 text-[10px] capitalize border-b-2 font-medium whitespace-nowrap ${filter === t ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {/* Logs */}
      <div className="space-y-1.5">
        {paginated.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm border border-border">No logs found.</div>}
        {paginated.map(log => {
          const Icon = typeIcon[log.type] || Mail
          const color = typeColor[log.type] || "text-muted-foreground bg-muted"
          return (
            <div key={log._id} className={`p-3 border bg-card hover:border-[#c4956a]/20 transition-colors ${log.status === "failed" ? "border-red-500/20" : "border-border"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="h-3.5 w-3.5" /></div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground truncate">{log.subject}</p>
                      {log.status === "failed" && <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      To: {log.to}
                      {log.metadata?.otp && <span className="ml-2 font-mono text-[#c4956a]">OTP: {log.metadata.otp}</span>}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 font-medium ${log.status === "sent" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>{log.status.toUpperCase()}</span>
                  <p className="text-[9px] text-muted-foreground mt-1">{new Date(log.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
              {log.error && <p className="text-[10px] text-red-500 mt-1.5 pl-11">{log.error}</p>}
            </div>
          )
        })}
      </div>

      <AdminPagination page={page} totalPages={totalPages} total={filtered.length} perPage={PER_PAGE} onPageChange={setPage} />
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (<div className="p-2.5 border border-border bg-card"><p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p><p className={`text-lg font-light mt-0.5 ${color}`}>{value}</p></div>)
}
