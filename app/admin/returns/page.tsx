"use client"

import { useEffect, useState } from "react"
import { RotateCcw, IndianRupee, CheckCircle, XCircle } from "lucide-react"

export default function AdminReturnsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
  }, [])

  const returns = orders.filter(o => o.shippingStatus === "returned")
  const cancelled = orders.filter(o => o.shippingStatus === "cancelled")
  const allReturns = [...returns, ...cancelled]
  const totalRefund = allReturns.reduce((s, o) => s + (o.finalAmount || 0), 0)

  async function processRefund(id: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ paymentStatus: "refunded" }),
    })
    setOrders(orders.map(o => o._id === id ? { ...o, paymentStatus: "refunded" } : o))
  }

  if (loading) return <div className="text-sm text-muted-foreground animate-pulse p-4">Loading returns...</div>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-medium tracking-tight text-foreground">Returns & Refunds</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage return requests and process refunds</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><RotateCcw className="h-3.5 w-3.5 text-amber-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Returns</span></div>
          <p className="text-xl font-light text-foreground mt-1">{returns.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><XCircle className="h-3.5 w-3.5 text-red-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Cancelled</span></div>
          <p className="text-xl font-light text-foreground mt-1">{cancelled.length}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><IndianRupee className="h-3.5 w-3.5 text-[#c4956a]" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Refund Value</span></div>
          <p className="text-xl font-light text-foreground mt-1">₹{totalRefund.toLocaleString()}</p>
        </div>
        <div className="p-3 border border-border bg-card">
          <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Return Rate</span></div>
          <p className="text-xl font-light text-foreground mt-1">{orders.length > 0 ? ((allReturns.length / orders.length) * 100).toFixed(1) : 0}%</p>
        </div>
      </div>

      {/* Return Requests */}
      {allReturns.length === 0 ? (
        <div className="text-center py-12 border border-border">
          <RotateCcw className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No returns or cancellations yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allReturns.map(order => (
            <div key={order._id} className="p-4 border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                </div>
              </div>

              {/* Return reason */}
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
