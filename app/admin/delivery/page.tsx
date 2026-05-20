"use client"
import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react"

const icons: Record<string, any> = { pending: Clock, shipped: Truck, delivered: CheckCircle, cancelled: XCircle }
const colors: Record<string, string> = { pending: "text-yellow-500", shipped: "text-blue-500", delivered: "text-green-500", cancelled: "text-red-500" }

export default function AdminDeliveryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/orders").then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false) }) }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shippingStatus: status }) })
    setOrders(orders.map(o => o._id === id ? { ...o, shippingStatus: status } : o))
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.shippingStatus === filter)

  if (loading) return <div className="text-sm text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-semibold tracking-tight">Delivery</h1><p className="text-xs text-muted-foreground mt-0.5">Track and manage shipments</p></div>
      <div className="flex gap-1 border-b">
        {["all","pending","shipped","delivered","cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 text-xs capitalize border-b-2 transition-colors ${filter === s ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map(order => {
          const Icon = icons[order.shippingStatus] || Package
          return (
            <div key={order._id} className="p-4 rounded-lg border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${colors[order.shippingStatus] || ""}`} />
                <div>
                  <p className="text-xs font-medium font-mono">#{order._id?.slice(-8)}</p>
                  <p className="text-[11px] text-muted-foreground">{order.shippingAddress?.city}, {order.shippingAddress?.state} · ₹{order.finalAmount?.toLocaleString()}</p>
                </div>
              </div>
              <select value={order.shippingStatus} onChange={e => updateStatus(order._id, e.target.value)} className="text-[10px] bg-transparent border rounded px-2 py-1">
                <option value="pending">Pending</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}
