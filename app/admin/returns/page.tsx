"use client"

import { useEffect, useState } from "react"
import { RotateCcw, IndianRupee, CheckCircle, XCircle, Download, Trash2 } from "lucide-react"
import { exportToExcel } from "@/lib/admin/exportExcel"

export default function AdminReturnsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function fetchData() {
    setLoading(true)
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const returns = orders.filter(o => o.shippingStatus === "returned")
  const cancelled = orders.filter(o => o.shippingStatus === "cancelled")
  const allReturns = [...returns, ...cancelled]
  const totalRefund = allReturns.reduce((s, o) => s + (o.finalAmount || 0), 0)

  function toggleSelect(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === allReturns.length) setSelected(new Set())
    else setSelected(new Set(allReturns.map(o => o._id)))
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selected.size} return record(s)?`)) return
    for (const id of selected) {
      await fetch(`/api/orders/${id}`, { method: "DELETE", credentials: "include" })
    }
    setSelected(new Set())
    fetchData()
  }

  async function singleDelete(id: string) {
    if (!confirm("Delete this return record?")) return
    await fetch(`/api/orders/${id}`, { method: "DELETE", credentials: "include" })
    fetchData()
  }

  async function processRefund(id: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ paymentStatus: "refunded" }),
    })
    setOrders(orders.map(o => o._id === id ? { ...o, paymentStatus: "refunded" } : o))
  }

  async function handleExport() {
    const exportData = allReturns.map(o => ({
      orderId: `#${o._id?.slice(-8).toUpperCase()}`,
      type: o.shippingStatus === "returned" ? "Return" : "Cancelled",
      items: o.items?.map((i: any) => i.name).join(", "),
      amount: `₹${o.finalAmount?.toLocaleString()}`,
      payment: o.paymentMethod === "cod" ? "COD" : "Razorpay",
      refundStatus: o.paymentStatus,
      reason: o.shippingStatus === "cancelled" ? "Customer cancelled" : "Quality/Size issue",
      date: new Date(o.createdAt).toLocaleDateString("en-IN"),
    }))
    await exportToExcel({
      title: "Returns & Refunds Report",
      sheetName: "Returns",
      filename: "VCHUKI_Returns",
      columns: [
        { header: "Order ID", key: "orderId", width: 14 },
        { header: "Type", key: "type", width: 12 },
        { header: "Items", key: "items", width: 35 },
        { header: "Amount", key: "amount", width: 12 },
        { header: "Payment", key: "payment", width: 12 },
        { header: "Refund Status", key: "refundStatus", width: 14 },
        { header: "Reason", key: "reason", width: 25 },
        { header: "Date", key: "date", width: 12 },
      ],
      data: exportData,
    })
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading returns...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground">Returns & Refunds</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage return requests and process refunds</p>
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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-amber-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Returns</span></div><p className="text-xl font-light text-foreground mt-1">{returns.length}</p></div>
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-red-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cancelled</span></div><p className="text-xl font-light text-foreground mt-1">{cancelled.length}</p></div>
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><IndianRupee className="h-3.5 w-3.5 text-[#c4956a]" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Refund Value</span></div><p className="text-xl font-light text-foreground mt-1">₹{totalRefund.toLocaleString()}</p></div>
        <div className="p-3 border border-border bg-card"><div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Return Rate</span></div><p className="text-xl font-light text-foreground mt-1">{orders.length > 0 ? ((allReturns.length / orders.length) * 100).toFixed(1) : 0}%</p></div>
      </div>

      {/* Select All */}
      {allReturns.length > 0 && (
        <label className="flex items-center gap-2 text-[10px] text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={selected.size === allReturns.length && allReturns.length > 0} onChange={toggleAll} className="accent-[#c4956a]" />
          Select All ({allReturns.length})
        </label>
      )}

      {/* Return Requests */}
      {allReturns.length === 0 ? (
        <div className="text-center py-12 border border-border">
          <RotateCcw className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No returns or cancellations yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allReturns.map(order => (
            <div key={order._id} className={`p-4 border bg-card transition-colors ${selected.has(order._id) ? "border-[#c4956a]/30 bg-[#c4956a]/5" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selected.has(order._id)} onChange={() => toggleSelect(order._id)} className="accent-[#c4956a]" />
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${order.shippingStatus === "returned" ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                    {order.shippingStatus === "returned" ? <RotateCcw className="h-3.5 w-3.5 text-amber-500" /> : <XCircle className="h-3.5 w-3.5 text-red-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono font-medium text-foreground">#{order._id?.slice(-8).toUpperCase()}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 font-medium ${order.shippingStatus === "returned" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-500"}`}>
                        {order.shippingStatus}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {order.items?.map((i: any) => i.name).join(", ")} · {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">₹{order.finalAmount?.toLocaleString()}</span>
                  {order.paymentStatus !== "refunded" && order.paymentMethod !== "cod" && (
                    <button onClick={() => processRefund(order._id)} className="px-3 py-1.5 text-[10px] font-medium border border-border hover:border-emerald-500/30 hover:bg-emerald-500/5 text-foreground transition-colors">
                      Process Refund
                    </button>
                  )}
                  {order.paymentStatus === "refunded" && (
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 font-medium">Refunded</span>
                  )}
                  <button onClick={() => singleDelete(order._id)} className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[10px] text-muted-foreground">
                  <span className="font-medium text-foreground">Reason:</span> {order.shippingStatus === "cancelled" ? "Customer cancelled before dispatch" : "Product quality / size issue"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  <span className="font-medium text-foreground">Payment:</span> {order.paymentMethod === "cod" ? "COD — No refund needed" : `${order.paymentMethod} — ${order.paymentStatus}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
