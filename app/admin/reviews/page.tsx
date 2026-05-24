"use client"

import { useEffect, useState } from "react"
import { Star, Trash2, Check, Pin, Eye, EyeOff, RefreshCw, Download } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "featured">("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function fetchReviews() {
    setLoading(true)
    fetch("/api/reviews", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setReviews((d.reviews || []).map((r: any) => ({ ...r, status: r.status || "approved", featured: r.featured || false }))); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [])

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(r => r._id)))
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} review(s)?`)) return
    for (const id of selected) {
      await fetch(`/api/reviews/${id}`, { method: "DELETE", credentials: "include" })
    }
    setReviews(reviews.filter(r => !selected.has(r._id)))
    setSelected(new Set())
  }

  async function handleDelete(id: string) {
    await fetch(`/api/reviews/${id}`, { method: "DELETE", credentials: "include" })
    setReviews(reviews.filter(r => r._id !== id))
  }

  function handleApprove(id: string) {
    setReviews(reviews.map(r => r._id === id ? { ...r, status: "approved" } : r))
  }

  function handleToggleFeatured(id: string) {
    setReviews(reviews.map(r => r._id === id ? { ...r, featured: !r.featured } : r))
  }

  function handleToggleActive(id: string) {
    setReviews(reviews.map(r => r._id === id ? { ...r, status: r.status === "approved" ? "hidden" : "approved" } : r))
  }

  async function handleExport() {
    const exportData = reviews.map(r => ({
      customer: r.user?.name || "Customer",
      product: r.product?.name || "Product",
      rating: `${r.rating}/5`,
      comment: r.comment || "",
      verified: r.verifiedPurchase ? "Yes" : "No",
      featured: r.featured ? "Yes" : "No",
      status: r.status || "approved",
      date: new Date(r.createdAt).toLocaleDateString("en-IN"),
    }))
    await exportToExcel({
      title: "Customer Reviews",
      sheetName: "Reviews",
      filename: "VCHUKI_Reviews",
      columns: [
        { header: "Customer", key: "customer", width: 20 },
        { header: "Product", key: "product", width: 28 },
        { header: "Rating", key: "rating", width: 8 },
        { header: "Comment", key: "comment", width: 40 },
        { header: "Verified", key: "verified", width: 10 },
        { header: "Featured", key: "featured", width: 10 },
        { header: "Status", key: "status", width: 10 },
        { header: "Date", key: "date", width: 12 },
      ],
      data: exportData,
    })
  }

  const filtered = filter === "all" ? reviews :
    filter === "pending" ? reviews.filter(r => r.status === "pending") :
    filter === "approved" ? reviews.filter(r => r.status === "approved") :
    reviews.filter(r => r.featured)

  // Analytics
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0"
  const fiveStars = reviews.filter(r => r.rating === 5).length
  const verified = reviews.filter(r => r.verifiedPurchase).length

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading reviews...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Review Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{reviews.length} customer reviews</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-[10px] font-medium uppercase tracking-wider hover:bg-red-600 transition-colors">
              <Trash2 className="h-3 w-3" /> Delete ({selected.size})
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <Download className="h-3 w-3" /> Export Excel
          </button>
          <button onClick={fetchReviews} className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[10px] font-medium hover:border-[#c4956a]/30 transition-colors text-foreground">
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
          <p className="text-xl font-light text-foreground mt-1">{reviews.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-[#c4956a]">Avg Rating</p>
          <p className="text-xl font-light text-foreground mt-1">{avgRating} ★</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-emerald-600">5-Star</p>
          <p className="text-xl font-light text-foreground mt-1">{fiveStars}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-blue-600">Verified</p>
          <p className="text-xl font-light text-foreground mt-1">{verified}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <p className="text-[10px] uppercase tracking-wider text-purple-600">Featured</p>
          <p className="text-xl font-light text-foreground mt-1">{reviews.filter(r => r.featured).length}</p>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="p-4 border border-border bg-card">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Rating Distribution</p>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-4">{star}★</span>
                <div className="flex-1 h-1.5 bg-border overflow-hidden">
                  <div className="h-full bg-[#c4956a]" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground w-6 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-0.5 border-b">
        {(["all", "pending", "approved", "featured"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2.5 text-[10px] capitalize border-b-2 transition-colors font-medium ${filter === s ? "border-[#c4956a] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm border border-border">No reviews in this category.</div>
        )}
        {filtered.length > 0 && (
          <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="accent-[#c4956a]" />
            Select All ({filtered.length})
          </label>
        )}
        {filtered.map(r => (
          <div key={r._id} className={`p-4 border bg-card hover:border-[#c4956a]/20 transition-colors ${selected.has(r._id) ? "border-[#c4956a]/20 bg-[#c4956a]/5" : r.featured ? "border-[#c4956a]/30" : "border-border"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="checkbox" checked={selected.has(r._id)} onChange={() => toggleSelect(r._id)} className="accent-[#c4956a]" />
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-[#c4956a] text-[#c4956a]" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-foreground">{r.user?.name || "Customer"}</span>
                  {r.verifiedPurchase && <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 font-medium">Verified</span>}
                  {r.featured && <span className="text-[9px] bg-[#c4956a]/10 text-[#c4956a] px-1.5 py-0.5 font-medium">Featured</span>}
                  {r.status === "hidden" && <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 font-medium">Hidden</span>}
                </div>
                <p className="text-[10px] text-[#c4956a] mt-0.5">{r.product?.name || "Product"}</p>
                {r.comment && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{r.comment}</p>}
                <p className="text-[9px] text-muted-foreground/60 mt-1">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => handleToggleFeatured(r._id)} title={r.featured ? "Unfeature" : "Feature"} className={`h-7 w-7 border flex items-center justify-center transition-colors ${r.featured ? "border-[#c4956a] text-[#c4956a]" : "border-border text-muted-foreground hover:text-[#c4956a] hover:border-[#c4956a]/30"}`}>
                  <Pin className="h-3 w-3" />
                </button>
                <button onClick={() => handleToggleActive(r._id)} title={r.status === "approved" ? "Hide" : "Show"} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  {r.status === "approved" ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <button onClick={() => handleApprove(r._id)} title="Approve" className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-emerald-600 hover:border-emerald-500/30 transition-colors">
                  <Check className="h-3 w-3" />
                </button>
                <button onClick={() => handleDelete(r._id)} title="Delete" className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
