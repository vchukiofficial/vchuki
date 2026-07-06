"use client"

import { useEffect, useMemo, useState } from "react"
import { Mail, Send, RefreshCw, Key, Truck, ShoppingCart, Megaphone, AlertTriangle, Search, Download, CalendarClock, Eye, X, Check } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"
import { AdminPagination } from "@/components/admin/AdminPagination"
import { buildProductCarouselHtml, type CarouselProduct } from "@/lib/email/productCarousel"

interface Log { _id: string; type: string; channel: string; to: string; subject: string; status: string; metadata: any; error?: string; createdAt: string }
interface Counts { total: number; otp: number; order: number; shipping: number; marketing: number; reset: number; failed: number }
interface PickerProduct { _id: string; name: string; slug: string; basePrice: number; images: string[] }
interface ScheduledJob {
  _id: string; recipientType: string; to: string; subject: string; heading: string
  productIds: string[]; ctaText: string; ctaLink: string; scheduledAt: string
  status: string; sentCount: number; error?: string
}

const PER_PAGE = 20

export default function AdminCommunicationsPage() {
  const [view, setView] = useState<"logs" | "scheduled">("logs")

  const [logs, setLogs] = useState<Log[]>([])
  const [counts, setCounts] = useState<Counts>({ total: 0, otp: 0, order: 0, shipping: 0, marketing: 0, reset: 0, failed: 0 })
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [showCompose, setShowCompose] = useState(false)
  const [recipientType, setRecipientType] = useState<"custom" | "waitlist">("custom")
  const [emailTo, setEmailTo] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [ctaText, setCtaText] = useState("Shop Now")
  const [ctaLink, setCtaLink] = useState("https://vchuki.com/shirts")
  const [bannerImage, setBannerImage] = useState("")
  const [bannerUploading, setBannerUploading] = useState(false)
  const [sendMode, setSendMode] = useState<"now" | "schedule">("now")
  const [scheduledAt, setScheduledAt] = useState("")
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [products, setProducts] = useState<PickerProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)

  function fetchLogs() {
    setLoading(true)
    fetch(`/api/admin/communications?type=${filter}&limit=500`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setLogs(d.logs || []); setCounts(d.counts || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }

  function fetchJobs() {
    setJobsLoading(true)
    fetch("/api/admin/communications/schedule", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setJobs(d.jobs || []); setJobsLoading(false) })
      .catch(() => setJobsLoading(false))
  }

  useEffect(() => { fetchLogs() }, [filter])
  useEffect(() => { setPage(1) }, [search, filter])
  useEffect(() => { if (view === "scheduled") fetchJobs() }, [view])

  useEffect(() => {
    if (!showCompose || products.length > 0) return
    setProductsLoading(true)
    fetch("/api/products?limit=40", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setProductsLoading(false) })
      .catch(() => setProductsLoading(false))
  }, [showCompose])

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

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBannerUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (res.ok) {
        const data = await res.json()
        setBannerImage(data.url)
      }
    } finally {
      setBannerUploading(false)
      e.target.value = ""
    }
  }

  function toggleProduct(id: string) {
    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : prev.length >= 6 ? prev : [...prev, id])
  }

  const carouselProducts: CarouselProduct[] = useMemo(() => {
    return selectedProductIds
      .map(id => products.find(p => p._id === id))
      .filter(Boolean)
      .map((p: any) => ({ name: p.name, price: p.basePrice, image: p.images?.[0] || "", slug: p.slug }))
  }, [selectedProductIds, products])

  function previewHtml() {
    const bannerHtml = bannerImage ? `<img src="${bannerImage}" alt="" style="width:100%;max-width:552px;height:auto;display:block;margin:0 0 20px;" />` : ""
    const body = `${bannerHtml}<h2 style="color:#2a1f14;font-size:22px;font-weight:300;margin:0 0 12px;">${emailSubject || "Your subject here"}</h2>
      <div style="color:#666;font-size:14px;line-height:1.6;">${emailContent ? `<p style="color:#666;font-size:14px;">${emailContent}</p>` : "<p>Your message body will appear here.</p>"}</div>
      ${buildProductCarouselHtml(carouselProducts)}
      <div style="margin:24px 0;"><a href="${ctaLink}" style="background:#2a1f14;color:#f5e6d3;padding:12px 24px;text-decoration:none;font-size:12px;text-transform:uppercase;display:inline-block;">${ctaText}</a></div>`

    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%;">
<tr><td style="background:#2a1f14;padding:28px 24px;text-align:center;">
<span style="color:#f5e6d3;font-size:20px;font-weight:600;letter-spacing:5px;display:block;">VCHUKI</span>
<p style="color:#c4956a;font-size:10px;text-transform:uppercase;letter-spacing:2px;margin:6px 0 0;">Premium Linen Blend — Crafted in Jodhpur</p>
</td></tr>
<tr><td style="padding:32px 24px;">${body}</td></tr>
<tr><td style="background:#f9f6f3;padding:16px;text-align:center;border-top:1px solid #eee;">
<p style="color:#999;font-size:11px;margin:0;">VCHUKI Fashion Private Limited · Jodhpur, Rajasthan 342001</p>
</td></tr>
</table></td></tr></table></body></html>`
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault()
    setSending(true); setSendResult(null)
    try {
      const res = await fetch("/api/admin/communications/schedule", {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({
          recipientType, to: emailTo, subject: emailSubject, heading: emailSubject, content: emailContent,
          bannerImageUrl: bannerImage, productIds: selectedProductIds, ctaText, ctaLink,
          scheduledAt: sendMode === "schedule" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSendResult(sendMode === "schedule" ? "✅ Scheduled!" : "✅ Sent!")
        setEmailTo(""); setEmailSubject(""); setEmailContent(""); setSelectedProductIds([]); setScheduledAt(""); setSendMode("now"); setBannerImage("")
        fetchLogs()
        if (view === "scheduled") fetchJobs()
      } else setSendResult(`❌ ${data.error}`)
    } catch { setSendResult("❌ Network error") }
    setSending(false)
  }

  async function cancelJob(id: string) {
    if (!confirm("Cancel this scheduled campaign?")) return
    const res = await fetch(`/api/admin/communications/schedule/${id}`, { method: "PATCH", credentials: "include" })
    if (res.ok) fetchJobs()
  }

  const typeIcon: Record<string, any> = { otp: Key, order: ShoppingCart, shipping: Truck, marketing: Megaphone, reset: Key, welcome: Mail }
  const typeColor: Record<string, string> = { otp: "text-blue-600 bg-blue-500/10", order: "text-emerald-600 bg-emerald-500/10", shipping: "text-amber-600 bg-amber-500/10", marketing: "text-purple-600 bg-purple-500/10", reset: "text-orange-600 bg-orange-500/10", welcome: "text-[#c4956a] bg-[#c4956a]/10" }
  const jobStatusColor: Record<string, string> = { pending: "text-amber-600 bg-amber-500/10", sent: "text-emerald-600 bg-emerald-500/10", failed: "text-red-500 bg-red-500/10", cancelled: "text-muted-foreground bg-muted" }

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

      {/* Compose */}
      {showCompose && (
        <form onSubmit={handleSendEmail} className="p-4 border border-[#c4956a]/20 bg-[#c4956a]/5 space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2"><Send className="h-3.5 w-3.5 text-[#c4956a]" /> New Campaign</h3>

          {/* Recipients */}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recipients</label>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setRecipientType("custom")} className={`flex-1 px-3 py-2 text-xs border ${recipientType === "custom" ? "border-[#c4956a] bg-[#c4956a]/10 text-foreground" : "border-border text-muted-foreground"}`}>Custom Emails</button>
                <button type="button" onClick={() => setRecipientType("waitlist")} className={`flex-1 px-3 py-2 text-xs border ${recipientType === "waitlist" ? "border-[#c4956a] bg-[#c4956a]/10 text-foreground" : "border-border text-muted-foreground"}`}>All Waitlist</button>
              </div>
            </div>
            {recipientType === "custom" && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">To (comma-separated)</label>
                <input value={emailTo} onChange={e => setEmailTo(e.target.value)} required placeholder="email@example.com" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Banner Image (optional)</label>
            <div className="flex items-center gap-3 mt-1">
              {bannerImage && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bannerImage} alt="Banner" className="h-16 w-32 object-cover border border-border" />
                  <button type="button" onClick={() => setBannerImage("")} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center"><X className="h-2.5 w-2.5 text-white" /></button>
                </div>
              )}
              <label className="px-3 py-2 border border-dashed border-border text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:border-[#c4956a]/50">
                {bannerUploading ? "Uploading..." : bannerImage ? "Replace" : "Upload Banner"}
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={bannerUploading} />
              </label>
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">Recommended: 1200×400px, shows full-width at the top of the email.</p>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Subject / Heading</label>
            <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} required placeholder="e.g. New Arrivals — Just For You" className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Message</label>
            <textarea value={emailContent} onChange={e => setEmailContent(e.target.value)} required rows={3} placeholder="Write your marketing message..." className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground resize-none" />
          </div>

          {/* Product picker */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Product Carousel — select up to 6 real products from the store</label>
            {productsLoading ? (
              <p className="text-xs text-muted-foreground mt-2 animate-pulse">Loading products...</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-2">
                {products.map(p => {
                  const selected = selectedProductIds.includes(p._id)
                  return (
                    <button type="button" key={p._id} onClick={() => toggleProduct(p._id)} className={`relative border p-1.5 text-left ${selected ? "border-[#c4956a] ring-1 ring-[#c4956a]" : "border-border"}`}>
                      {selected && <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#c4956a] flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></span>}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0]} alt={p.name} className="w-full aspect-square object-cover" />
                      <p className="text-[9px] mt-1 line-clamp-2 text-foreground">{p.name}</p>
                      <p className="text-[9px] font-medium text-[#c4956a]">₹{p.basePrice}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">CTA Button Text</label>
              <input value={ctaText} onChange={e => setCtaText(e.target.value)} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">CTA Link</label>
              <input value={ctaLink} onChange={e => setCtaLink(e.target.value)} className="w-full mt-1 px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" />
            </div>
          </div>

          {/* Scheduling */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Delivery</label>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <button type="button" onClick={() => setSendMode("now")} className={`px-3 py-2 text-xs border flex items-center gap-1.5 ${sendMode === "now" ? "border-[#c4956a] bg-[#c4956a]/10 text-foreground" : "border-border text-muted-foreground"}`}><Send className="h-3 w-3" /> Send Now</button>
              <button type="button" onClick={() => setSendMode("schedule")} className={`px-3 py-2 text-xs border flex items-center gap-1.5 ${sendMode === "schedule" ? "border-[#c4956a] bg-[#c4956a]/10 text-foreground" : "border-border text-muted-foreground"}`}><CalendarClock className="h-3 w-3" /> Schedule for Later</button>
              {sendMode === "schedule" && (
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} required min={new Date().toISOString().slice(0, 16)} className="px-3 py-2 border border-border bg-background text-xs focus:outline-none focus:border-[#c4956a]/50 text-foreground" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 px-4 py-2 border border-border text-[10px] font-medium uppercase hover:border-[#c4956a]/30 text-foreground"><Eye className="h-3 w-3" /> Preview</button>
            <button type="submit" disabled={sending} className="px-4 py-2 bg-[#2a1f14] dark:bg-[#c4956a] text-[#f5e6d3] dark:text-[#2a1f14] text-[10px] font-medium uppercase disabled:opacity-50">
              {sending ? "Sending..." : sendMode === "schedule" ? "Schedule Campaign" : "Send Now"}
            </button>
            {sendResult && <span className="text-xs">{sendResult}</span>}
          </div>
        </form>
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-background w-full max-w-xl max-h-[85vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <p className="text-xs font-medium text-foreground">Email Preview — exactly as recipients will see it</p>
              <button onClick={() => setShowPreview(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <iframe title="Email preview" srcDoc={previewHtml()} className="w-full flex-1 border-0" />
          </div>
        </div>
      )}

      {/* View toggle */}
      <div className="flex gap-0.5 border-b">
        <button onClick={() => setView("logs")} className={`px-3 py-2.5 text-[10px] font-medium border-b-2 uppercase tracking-wider ${view === "logs" ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Activity Log</button>
        <button onClick={() => setView("scheduled")} className={`px-3 py-2.5 text-[10px] font-medium border-b-2 uppercase tracking-wider flex items-center gap-1.5 ${view === "scheduled" ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}><CalendarClock className="h-3 w-3" /> Scheduled Campaigns</button>
      </div>

      {view === "logs" && (
        <>
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
        </>
      )}

      {view === "scheduled" && (
        <div className="space-y-1.5">
          {jobsLoading && <p className="text-xs text-muted-foreground animate-pulse p-4">Loading...</p>}
          {!jobsLoading && jobs.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm border border-border">No scheduled campaigns yet. Use Compose → Schedule for Later.</div>}
          {jobs.map(job => (
            <div key={job._id} className="p-3 border border-border bg-card">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{job.subject}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    To: {job.recipientType === "waitlist" ? "All Waitlist" : job.to} · {job.productIds.length} product{job.productIds.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Scheduled for {new Date(job.scheduledAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  {job.error && <p className="text-[10px] text-red-500 mt-1">{job.error}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 font-medium uppercase ${jobStatusColor[job.status] || "bg-muted"}`}>{job.status}{job.status === "sent" ? ` (${job.sentCount})` : ""}</span>
                  {job.status === "pending" && (
                    <button onClick={() => cancelJob(job._id)} className="text-[10px] px-2 py-1 border border-border hover:border-red-500/40 hover:text-red-500 text-muted-foreground">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (<div className="p-2.5 border border-border bg-card"><p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p><p className={`text-lg font-light mt-0.5 ${color}`}>{value}</p></div>)
}
